import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DatabaseSeederV2 } from './database.seeder.v2';
import { SeederConfig, DEFAULT_SEEDER_CONFIG } from './seeder.config';

/**
 * Runner script for DatabaseSeederV2 - Optimized version
 *
 * Performance improvements:
 * 1. Pre-shuffle users once instead of shuffling for each answer (O(n) vs O(n log n))
 * 2. Efficient random selection without additional array operations
 * 3. Better progress tracking
 * 4. Optional bulk SQL insert for maximum performance
 */
async function runSeederV2(config: SeederConfig = DEFAULT_SEEDER_CONFIG) {
  console.log('🚀 Starting Database Seeder V2 (Optimized)...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'myapp',
    entities: ['src/modules/**/*.entity.ts', 'dist/modules/**/*.entity.js'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    const seeder = new DatabaseSeederV2(dataSource);

    // Clear existing data
    await seeder.clearDatabase();

    // Seed data with optimized performance
    const startTime = Date.now();

    console.log('\n📊 Seeding Configuration:');
    console.log(`   Users: ${config.users.count}`);
    console.log(`   Tags: ${config.tags.count}`);
    console.log(`   Questions: ${config.questions.count}`);
    console.log(`   Answers: ${config.answers.count}`);
    console.log(
      `   Votes per answer: ${config.votes.minPerAnswer}-${config.votes.maxPerAnswer}`,
    );
    console.log(`   Batch size: ${config.users.batchSize}`);
    console.log('');

    // Seed users
    const users = await seeder.seedUsers(
      config.users.count,
      config.users.batchSize,
    );

    // Seed tags
    const tags = await seeder.seedTags(
      config.tags.count,
      config.tags.batchSize,
    );

    // Seed questions
    const questions = await seeder.seedQuestions(
      config.questions.count,
      config.questions.batchSize,
      users,
      tags,
    );

    // Seed answers
    const answers = await seeder.seedAnswers(
      config.answers.count,
      config.answers.batchSize,
      users,
      questions,
    );

    // Seed votes with optimized method
    console.log('\n⚡ Using optimized vote seeding...');
    await seeder.seedVotes(
      answers,
      users,
      config.votes.minPerAnswer,
      config.votes.maxPerAnswer,
      config.votes.batchSize,
    );

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`⏱️  Total time: ${totalTime.toFixed(2)} seconds`);
    console.log(
      `📈 Performance: ${Math.round((users.length + tags.length + questions.length + answers.length) / totalTime)} records/second`,
    );

    // Optional: Test bulk insert method for comparison
    if (config.enableBulkInsertTest) {
      console.log('\n🧪 Testing bulk insert method...');
      await seeder.clearDatabase();

      const bulkStartTime = Date.now();

      // Re-seed basic data quickly
      const bulkUsers = await seeder.seedUsers(100, 100);
      const bulkTags = await seeder.seedTags(50, 50);
      const bulkQuestions = await seeder.seedQuestions(
        200,
        100,
        bulkUsers,
        bulkTags,
      );
      const bulkAnswers = await seeder.seedAnswers(
        500,
        100,
        bulkUsers,
        bulkQuestions,
      );

      // Test bulk insert for votes
      await seeder.seedVotesBulk(
        bulkAnswers,
        bulkUsers,
        config.votes.minPerAnswer,
        config.votes.maxPerAnswer,
        config.votes.batchSize,
      );

      const bulkEndTime = Date.now();
      const bulkTime = (bulkEndTime - bulkStartTime) / 1000;

      console.log(`⚡ Bulk insert time: ${bulkTime.toFixed(2)} seconds`);
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeder
if (require.main === module) {
  runSeederV2().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { runSeederV2 };
