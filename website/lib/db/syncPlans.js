import { fetchAndParseCSV } from '../plans/fetchAndParseCSV.js';
import { prisma } from './prisma.js';
import { Decimal } from 'decimal.js';

function extractNumberAndUnit(fieldName, str) {
  if (!str || typeof str !== 'string') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  const normalized = str.toLowerCase().trim();
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?/i);
  
  if (!match) {
    return null;
  }

  return {
    value: parseFloat(match[1]),
    unit: match[2]?.toLowerCase() || null
  };
}

function parseDataValue(fupString) {
  const parsed = extractNumberAndUnit('FUP', fupString);

  if (!parsed) {
    return new Decimal(0); // for "unlimited" etc
  }
  
  if (!parsed.unit) {
    throw new Error(`Data unit missing in FUP string: ${fupString}`);
  }
  if (parsed.unit !== 'gb' && parsed.unit !== 'mb') {
    throw new Error(`Unknown data unit: ${parsed.unit}`);
  }
  
  // Convert to GB
  if (parsed.unit === 'mb') {
    return new Decimal(parsed.value / 1000);
  }
  
  return new Decimal(parsed.value);
}

function parseCountryCodes(countryCodesString) {
  if (!countryCodesString || typeof countryCodesString !== 'string') {
    throw new Error('countryCodes must be a non-empty string');
  }
  
  return countryCodesString
    .split(',')
    .map(code => code.trim().toUpperCase())
    .filter(code => code.length > 0);
}

function parseOperators(operatorsString) {
  if (!operatorsString || typeof operatorsString !== 'string') {
    return [];
  }
  
  return operatorsString
    .split(',')
    .map(op => op.trim())
    .filter(op => op.length > 0);
}

function parseReducedSpeed(speedString) {
  const parsed = extractNumberAndUnit('Reduced speed', speedString);
  
  if (!parsed) {
    return 0;
  }
  
  if (!parsed.unit) {
    throw new Error(`Speed unit missing in reduced speed string: ${speedString}`);
  }
  if (parsed.unit !== 'mbps' && parsed.unit !== 'kbps') {
    throw new Error(`Unknown data unit: ${parsed.unit}`);
  }
  
  // Convert to kbps
  if (parsed.unit === 'mbps') {
    return Math.round(parsed.value * 1000);
  }
  
  return Math.round(parsed.value);
}

function createSlug(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function generateUniqueName(planData) {
  const combined = `${planData.productId}-${planData.name}-${planData.days}-${planData.fup}`;
  return createSlug(combined);
}

function transformCsvDataToPlan(planCsvData) { 
  const planData = {
    productId: planCsvData.productId,
    code: planCsvData.code,
    name: planCsvData.name,
    days: parseInt(planCsvData.validity),
    limited: Boolean(planCsvData.isLimited),
    fup: planCsvData.dataCap,
    data: parseDataValue(planCsvData.dataCap),
    reducedSpeed: parseReducedSpeed(planCsvData.reducedSpeed),
    price: new Decimal(planCsvData.price),
    reloadable: Boolean(planCsvData.isReloadable),
    countryCodes: parseCountryCodes(planCsvData.countryCodes),
    ipRoute: planCsvData.ipRoute || null,
    operators: parseOperators(planCsvData.operators),
    apn: planCsvData.apn || null,
    salePrice: planCsvData.salePrice ? new Decimal(planCsvData.salePrice) : null,
    isPopular: Boolean(planCsvData.isPopular),
  };
  
  planData.uniqueName = generateUniqueName(planData);
  
  return planData;
}

export async function syncPlansFromCSV() {
  
  try {
    // Fetch CSV data
    console.log('Fetching CSV data...');
    const allCsvData = await fetchAndParseCSV();
    console.log(`Found ${allCsvData.length} plans in CSV`);
    
    // Transform data
    const transformedPlans = allCsvData.map(transformCsvDataToPlan);
    const csvUniqueNames = new Set(transformedPlans.map(p => p.uniqueName));
    
    // Get existing uniqueNames from database
    const existingPlans = await prisma.plan.findMany({});
    const existingUniqueNames = new Set(existingPlans.map(p => p.uniqueName));
    
    // Upsert plans (create + update)
    console.log('Upserting plans...');
    let upserted = 0;
    
    for (const planData of transformedPlans) {
      try {
        await prisma.plan.upsert({
          where: { uniqueName: planData.uniqueName },
          update: planData,
          create: planData
        });
        upserted++;
        
        if (upserted % 10 === 0) {
          console.log(`Upserted ${upserted}/${transformedPlans.length} plans`);
        }
      } catch (error) {
        console.error(`❌ Error upserting plan ${planData.uniqueName}:`, error.message);
        // Continue with next plan
      }
    }
    console.log(`Upserted ${upserted} plans total`);

    // Delete plans not in CSV anymore
    const plansToDelete = [...existingUniqueNames].filter(name => !csvUniqueNames.has(name));
    let deleted = 0;
    
    if (plansToDelete.length > 0) {
      console.log(`Deleting ${plansToDelete.length} removed plans...`);
      try {
        const deleteResult = await prisma.plan.deleteMany({
          where: {
            uniqueName: { in: plansToDelete }
          }
        });
        deleted = deleteResult.count;
        console.log(`Deleted ${deleted} plans`);
      } catch (error) {
        console.error(`❌ Error deleting plans:`, error.message);
      }
    }
    
    console.log(`Plan sync completed! Upserted: ${upserted}, Deleted: ${deleted}`);
    
    // Return summary
    return {
      success: true,
      totalFromCsv: allCsvData.length,
      upserted,
      deleted
    };
    
  } catch (error) {
    console.error('❌ Plan sync failed:', error.message);
    throw error;
  }
}

export async function getPlanStats() {
  const total = await prisma.plan.count();
  const countries = await prisma.plan.findMany({
    select: { countryCodes: true },
    distinct: ['countryCodes']
  });
  
  const uniqueCountries = new Set();
  countries.forEach(plan => {
    plan.countryCodes.forEach(code => uniqueCountries.add(code));
  });
  
  return {
    totalPlans: total,
    uniqueCountries: uniqueCountries.size
  };
}
