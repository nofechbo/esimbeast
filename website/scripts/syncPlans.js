#!/usr/bin/env node

import { syncPlansFromCSV, getPlanStats } from '../lib/db/syncPlans.js';
import { prisma } from '../lib/db/prisma.js';

async function main() {
  console.log('Starting plan synchronization...\n');
  
  try {
    // Show current stats
    console.log('Current database stats:');
    const beforeStats = await getPlanStats();
    console.log(`   Plans: ${beforeStats.totalPlans}`);
    console.log(`   Countries: ${beforeStats.uniqueCountries}\n`);
    
    // Sync plans
    const result = await syncPlansFromCSV();
    
    // Show updated stats
    console.log('\nUpdated database stats:');
    const afterStats = await getPlanStats();
    console.log(`   Plans: ${afterStats.totalPlans}`);
    console.log(`   Countries: ${afterStats.uniqueCountries}`);
    
    console.log('\nSync completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();