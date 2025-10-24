import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Question } from '../../modules/question/entities/question.entity';
import { Answer } from '../../modules/answer/entities/answer.entity';
import { Tag } from '../../modules/tag/entities/tag.entity';
import { Vote } from '../../modules/vote/entities/vote.entity';
import { VoteType } from '../../modules/vote/vote.enums';

export class DatabaseSeeder {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async clearDatabase(): Promise<void> {
    console.log('🗑️  Clearing existing data...');

    // Clear in reverse dependency order using query builder for safety
    await this.dataSource
      .getRepository(Vote)
      .createQueryBuilder()
      .delete()
      .execute();
    await this.dataSource
      .getRepository(Answer)
      .createQueryBuilder()
      .delete()
      .execute();
    await this.dataSource
      .getRepository(Question)
      .createQueryBuilder()
      .delete()
      .execute();
    await this.dataSource
      .getRepository(Tag)
      .createQueryBuilder()
      .delete()
      .execute();
    await this.dataSource
      .getRepository(User)
      .createQueryBuilder()
      .delete()
      .execute();

    console.log('✅ Database cleared successfully');
  }

  async seedUsers(count: number, batchSize: number): Promise<User[]> {
    console.log(`👥 Seeding ${count} users...`);
    const users: User[] = [];

    for (let i = 0; i < count; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, count - i);
      const batch = this.generateUserBatch(currentBatchSize, i);

      const savedUsers = await this.dataSource.getRepository(User).save(batch);
      users.push(...savedUsers);

      console.log(
        `   Progress: ${Math.min(i + currentBatchSize, count)}/${count} users`,
      );
    }

