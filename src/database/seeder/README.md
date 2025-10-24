# Database Seeder

This directory contains a comprehensive database seeder for the Question-and-Answer platform. The seeder can generate realistic test data including users, questions, answers, tags, and votes with proper relationships.

## Features

- **Realistic Data Generation**: Creates meaningful questions, answers, and user profiles
- **Batch Processing**: Handles large datasets efficiently with configurable batch sizes
- **Relationship Management**: Properly seeds many-to-many relationships (question-tags, votes)
- **Progress Tracking**: Shows real-time progress during seeding
- **Error Handling**: Robust error handling with rollback capabilities
- **Configurable**: Multiple configuration presets and custom options

## Quick Start

### Prerequisites

1. Make sure your database is running and accessible
2. Run migrations to ensure the database schema is up to date:
   ```bash
   npm run migration:run
   ```

### Running the Seeder

#### Test Mode (Small Dataset)
Perfect for development and testing:
```bash
npm run seed:test
```

This will seed:
- 100 users
- 50 questions  
- 150 answers
- 20 tags
- 2-5 votes per answer
- 1-2 tags per question

#### Production Mode (Full Dataset)
For production-like data volumes:
```bash
npm run seed:production
```

This will seed:
- 500,000 users
- 50,000 questions
- 150,000 answers
- 100 tags
- 3-10 votes per answer
- 1-3 tags per question

#### Custom Mode
Use environment variables to customize the seeding:
```bash
SEEDER_USERS_COUNT=1000 SEEDER_QUESTIONS_COUNT=500 npm run seed:custom
```

## Configuration

### Environment Variables for Custom Mode

| Variable | Description | Default |
|----------|-------------|---------|
| `SEEDER_USERS_COUNT` | Number of users to create | 1000 |
| `SEEDER_USERS_BATCH_SIZE` | Batch size for user creation | 100 |
| `SEEDER_QUESTIONS_COUNT` | Number of questions to create | 500 |
| `SEEDER_QUESTIONS_BATCH_SIZE` | Batch size for question creation | 50 |
| `SEEDER_ANSWERS_COUNT` | Number of answers to create | 1500 |
| `SEEDER_ANSWERS_BATCH_SIZE` | Batch size for answer creation | 50 |
| `SEEDER_TAGS_COUNT` | Number of tags to create | 50 |
| `SEEDER_TAGS_BATCH_SIZE` | Batch size for tag creation | 25 |
| `SEEDER_VOTES_MIN` | Minimum votes per answer | 2 |
| `SEEDER_VOTES_MAX` | Maximum votes per answer | 5 |
| `SEEDER_VOTES_BATCH_SIZE` | Batch size for vote creation | 100 |
| `SEEDER_QUESTION_TAGS_MIN` | Minimum tags per question | 1 |
| `SEEDER_QUESTION_TAGS_MAX` | Maximum tags per question | 3 |
| `SEEDER_QUESTION_TAGS_BATCH_SIZE` | Batch size for question-tag relationships | 100 |

### Configuration Files

The seeder uses predefined configurations in `seeder.config.ts`:

- `DEFAULT_SEEDER_CONFIG`: Production-scale data (500k users, 50k questions, etc.)
- `TEST_SEEDER_CONFIG`: Small dataset for testing (100 users, 50 questions, etc.)

## Data Generation Details

### Users
- Realistic names using common first and last names
- Unique email addresses (user1@example.com, user2@example.com, etc.)
- Automatic timestamps for creation and updates

### Questions
- Technology-focused questions with realistic titles and descriptions
- Questions cover topics like authentication, APIs, databases, frameworks
- Each question is assigned to a random user
- Questions are tagged with 1-3 random tags

### Answers
- Detailed, helpful answers with code examples
- Multiple answer templates for variety
- Each answer is assigned to a random user and question
- 10% chance of being marked as accepted

### Tags
- Technology-focused tags (JavaScript, TypeScript, NestJS, PostgreSQL, etc.)
- Unique tag names
- Covers programming languages, frameworks, databases, tools, and concepts

### Votes
- Random distribution between upvotes (70%) and downvotes (30%)
- Each answer receives 3-10 votes from different users
- Ensures no duplicate votes from the same user on the same answer

## Performance Considerations

### Batch Processing
The seeder uses batch processing to handle large datasets efficiently:
- Users: 1,000 per batch (production), 50 per batch (test)
- Questions: 500 per batch (production), 25 per batch (test)
- Answers: 500 per batch (production), 50 per batch (test)
- Votes: 1,000 per batch (production), 100 per batch (test)

### Memory Management
- Data is processed in batches to avoid memory issues
- Progress is tracked and displayed in real-time
- Database connections are properly managed

### Estimated Times
- Test mode: ~30 seconds
- Production mode: ~30-60 minutes (depending on hardware)

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure your database is running
   - Check your `.env` file for correct database credentials
   - Verify the database exists

2. **Memory Issues**
   - Reduce batch sizes in custom mode
   - Ensure sufficient RAM available
   - Consider running on a machine with more memory

3. **Timeout Errors**
   - Increase database timeout settings
   - Reduce batch sizes
   - Check database performance

4. **Duplicate Key Errors**
   - The seeder clears existing data before running
   - If you encounter duplicates, check for concurrent runs
   - Ensure unique constraints are properly set

### Logs and Debugging

The seeder provides detailed console output:
- Progress indicators for each entity type
- Error messages with context
- Final statistics and timing information

## Development

### Adding New Data Types

To add new entity types to the seeder:

1. Add the entity to the `DatabaseSeeder` class
2. Create generation methods following the existing patterns
3. Update the configuration interface
4. Add the seeding step to the main runner

### Modifying Data Generation

The data generation methods are designed to be easily customizable:
- `generateQuestionContent()`: Modify question templates
- `generateAnswerContent()`: Modify answer templates  
- `generateRandomName()`: Modify user name generation
- `generateTagBatch()`: Modify tag generation

## Safety Features

- **Data Clearing**: Automatically clears existing data before seeding
- **Transaction Safety**: Uses database transactions where appropriate
- **Error Recovery**: Proper error handling with cleanup
- **Validation**: Ensures data integrity and relationships

## Example Usage

```bash
# Quick test with small dataset
npm run seed:test

# Full production dataset
npm run seed:production

# Custom configuration
SEEDER_USERS_COUNT=5000 SEEDER_QUESTIONS_COUNT=1000 npm run seed:custom

# Check seeder help
npm run seed
```

The seeder will automatically handle all relationships and ensure data consistency across all entities.
