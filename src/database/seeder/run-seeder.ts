import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DatabaseSeeder } from './database.seeder';
import {
  SeederConfig,
  DEFAULT_SEEDER_CONFIG,
  TEST_SEEDER_CONFIG,
} from './seeder.config';

class SeederRunner {
  private dataSource: DataSource;
  private seeder: DatabaseSeeder;

  constructor() {
    this.dataSource = new DataSource({
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

    this.seeder = new DatabaseSeeder(this.dataSource);
  }

  async run(config: SeederConfig = DEFAULT_SEEDER_CONFIG): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting database seeding...');
      console.log(`📊 Configuration:`);
      console.log(`   Users: ${config.users.count}`);
      console.log(`   Questions: ${config.questions.count}`);
      console.log(`   Answers: ${config.answers.count}`);
      console.log(`   Tags: ${config.tags.count}`);
      console.log(
        `   Votes: ${config.votes.minPerAnswer}-${config.votes.maxPerAnswer} per answer`,
      );
      console.log(
        `   Question-Tags: ${config.questionTags.minPerQuestion}-${config.questionTags.maxPerQuestion} per question`,
      );
      console.log('');

      // Connect to database
      await this.dataSource.initialize();
      console.log('✅ Connected to database');

      // Clear existing data
      await this.seeder.clearDatabase();

      // Seed data in dependency order
      const users = await this.seeder.seedUsers(
        config.users.count,
        config.users.batchSize,
      );

      const tags = await this.seeder.seedTags(
        config.tags.count,
        config.tags.batchSize,
      );

      const questions = await this.seeder.seedQuestions(
        config.questions.count,
        config.questions.batchSize,
        users,
        tags,
      );

      const answers = await this.seeder.seedAnswers(
        config.answers.count,
        config.answers.batchSize,
        users,
        questions,
      );

      await this.seeder.seedVotes(
        answers,
        users,
        config.votes.minPerAnswer,
        config.votes.maxPerAnswer,
        config.votes.batchSize,
      );

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log('');
      console.log('🎉 Seeding completed successfully!');
      console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
      console.log(`📈 Data seeded:`);
      console.log(`   Users: ${users.length}`);
      console.log(`   Tags: ${tags.length}`);
      console.log(`   Questions: ${questions.length}`);
      console.log(`   Answers: ${answers.length}`);
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        console.log('🔌 Database connection closed');
      }
    }
  }

  async runTest(): Promise<void> {
    console.log('🧪 Running test seeding with smaller dataset...');
    await this.run(TEST_SEEDER_CONFIG);
  }

  async runProduction(): Promise<void> {
    console.log('🏭 Running production seeding with full dataset...');
    await this.run(DEFAULT_SEEDER_CONFIG);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const runner = new SeederRunner();

  try {
    switch (command) {
      case 'test':
        await runner.runTest();
        break;
      case 'production':
        await runner.runProduction();
        break;
      case 'custom':
        // Allow custom configuration via environment variables
        const customConfig: SeederConfig = {
          users: {
            count: parseInt(process.env.SEEDER_USERS_COUNT || '1000'),
            batchSize: parseInt(process.env.SEEDER_USERS_BATCH_SIZE || '100'),
          },
          questions: {
            count: parseInt(process.env.SEEDER_QUESTIONS_COUNT || '500'),
            batchSize: parseInt(
              process.env.SEEDER_QUESTIONS_BATCH_SIZE || '50',
            ),
          },
          answers: {
            count: parseInt(process.env.SEEDER_ANSWERS_COUNT || '1500'),
            batchSize: parseInt(process.env.SEEDER_ANSWERS_BATCH_SIZE || '50'),
          },
          tags: {
            count: parseInt(process.env.SEEDER_TAGS_COUNT || '50'),
            batchSize: parseInt(process.env.SEEDER_TAGS_BATCH_SIZE || '25'),
          },
          votes: {
            minPerAnswer: parseInt(process.env.SEEDER_VOTES_MIN || '2'),
            maxPerAnswer: parseInt(process.env.SEEDER_VOTES_MAX || '5'),
            batchSize: parseInt(process.env.SEEDER_VOTES_BATCH_SIZE || '100'),
          },
          questionTags: {
            minPerQuestion: parseInt(
              process.env.SEEDER_QUESTION_TAGS_MIN || '1',
            ),
            maxPerQuestion: parseInt(
              process.env.SEEDER_QUESTION_TAGS_MAX || '3',
            ),
            batchSize: parseInt(
              process.env.SEEDER_QUESTION_TAGS_BATCH_SIZE || '100',
            ),
          },
        };
        await runner.run(customConfig);
        break;
      default:
        console.log('Usage: npm run seed [test|production|custom]');
        console.log('');
        console.log('Commands:');
        console.log('  test       - Run with small dataset for testing');
        console.log(
          '  production - Run with full dataset (500k users, 50k questions, etc.)',
        );
        console.log(
          '  custom     - Run with custom configuration via environment variables',
        );
        console.log('');
        console.log('Environment variables for custom mode:');
        console.log('  SEEDER_USERS_COUNT, SEEDER_USERS_BATCH_SIZE');
        console.log('  SEEDER_QUESTIONS_COUNT, SEEDER_QUESTIONS_BATCH_SIZE');
        console.log('  SEEDER_ANSWERS_COUNT, SEEDER_ANSWERS_BATCH_SIZE');
        console.log('  SEEDER_TAGS_COUNT, SEEDER_TAGS_BATCH_SIZE');
        console.log(
          '  SEEDER_VOTES_MIN, SEEDER_VOTES_MAX, SEEDER_VOTES_BATCH_SIZE',
        );
        console.log(
          '  SEEDER_QUESTION_TAGS_MIN, SEEDER_QUESTION_TAGS_MAX, SEEDER_QUESTION_TAGS_BATCH_SIZE',
        );
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { SeederRunner };
