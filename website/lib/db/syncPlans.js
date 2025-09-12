import { fetchAndParseCSV } from '../plans/fetchAndParseCSV.js';
import { prisma } from './prisma.js';
import { Decimal } from 'decimal.js';

function parseDataValue(fupString) {
  if (!fupString || typeof fupString !== 'string') {
    return new Decimal(0);
  }
  
  const fup = fupString.toLowerCase().trim();
  
  if (fup === 'unlimited' || fup === 'infinite') {
    return new Decimal(0);
  }
  
  // Extract number and unit
  const match = fup.match(/(\d+(?:\.\d+)?)\s*(gb|mb|g|m)?/i);
  if (!match) {
    return new Decimal(0);
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase() || 'gb';
  
  // Convert to GB
  if (unit === 'mb' || unit === 'm') {
    return new Decimal(value / 1000);
  }
  
  return new Decimal(value);
}

function parseCountryCodes(countryCodesString) {
  if (!countryCodesString || typeof countryCodesString !== 'string') {
    return [];
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
  if (!speedString || typeof speedString !== 'string') {
    return 0;
  }
  
  const speed = speedString.toLowerCase().trim();
  
  // Extract number and unit
  const match = speed.match(/(\d+(?:\.\d+)?)\s*(kbps|mbps|k|m)?/i);
  if (!match) {
    return 0;
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase() || 'kbps';
  
  // Convert to kbps
  if (unit === 'mbps' || unit === 'm') {
    return Math.round(value * 1000);
  }
  
  return Math.round(value);
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

function generateUniqueName({ productId, name, days, fup }) {
  const nameSlug = createSlug(name || '');
  const fupSlug = createSlug(fup || '');
  
  return `${productId}-${nameSlug}-${days}d-${fupSlug}`;
}

function transformCsvDataToPlan(csvData) {
  console.log('CSV DATA:', csvData);
  
  const planData = {
    productId: csvData.productId || '',
    code: csvData.code || '',
    name: csvData.name || '',
    days: parseInt(csvData.validity) || 0,
    limited: Boolean(csvData.isLimited),
    fup: csvData.dataCap || '',
    data: parseDataValue(csvData.dataCap),
    reducedSpeed: parseReducedSpeed(csvData.reducedSpeed),
    price: new Decimal(csvData.price || 0),
    reloadable: Boolean(csvData.isReloadable),
    countryCodes: parseCountryCodes(csvData.countryCodes),
    ipRoute: csvData.ipRoute || null,
    operators: parseOperators(csvData.operators),
    apn: csvData.apn || null,
    salePrice: csvData.salePrice ? new Decimal(csvData.salePrice) : null,
  };
  
  // Generate unique name
  planData.uniqueName = generateUniqueName({
    productId: planData.productId,
    name: planData.name,
    days: planData.days,
    fup: planData.fup
  });
  
  return planData;
}

export async function syncPlansFromCSV(options = {}) {
  const { batchSize = 50 } = options;
  
  console.log('🔄 Starting plan sync from CSV...');
  
  try {
    // Fetch CSV data
    console.log('📥 Fetching CSV data...');
    const csvData = await fetchAndParseCSV();
    console.log(`📊 Found ${csvData.length} plans in CSV`);
    
    // Transform data
    console.log('🔄 Transforming data...');
    const transformedPlans = csvData.map(transformCsvDataToPlan);
    const csvUniqueNames = new Set(transformedPlans.map(p => p.uniqueName));
    
    // Get existing uniqueNames from database
    console.log('🔍 Checking existing plans...');
    const existingPlans = await prisma.plan.findMany({
      select: { uniqueName: true }
    });
    const existingUniqueNames = new Set(existingPlans.map(p => p.uniqueName));
    
    // Upsert plans (create + update)
    console.log('💾 Upserting plans...');
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
          console.log(`💾 Upserted ${upserted}/${transformedPlans.length} plans`);
        }
      } catch (error) {
        console.error(`❌ Error upserting plan ${planData.uniqueName}:`, error.message);
        // Continue with next plan
      }
    }
    
    // Delete plans not in CSV anymore
    const plansToDelete = [...existingUniqueNames].filter(name => !csvUniqueNames.has(name));
    let deleted = 0;
    
    if (plansToDelete.length > 0) {
      console.log(`🗑️  Deleting ${plansToDelete.length} removed plans...`);
      try {
        const deleteResult = await prisma.plan.deleteMany({
          where: {
            uniqueName: { in: plansToDelete }
          }
        });
        deleted = deleteResult.count;
        console.log(`🗑️  Deleted ${deleted} plans`);
      } catch (error) {
        console.error(`❌ Error deleting plans:`, error.message);
      }
    }
    
    console.log(`✅ Plan sync completed! Upserted: ${upserted}, Deleted: ${deleted}`);
    
    // Return summary
    return {
      success: true,
      totalFromCsv: csvData.length,
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
