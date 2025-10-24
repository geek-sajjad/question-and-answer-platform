#!/usr/bin/env node

/**
 * Performance Comparison Script
 *
 * This script runs both the original DatabaseSeeder and the optimized DatabaseSeederV2
 * to demonstrate the performance improvements achieved through optimization.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PerformanceResult {
  seeder: string;
  duration: number;
  recordsPerSecond: number;
  memoryUsage?: number;
}

class PerformanceComparator {
  private results: PerformanceResult[] = [];

  async runComparison() {
    console.log('🔬 Database Seeder Performance Comparison');
    console.log('==========================================\n');

    // Test with smaller dataset for comparison
    const testConfig = {
      users: 1000,
      questions: 100,
      answers: 300,
      tags: 20,
      votesPerAnswer: '2-5',
    };

    console.log('📊 Test Configuration:');
    console.log(`   Users: ${testConfig.users}`);
    console.log(`   Questions: ${testConfig.questions}`);
    console.log(`   Answers: ${testConfig.answers}`);
    console.log(`   Tags: ${testConfig.tags}`);
    console.log(`   Votes per answer: ${testConfig.votesPerAnswer}\n`);

    try {
      // Run original seeder
      console.log('🐌 Running Original DatabaseSeeder...');
      const originalResult = await this.runSeeder('original');
      this.results.push(originalResult);

      console.log('\n' + '='.repeat(50) + '\n');

      // Run optimized seeder V2
      console.log('⚡ Running Optimized DatabaseSeederV2...');
      const optimizedResult = await this.runSeeder('v2');
      this.results.push(optimizedResult);

      // Display comparison results
      this.displayComparisonResults();
    } catch (error) {
      console.error('❌ Error during comparison:', error);
      process.exit(1);
    }
  }

  private async runSeeder(
    version: 'original' | 'v2',
  ): Promise<PerformanceResult> {
    const startTime = Date.now();

    try {
      if (version === 'original') {
        // Run original seeder with test config
        await execAsync('npm run seed:test');
      } else {
        // Run optimized seeder V2 with test config
        await execAsync('npm run seed:v2:test');
      }
    } catch (error) {
      console.error(`❌ Error running ${version} seeder:`, error);
      throw error;
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    const totalRecords = 1000 + 100 + 300 + 20 + 300 * 3.5; // users + questions + answers + tags + avg votes
    const recordsPerSecond = Math.round(totalRecords / duration);

    const result: PerformanceResult = {
      seeder:
        version === 'original'
          ? 'Original DatabaseSeeder'
          : 'Optimized DatabaseSeederV2',
      duration,
      recordsPerSecond,
    };

    console.log(
      `✅ ${result.seeder} completed in ${duration.toFixed(2)} seconds`,
    );
    console.log(`📈 Performance: ${recordsPerSecond} records/second`);

    return result;
  }

  private displayComparisonResults() {
    console.log('\n🏆 PERFORMANCE COMPARISON RESULTS');
    console.log('==================================\n');

    const original = this.results.find((r) => r.seeder.includes('Original'));
    const optimized = this.results.find((r) => r.seeder.includes('Optimized'));

    if (!original || !optimized) {
      console.error('❌ Missing results for comparison');
      return;
    }

    const speedImprovement = original.duration / optimized.duration;
    const recordsImprovement =
      optimized.recordsPerSecond / original.recordsPerSecond;

    console.log('📊 Detailed Comparison:');
    console.log('----------------------');
    console.log(
      `Original Seeder:     ${original.duration.toFixed(2)}s (${original.recordsPerSecond} records/s)`,
    );
    console.log(
      `Optimized Seeder:    ${optimized.duration.toFixed(2)}s (${optimized.recordsPerSecond} records/s)`,
    );
    console.log('');
    console.log('🚀 Performance Improvements:');
    console.log('----------------------------');
    console.log(`Speed Improvement:   ${speedImprovement.toFixed(1)}x faster`);
    console.log(
      `Records/Second:      ${recordsImprovement.toFixed(1)}x improvement`,
    );
    console.log(
      `Time Saved:          ${(original.duration - optimized.duration).toFixed(2)} seconds`,
    );
    console.log(
      `Efficiency Gain:     ${((speedImprovement - 1) * 100).toFixed(1)}%`,
    );

    console.log('\n💡 Key Optimizations Applied:');
    console.log('-----------------------------');
    console.log('• Pre-shuffle users once instead of per-answer shuffling');
    console.log('• Efficient random selection with collision avoidance');
    console.log('• Fisher-Yates shuffle algorithm (O(n) vs O(n log n))');
    console.log('• Bulk SQL insert option for maximum performance');
    console.log('• Memory-efficient array operations');

    console.log('\n🎯 Recommendation:');
    console.log('------------------');
    if (speedImprovement > 5) {
      console.log('✅ Significant performance improvement achieved!');
      console.log('   Use DatabaseSeederV2 for production seeding.');
    } else if (speedImprovement > 2) {
      console.log('✅ Good performance improvement achieved.');
      console.log('   DatabaseSeederV2 is recommended for large datasets.');
    } else {
      console.log(
        '⚠️  Moderate improvement. Consider dataset size and requirements.',
      );
    }
  }
}

// Run the comparison
async function main() {
  const comparator = new PerformanceComparator();
  await comparator.runComparison();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { PerformanceComparator };
