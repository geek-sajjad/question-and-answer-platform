export interface SeederConfig {
  users: {
    count: number;
    batchSize: number;
  };
  questions: {
    count: number;
    batchSize: number;
  };
  answers: {
    count: number;
    batchSize: number;
  };
  tags: {
    count: number;
    batchSize: number;
  };
  votes: {
    minPerAnswer: number;
    maxPerAnswer: number;
    batchSize: number;
  };
  questionTags: {
    minPerQuestion: number;
    maxPerQuestion: number;
    batchSize: number;
  };
}

export const DEFAULT_SEEDER_CONFIG: SeederConfig = {
  users: {
    count: 500000,
    batchSize: 1000,
  },
  questions: {
    count: 50000,
    batchSize: 500,
  },
  answers: {
    count: 150000,
    batchSize: 500,
  },
  tags: {
    count: 100,
    batchSize: 50,
  },
  votes: {
    minPerAnswer: 3,
    maxPerAnswer: 10,
    batchSize: 1000,
  },
  questionTags: {
    minPerQuestion: 1,
    maxPerQuestion: 3,
    batchSize: 1000,
  },
};

export const TEST_SEEDER_CONFIG: SeederConfig = {
  users: {
    count: 100,
    batchSize: 50,
  },
  questions: {
    count: 50,
    batchSize: 25,
  },
  answers: {
    count: 150,
    batchSize: 50,
  },
  tags: {
    count: 20,
    batchSize: 20,
  },
  votes: {
    minPerAnswer: 2,
    maxPerAnswer: 5,
    batchSize: 100,
  },
  questionTags: {
    minPerQuestion: 1,
    maxPerQuestion: 2,
    batchSize: 100,
  },
};
