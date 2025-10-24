import { SeederRunner } from './run-seeder';
import { SeederConfig } from './seeder.config';

/**
 * Example script showing how to use the seeder programmatically
 */
async function exampleUsage() {
  const runner = new SeederRunner();

  // Example 1: Run with test configuration
  console.log('Running test seeder...');
  await runner.runTest();

  // Example 2: Run with custom configuration
  const customConfig: SeederConfig = {
    users: {
      count: 1000,
      batchSize: 100,
    },
    questions: {
      count: 500,
      batchSize: 50,
    },
    answers: {
      count: 1500,
      batchSize: 50,
    },
    tags: {
      count: 50,
      batchSize: 25,
    },
    votes: {
      minPerAnswer: 2,
      maxPerAnswer: 5,
      batchSize: 100,
    },
    questionTags: {
      minPerQuestion: 1,
      maxPerQuestion: 3,
      batchSize: 100,
    },
  };

  console.log('Running custom seeder...');
  await runner.run(customConfig);

  // Example 3: Run with production configuration
  console.log('Running production seeder...');
  await runner.runProduction();
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}

export { exampleUsage };
