#!/usr/bin/env node

import { syncPlansFromCSV, getPlanStats } from '../lib/db/syncPlans.js';
import { prisma } from '../lib/db/prisma.js';

async function main() {
  console.log('🚀 Starting plan synchronization...\n');
  
  try {
    // Show current stats
    console.log('📊 Current database stats:');
    const beforeStats = await getPlanStats();
    console.log(`   Plans: ${beforeStats.totalPlans}`);
    console.log(`   Countries: ${beforeStats.uniqueCountries}\n`);
    
    // Sync plans
    const result = await syncPlansFromCSV({
      deleteExisting: true,
      batchSize: 50
    });
    
    // Show updated stats
    console.log('\n📊 Updated database stats:');
    const afterStats = await getPlanStats();
    console.log(`   Plans: ${afterStats.totalPlans}`);
    console.log(`   Countries: ${afterStats.uniqueCountries}`);
    
    console.log('\n✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/syncPlans.js [options]

Options:
  --help, -h     Show this help message
  --stats, -s    Show current database stats only

This script fetches plan data from the CSV source and syncs it to the database.
It will replace all existing plans with fresh data from the CSV.
`);
  process.exit(0);
}

if (args.includes('--stats') || args.includes('-s')) {
  // Just show stats
  try {
    const stats = await getPlanStats();
    console.log('📊 Database stats:');
    console.log(`   Plans: ${stats.totalPlans}`);
    console.log(`   Countries: ${stats.uniqueCountries}`);
  } catch (error) {
    console.error('❌ Error getting stats:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
  process.exit(0);
}

// Run main sync
main();