import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';

// Load test options with separate read/write scenarios
export const options = {
  scenarios: {
    read_traffic: {
      executor: 'constant-arrival-rate',
      rate: 25, // 25 RPS for reads (45% + 30% + 10% = 85% of 30 total RPS)
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 200,
      exec: 'readScenario',
    },
    write_traffic: {
      executor: 'constant-arrival-rate',
      rate: 5, // 5 RPS for writes (8% + 4% + 2% = 14% of 30 total RPS)
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      exec: 'writeScenario',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
    errors: ['rate<0.1'],
  },
};

// Setup function - runs once before all scenarios
export function setup() {
  console.log('Fetching existing test data...');

  // Fetch existing tags
  const tagsResponse = http.get(`${BASE_URL}/tags`);
  let tags = [];
  if (tagsResponse.status === 200) {
    const tagsData = JSON.parse(tagsResponse.body);
    tags = tagsData.data || tagsData; // Handle different response formats
  }

  // Fetch existing questions
  const questionsResponse = http.get(`${BASE_URL}/questions?limit=50`);
  let questions = [];
  if (questionsResponse.status === 200) {
    const questionsData = JSON.parse(questionsResponse.body);
    questions = questionsData.data || questionsData; // Handle different response formats
  }

  console.log(
    `Setup complete: ${tags.length} tags, ${questions.length} questions`,
  );

  return {
    tags,
    questions,
  };
}

// Teardown function - runs once after all scenarios
export function teardown(data) {
  console.log('Test completed. Data cleanup not implemented for this demo.');
}

// Read scenario - handles all GET requests
export function readScenario(data) {
  const scenarios = [
    { weight: 53, name: 'getQuestions' }, // 45% of total traffic (45/85 = 53%)
    { weight: 35, name: 'getQuestionById' }, // 30% of total traffic (30/85 = 35%)
    { weight: 12, name: 'getQuestionStats' }, // 10% of total traffic (10/85 = 12%)
  ];

  const random = Math.random() * 100;
  let cumulativeWeight = 0;

  for (const scenario of scenarios) {
    cumulativeWeight += scenario.weight;
    if (random <= cumulativeWeight) {
      executeReadScenario(scenario.name, data);
      break;
    }
  }

  sleep(Math.random() * 2); // Random sleep between 0-2 seconds
}

// Write scenario - handles all POST requests
export function writeScenario(data) {
  const scenarios = [
    { weight: 57, name: 'createVote' }, // 8% of total traffic (8/14 = 57%)
    { weight: 29, name: 'createAnswer' }, // 4% of total traffic (4/14 = 29%)
    { weight: 14, name: 'createQuestion' }, // 2% of total traffic (2/14 = 14%)
  ];

  const random = Math.random() * 100;
  let cumulativeWeight = 0;

  for (const scenario of scenarios) {
    cumulativeWeight += scenario.weight;
    if (random <= cumulativeWeight) {
      executeWriteScenario(scenario.name, data);
      break;
    }
  }

  sleep(Math.random() * 3); // Random sleep between 0-3 seconds
}

// Execute specific read scenarios
function executeReadScenario(scenarioName, data) {
  switch (scenarioName) {
    case 'getQuestions':
      getQuestions(data);
      break;
    case 'getQuestionById':
      getQuestionById(data);
      break;
    case 'getQuestionStats':
      getQuestionStats(data);
      break;
  }
}

// Execute specific write scenarios
function executeWriteScenario(scenarioName, data) {
  switch (scenarioName) {
    case 'createVote':
      createVote(data);
      break;
    case 'createAnswer':
      createAnswer(data);
      break;
    case 'createQuestion':
      createQuestion(data);
      break;
  }
}

// Read scenario implementations
function getQuestions(data) {
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // Randomly add query parameters
  const queryParams = [];
  if (Math.random() > 0.5) {
    queryParams.push(`page=${Math.floor(Math.random() * 5) + 1}`);
  }
  if (Math.random() > 0.7) {
    queryParams.push(`limit=${Math.floor(Math.random() * 20) + 10}`);
  }
  if (Math.random() > 0.8 && data.tags.length > 0) {
    const randomTag = data.tags[Math.floor(Math.random() * data.tags.length)];
    queryParams.push(`tags=${randomTag.id}`);
  }

  const url =
    queryParams.length > 0
      ? `${BASE_URL}/questions?${queryParams.join('&')}`
      : `${BASE_URL}/questions`;

  const response = http.get(url, params);

  check(response, {
    'GET /questions status is 200': (r) => r.status === 200,
    'GET /questions response time < 1000ms': (r) => r.timings.duration < 1000,
    'GET /questions has questions': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && Array.isArray(body.data);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(response.status !== 200);
}

function getQuestionById(data) {
  if (data.questions.length === 0) return;

  const randomQuestion =
    data.questions[Math.floor(Math.random() * data.questions.length)];
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.get(
    `${BASE_URL}/questions/${randomQuestion.id}`,
    params,
  );

  check(response, {
    'GET /questions/:id status is 200': (r) => r.status === 200,
    'GET /questions/:id response time < 1000ms': (r) =>
      r.timings.duration < 1000,
    'GET /questions/:id has question data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id && body.title;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(response.status !== 200);
}

function getQuestionStats(data) {
  if (data.questions.length === 0) return;

  const randomQuestion =
    data.questions[Math.floor(Math.random() * data.questions.length)];
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.get(
    `${BASE_URL}/questions/${randomQuestion.id}/statistics`,
    params,
  );

  check(response, {
    'GET /questions/:id/statistics status is 200': (r) => r.status === 200,
    'GET /questions/:id/statistics response time < 1000ms': (r) =>
      r.timings.duration < 1000,
  });

  errorRate.add(response.status !== 200);
}

// Write scenario implementations
function createVote(data) {
  if (data.questions.length === 0) return;

  // First get a question with answers
  const randomQuestion =
    data.questions[Math.floor(Math.random() * data.questions.length)];
  const questionResponse = http.get(
    `${BASE_URL}/questions/${randomQuestion.id}`,
  );

  if (questionResponse.status !== 200) return;

  const questionData = JSON.parse(questionResponse.body);
  if (!questionData.answers || questionData.answers.length === 0) return;

  const randomAnswer =
    questionData.answers[
      Math.floor(Math.random() * questionData.answers.length)
    ];

  // Generate a random UUID for userId (since we're not fetching users)
  const userId = '00013b21-5489-4e10-8bca-acf9b7646b53'; // Fixed UUID for testing
  const voteTypes = ['upvote', 'downvote'];
  const randomVoteType =
    voteTypes[Math.floor(Math.random() * voteTypes.length)];

  const payload = JSON.stringify({
    answerId: randomAnswer.id,
    voteType: randomVoteType,
    userId: userId,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${BASE_URL}/votes`, payload, params);

  check(response, {
    'POST /votes status is 200': (r) => r.status === 200,
    'POST /votes response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(response.status !== 200);
}

function createAnswer(data) {
  if (data.questions.length === 0) return;

  const randomQuestion =
    data.questions[Math.floor(Math.random() * data.questions.length)];

  // Generate a random UUID for userId (since we're not fetching users)
  const userId = '00013b21-5489-4e10-8bca-acf9b7646b53'; // Fixed UUID for testing

  const payload = JSON.stringify({
    content: `This is a test answer for question ${randomQuestion.id}. It provides helpful information and insights.`,
    questionId: randomQuestion.id,
    userId: userId,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(
    `${BASE_URL}/questions/${randomQuestion.id}/make-answer`,
    payload,
    params,
  );

  check(response, {
    'POST /questions/:id/make-answer status is 201': (r) => r.status === 201,
    'POST /questions/:id/make-answer response time < 2000ms': (r) =>
      r.timings.duration < 2000,
  });

  errorRate.add(response.status !== 201);
}

function createQuestion(data) {
  if (data.tags.length === 0) return;

  // Generate a random UUID for userId (since we're not fetching users)
  const userId = '00013b21-5489-4e10-8bca-acf9b7646b53'; // Fixed UUID for testing
  const randomTags = data.tags.slice(0, Math.floor(Math.random() * 3) + 1);

  const payload = JSON.stringify({
    title: `Load Test Question ${Date.now()}`,
    content: `This is a question created during load testing. It contains detailed information about a specific topic and is designed to test the system's ability to handle concurrent question creation.`,
    tags: randomTags.map((tag) => tag.id),
    userId: userId,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${BASE_URL}/questions`, payload, params);

  check(response, {
    'POST /questions status is 201': (r) => r.status === 201,
    'POST /questions response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(response.status !== 201);
}