    console.log('✅ Users seeded successfully');
    return users;
  }

  async seedTags(count: number, batchSize: number): Promise<Tag[]> {
    console.log(`🏷️  Seeding ${count} tags...`);
    const tags: Tag[] = [];

    for (let i = 0; i < count; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, count - i);
      const batch = this.generateTagBatch(currentBatchSize, i);

      const savedTags = await this.dataSource.getRepository(Tag).save(batch);
      tags.push(...savedTags);

      console.log(
        `   Progress: ${Math.min(i + currentBatchSize, count)}/${count} tags`,
      );
    }

    console.log('✅ Tags seeded successfully');
    return tags;
  }

  async seedQuestions(
    count: number,
    batchSize: number,
    users: User[],
    tags: Tag[],
  ): Promise<Question[]> {
    console.log(`❓ Seeding ${count} questions...`);
    const questions: Question[] = [];

    for (let i = 0; i < count; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, count - i);
      const batch = this.generateQuestionBatch(currentBatchSize, users, tags);

      const savedQuestions = await this.dataSource
        .getRepository(Question)
        .save(batch);
      questions.push(...savedQuestions);

      console.log(
        `   Progress: ${Math.min(i + currentBatchSize, count)}/${count} questions`,
      );
    }

    console.log('✅ Questions seeded successfully');
    return questions;
  }

  async seedAnswers(
    count: number,
    batchSize: number,
    users: User[],
    questions: Question[],
  ): Promise<Answer[]> {
    console.log(`💬 Seeding ${count} answers...`);
    const answers: Answer[] = [];

    for (let i = 0; i < count; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, count - i);
      const batch = this.generateAnswerBatch(
        currentBatchSize,
        users,
        questions,
      );

      const savedAnswers = await this.dataSource
        .getRepository(Answer)
        .save(batch);
      answers.push(...savedAnswers);

      console.log(
        `   Progress: ${Math.min(i + currentBatchSize, count)}/${count} answers`,
      );
    }

    console.log('✅ Answers seeded successfully');
    return answers;
  }

  async seedVotes(
    answers: Answer[],
    users: User[],
    minPerAnswer: number,
    maxPerAnswer: number,
    batchSize: number,
  ): Promise<void> {
    console.log(`🗳️  Seeding votes for ${answers.length} answers...`);

    let totalVotes = 0;
    const voteBatch: Partial<Vote>[] = [];

    for (const answer of answers) {
      const votesPerAnswer = this.getRandomInt(minPerAnswer, maxPerAnswer);
      const answerVotes = this.generateVotesForAnswer(
        answer,
        users,
        votesPerAnswer,
      );

      voteBatch.push(...answerVotes);
      totalVotes += votesPerAnswer;

      if (voteBatch.length >= batchSize) {
        await this.dataSource.getRepository(Vote).save(voteBatch);
        console.log(`   Progress: ${totalVotes} votes created`);
        voteBatch.length = 0; // Clear array
      }
    }

    // Save remaining votes
    if (voteBatch.length > 0) {
      await this.dataSource.getRepository(Vote).save(voteBatch);
    }

    console.log(`✅ ${totalVotes} votes seeded successfully`);
  }

  private generateUserBatch(size: number, offset: number): Partial<User>[] {
    const users: Partial<User>[] = [];

    for (let i = 0; i < size; i++) {
      const userNumber = offset + i + 1;
      users.push({
        name: this.generateRandomName(),
        email: `user${userNumber}@example.com`,
      });
    }

    return users;
  }

  private generateTagBatch(size: number, offset: number): Partial<Tag>[] {
    const tags: Partial<Tag>[] = [];
    const techTags = [
      'JavaScript',
      'TypeScript',
      'Node.js',
      'NestJS',
      'Express',
      'React',
      'Vue',
      'Angular',
      'Python',
      'Django',
      'Flask',
      'FastAPI',
      'Java',
      'Spring Boot',
      'C#',
      '.NET',
      'PHP',
      'Laravel',
      'Symfony',
      'Ruby',
      'Rails',
      'Go',
      'Rust',
      'Swift',
      'Kotlin',
      'Scala',
      'Clojure',
      'Haskell',
      'Elixir',
      'Erlang',
      'R',
      'SQL',
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'Elasticsearch',
      'Docker',
      'Kubernetes',
      'AWS',
      'Azure',
      'GCP',
      'Terraform',
      'Git',
      'GitHub',
      'GitLab',
      'CI/CD',
      'Jenkins',
      'Travis CI',
      'Webpack',
      'Vite',
      'Babel',
      'ESLint',
      'Prettier',
      'Jest',
      'Cypress',
      'Selenium',
      'Playwright',
      'GraphQL',
      'REST API',
      'Microservices',
      'Serverless',
      'Lambda',
      'Firebase',
      'Supabase',
      'Next.js',
      'Nuxt.js',
      'Svelte',
      'Alpine.js',
      'Tailwind CSS',
      'Bootstrap',
      'Material UI',
      'Ant Design',
      'Chakra UI',
      'Styled Components',
      'Redux',
      'MobX',
      'Zustand',
      'Jotai',
      'Recoil',
      'Apollo Client',
      'Prisma',
      'TypeORM',
      'Sequelize',
      'Mongoose',
      'Knex.js',
      'WebSocket',
      'Socket.io',
      'Server-Sent Events',
      'gRPC',
      'RabbitMQ',
      'Apache Kafka',
      'Apache Spark',
      'Hadoop',
      'TensorFlow',
      'PyTorch',
      'Machine Learning',
      'Deep Learning',
      'Data Science',
      'Analytics',
      'Blockchain',
      'Cryptocurrency',
      'Bitcoin',
      'Ethereum',
      'Smart Contracts',
      'Web3',
      'NFT',
      'DeFi',
      'Security',
      'Authentication',
      'Authorization',
      'JWT',
      'OAuth',
      'OpenID Connect',
      'SAML',
      'LDAP',
      'Active Directory',
    ];

    for (let i = 0; i < size; i++) {
      const tagIndex = (offset + i) % techTags.length;
      const baseTag = techTags[tagIndex];
      const tagName =
        i < techTags.length
          ? baseTag
          : `${baseTag} ${Math.floor(i / techTags.length) + 1}`;

      tags.push({
        name: tagName,
      });
    }

    return tags;
  }

  private generateQuestionBatch(
    size: number,
    users: User[],
    tags: Tag[],
  ): Partial<Question>[] {
    const questions: Partial<Question>[] = [];

    for (let i = 0; i < size; i++) {
      const randomUser = users[this.getRandomInt(0, users.length - 1)];
      const questionData = this.generateQuestionContent();

      questions.push({
        title: questionData.title,
        description: questionData.description,
        user: randomUser,
        tags: this.getRandomTags(tags, 1, 3),
      });
    }

    return questions;
  }

  private generateAnswerBatch(
    size: number,
    users: User[],
    questions: Question[],
  ): Partial<Answer>[] {
    const answers: Partial<Answer>[] = [];

    for (let i = 0; i < size; i++) {
      const randomUser = users[this.getRandomInt(0, users.length - 1)];
      const randomQuestion =
        questions[this.getRandomInt(0, questions.length - 1)];

      answers.push({
        content: this.generateAnswerContent(),
        user: randomUser,
        question: randomQuestion,
        isAccepted: Math.random() < 0.1, // 10% chance of being accepted
      });
    }

    return answers;
  }

  private generateVotesForAnswer(
    answer: Answer,
    users: User[],
    count: number,
  ): Partial<Vote>[] {
    const votes: Partial<Vote>[] = [];
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count && i < shuffledUsers.length; i++) {
      votes.push({
        voteType: Math.random() < 0.7 ? VoteType.UPVOTE : VoteType.DOWNVOTE, // 70% upvotes
        user: shuffledUsers[i],
        answer: answer,
      });
    }

    return votes;
  }

  private generateRandomName(): string {
    const firstNames = [
      'John',
      'Jane',
      'Michael',
      'Sarah',
      'David',
      'Emily',
      'Robert',
      'Jessica',
      'William',
      'Ashley',
      'James',
      'Amanda',
      'Christopher',
      'Jennifer',
      'Daniel',
      'Lisa',
      'Matthew',
      'Nancy',
      'Anthony',
      'Karen',
      'Mark',
      'Betty',
      'Donald',
      'Helen',
      'Steven',
      'Sandra',
      'Paul',
      'Donna',
      'Andrew',
      'Carol',
      'Joshua',
      'Ruth',
      'Kenneth',
      'Sharon',
      'Kevin',
      'Michelle',
      'Brian',
      'Laura',
      'George',
      'Sarah',
      'Edward',
      'Kimberly',
      'Ronald',
      'Deborah',
      'Timothy',
      'Dorothy',
      'Jason',
      'Lisa',
      'Jeffrey',
      'Nancy',
      'Ryan',
      'Karen',
      'Jacob',
      'Betty',
      'Gary',
      'Helen',
      'Nicholas',
      'Sandra',
      'Eric',
      'Donna',
      'Jonathan',
      'Carol',
      'Stephen',
      'Ruth',
      'Larry',
      'Sharon',
      'Justin',
      'Michelle',
      'Scott',
      'Laura',
      'Brandon',
      'Sarah',
      'Benjamin',
      'Kimberly',
      'Samuel',
      'Deborah',
      'Gregory',
      'Dorothy',
      'Alexander',
      'Lisa',
      'Patrick',
      'Nancy',
      'Jack',
      'Karen',
    ];

    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Hernandez',
      'Lopez',
      'Gonzalez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
      'Lee',
      'Perez',
      'Thompson',
      'White',
      'Harris',
      'Sanchez',
      'Clark',
      'Ramirez',
      'Lewis',
      'Robinson',
      'Walker',
      'Young',
      'Allen',
      'King',
      'Wright',
      'Scott',
      'Torres',
      'Nguyen',
      'Hill',
      'Flores',
      'Green',
      'Adams',
      'Nelson',
      'Baker',
      'Hall',
      'Rivera',
      'Campbell',
      'Mitchell',
      'Carter',
      'Roberts',
      'Gomez',
      'Phillips',
      'Evans',
      'Turner',
      'Diaz',
      'Parker',
      'Cruz',
      'Edwards',
      'Collins',
      'Reyes',
      'Stewart',
      'Morris',
      'Morales',
      'Murphy',
      'Cook',
      'Rogers',
      'Gutierrez',
      'Ortiz',
      'Morgan',
      'Cooper',
      'Peterson',
      'Bailey',
      'Reed',
      'Kelly',
      'Howard',
      'Ramos',
      'Kim',
      'Cox',
      'Ward',
      'Richardson',
      'Watson',
      'Brooks',
      'Chavez',
      'Wood',
      'James',
      'Bennett',
      'Gray',
      'Mendoza',
      'Ruiz',
      'Hughes',
      'Price',
      'Alvarez',
      'Castillo',
      'Sanders',
      'Patel',
      'Myers',
      'Long',
      'Ross',
      'Foster',
      'Jimenez',
    ];

    const firstName = firstNames[this.getRandomInt(0, firstNames.length - 1)];
    const lastName = lastNames[this.getRandomInt(0, lastNames.length - 1)];

    return `${firstName} ${lastName}`;
  }

  private generateQuestionContent(): { title: string; description: string } {
    const questionTemplates = [
      {
        title: 'How to implement {topic} in {technology}?',
        description:
          'I am trying to implement {topic} using {technology} but I am facing some issues. Can someone help me understand the best practices and provide a working example?',
      },
      {
        title: 'What is the difference between {topic1} and {topic2}?',
        description:
          'I am confused about the differences between {topic1} and {topic2}. When should I use each one? What are the pros and cons?',
      },
      {
        title: 'Best way to {action} with {technology}',
        description:
          'I need to {action} using {technology}. What is the most efficient and maintainable approach? Are there any libraries or frameworks that can help?',
      },
      {
        title: 'Troubleshooting {error} in {technology}',
        description:
          'I am getting this error: {error} when working with {technology}. I have tried several solutions but nothing seems to work. Any suggestions?',
      },
      {
        title: 'How to optimize {performance} in {technology}?',
        description:
          'My {technology} application is experiencing performance issues. How can I optimize {performance}? What tools and techniques should I use?',
      },
    ];

    const topics = [
      'authentication',
      'authorization',
      'database connection',
      'API endpoints',
      'error handling',
      'logging',
      'caching',
      'validation',
      'serialization',
      'middleware',
      'routing',
      'testing',
      'deployment',
      'monitoring',
      'security',
      'performance',
      'scalability',
      'maintainability',
    ];

    const technologies = [
      'NestJS',
      'Express',
      'Node.js',
      'TypeScript',
      'JavaScript',
      'React',
      'Vue',
      'Angular',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'Docker',
      'Kubernetes',
      'AWS',
      'GraphQL',
      'REST API',
    ];

    const actions = [
      'handle user authentication',
      'implement real-time features',
      'manage state',
      'optimize database queries',
      'deploy applications',
      'monitor performance',
      'handle errors gracefully',
      'implement caching',
      'write tests',
      'debug issues',
    ];

    const errors = [
      'Connection timeout',
      'Authentication failed',
      'Permission denied',
      'Resource not found',
      'Validation error',
      'Database constraint violation',
      'Memory leak',
      'CORS error',
      'Type error',
      'Runtime exception',
      'Network timeout',
      'Invalid configuration',
    ];

    const template =
      questionTemplates[this.getRandomInt(0, questionTemplates.length - 1)];

    let title = template.title;
    let description = template.description;

    // Replace placeholders
    title = title.replace(
      '{topic}',
      topics[this.getRandomInt(0, topics.length - 1)],
    );
    title = title.replace(
      '{technology}',
      technologies[this.getRandomInt(0, technologies.length - 1)],
    );
    title = title.replace(
      '{topic1}',
      topics[this.getRandomInt(0, topics.length - 1)],
    );
    title = title.replace(
      '{topic2}',
      topics[this.getRandomInt(0, topics.length - 1)],
    );
    title = title.replace(
      '{action}',
      actions[this.getRandomInt(0, actions.length - 1)],
    );
    title = title.replace(
      '{error}',
      errors[this.getRandomInt(0, errors.length - 1)],
    );
    title = title.replace(
      '{performance}',
      topics[this.getRandomInt(0, topics.length - 1)],
    );

    description = description.replace(
      '{topic}',
      topics[this.getRandomInt(0, topics.length - 1)],
    );
    description = description.replace(
      '{technology}',
      technologies[this.getRandomInt(0, technologies.length - 1)],
    );
    description = description.replace(
      '{topic1}',
      topics[this.getRandomInt(0, topics.length - 1)],
    );
    description = description.replace(
      '{topic2}',
      topics[this.getRandomInt(0, topics.length - 1)],
    );
    description = description.replace(
      '{action}',
      actions[this.getRandomInt(0, actions.length - 1)],
    );
    description = description.replace(
      '{error}',
      errors[this.getRandomInt(0, errors.length - 1)],
    );
    description = description.replace(
      '{performance}',
      topics[this.getRandomInt(0, topics.length - 1)],
    );

    return { title, description };
  }

  private generateAnswerContent(): string {
    const answerTemplates = [
      'Here is how you can solve this problem:\n\n1. First, you need to {step1}\n2. Then, {step2}\n3. Finally, {step3}\n\nThis approach should work for your use case.',
      'I faced a similar issue before. The solution is to {solution}. Here is a code example:\n\n```{language}\n{code}\n```\n\nThis should resolve your problem.',
      'There are several ways to approach this:\n\n**Option 1:** {option1}\n**Option 2:** {option2}\n**Option 3:** {option3}\n\nI recommend {recommendation} because {reason}.',
      'This is a common issue. The problem is likely caused by {cause}. To fix it:\n\n- {fix1}\n- {fix2}\n- {fix3}\n\nMake sure to {additional_tip}',
      "You can use {library} for this. Here is how:\n\n```{language}\n{code}\n```\n\nDon't forget to {important_note}.",
      'I suggest checking the documentation for {technology}. The issue might be related to {possible_cause}. Try {suggestion} and let me know if it works.',
      'This depends on your specific requirements. If you need {requirement1}, then {solution1}. If you need {requirement2}, then {solution2}.',
      'The best practice is to {best_practice}. Here is an example implementation:\n\n```{language}\n{code}\n```\n\nThis follows the {pattern} pattern.',
    ];

    const steps = [
      'install the required dependencies',
      'configure your environment variables',
      'set up the database connection',
      'create the necessary models',
      'implement the business logic',
      'add error handling',
      'write unit tests',
      'configure logging',
      'set up monitoring',
      'deploy to production',
    ];

    const solutions = [
      'use a different approach',
      'check your configuration',
      'update your dependencies',
      'implement proper error handling',
      'add input validation',
      'optimize your queries',
      'use caching',
      'implement retry logic',
      'add logging',
      'refactor your code',
    ];

    const options = [
      'use the built-in functionality',
      'implement a custom solution',
      'use a third-party library',
      'modify the existing code',
      'create a wrapper function',
      'use a different design pattern',
      'implement async/await',
      'use promises',
      'use callbacks',
      'use streams',
    ];

    const causes = [
      'incorrect configuration',
      'missing dependencies',
      'version compatibility issues',
      'network connectivity problems',
      'insufficient permissions',
      'resource limitations',
      'concurrent access issues',
      'data validation errors',
      'timing issues',
      'memory constraints',
    ];

    const fixes = [
      'check your configuration file',
      'install missing packages',
      'update to compatible versions',
      'verify network settings',
      'check user permissions',
      'increase resource limits',
      'implement proper locking',
      'add data validation',
      'adjust timing',
      'optimize memory usage',
    ];

    const libraries = [
      'lodash',
      'moment',
      'axios',
      'express',
      'mongoose',
      'sequelize',
      'redis',
      'bull',
      'winston',
      'helmet',
      'cors',
      'compression',
      'rate-limiter',
      'joi',
      'class-validator',
    ];

    const languages = [
      'javascript',
      'typescript',
      'python',
      'java',
      'csharp',
      'php',
      'ruby',
      'go',
      'rust',
    ];

    const patterns = [
      'Repository',
      'Service',
      'Factory',
      'Observer',
      'Strategy',
      'Decorator',
      'Adapter',
      'Singleton',
      'Builder',
      'Command',
      'MVC',
      'MVP',
      'MVVM',
      'Clean Architecture',
    ];

    const template =
      answerTemplates[this.getRandomInt(0, answerTemplates.length - 1)];

    let answer = template;

    // Replace placeholders with random values
    answer = answer.replace(
      '{step1}',
      steps[this.getRandomInt(0, steps.length - 1)],
    );
    answer = answer.replace(
      '{step2}',
      steps[this.getRandomInt(0, steps.length - 1)],
    );
    answer = answer.replace(
      '{step3}',
      steps[this.getRandomInt(0, steps.length - 1)],
    );
    answer = answer.replace(
      '{solution}',
      solutions[this.getRandomInt(0, solutions.length - 1)],
    );
    answer = answer.replace(
      '{option1}',
      options[this.getRandomInt(0, options.length - 1)],
    );
    answer = answer.replace(
      '{option2}',
      options[this.getRandomInt(0, options.length - 1)],
    );
    answer = answer.replace(
      '{option3}',
      options[this.getRandomInt(0, options.length - 1)],
    );
    answer = answer.replace(
      '{cause}',
      causes[this.getRandomInt(0, causes.length - 1)],
    );
    answer = answer.replace(
      '{fix1}',
      fixes[this.getRandomInt(0, fixes.length - 1)],
    );
    answer = answer.replace(
      '{fix2}',
      fixes[this.getRandomInt(0, fixes.length - 1)],
    );
    answer = answer.replace(
      '{fix3}',
      fixes[this.getRandomInt(0, fixes.length - 1)],
    );
    answer = answer.replace(
      '{library}',
      libraries[this.getRandomInt(0, libraries.length - 1)],
    );
    answer = answer.replace(
      '{language}',
      languages[this.getRandomInt(0, languages.length - 1)],
    );
    answer = answer.replace(
      '{pattern}',
      patterns[this.getRandomInt(0, patterns.length - 1)],
    );

    // Add some code examples
    if (answer.includes('{code}')) {
      const codeExamples = [
        'const result = await someFunction();\nconsole.log(result);',
        'if (condition) {\n  return true;\n} else {\n  return false;\n}',
        'const data = {\n  id: 1,\n  name: "example"\n};',
        'try {\n  await riskyOperation();\n} catch (error) {\n  console.error(error);\n}',
        'const filtered = array.filter(item => item.active);\nreturn filtered;',
      ];
      answer = answer.replace(
        '{code}',
        codeExamples[this.getRandomInt(0, codeExamples.length - 1)],
      );
    }

    // Fill remaining placeholders
    answer = answer.replace(
      '{recommendation}',
      options[this.getRandomInt(0, options.length - 1)],
    );
    answer = answer.replace(
      '{reason}',
      'it is more efficient and maintainable',
    );
    answer = answer.replace(
      '{additional_tip}',
      'test thoroughly before deploying',
    );
    answer = answer.replace('{important_note}', 'handle errors properly');
    answer = answer.replace('{technology}', 'the framework you are using');
    answer = answer.replace(
      '{possible_cause}',
      causes[this.getRandomInt(0, causes.length - 1)],
    );
    answer = answer.replace(
      '{suggestion}',
      solutions[this.getRandomInt(0, solutions.length - 1)],
    );
    answer = answer.replace('{requirement1}', 'high performance');
    answer = answer.replace('{requirement2}', 'easy maintenance');
    answer = answer.replace(
      '{solution1}',
      options[this.getRandomInt(0, options.length - 1)],
    );
    answer = answer.replace(
      '{solution2}',
      options[this.getRandomInt(0, options.length - 1)],
    );
    answer = answer.replace(
      '{best_practice}',
      solutions[this.getRandomInt(0, solutions.length - 1)],
    );

    return answer;
  }

  private getRandomTags(tags: Tag[], min: number, max: number): Tag[] {
    const count = this.getRandomInt(min, max);
    const shuffled = [...tags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
