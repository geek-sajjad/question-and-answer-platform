# Question and Answer Platform Load Testing Plan

## Project Overview

Building a question-and-answer (Q&A) platform using NestJS, Postgres,
TypeORM with Docker and Swagger support. The project includes features
such as user creation, tags, questions, answers, voting, and question
statistics.

The main goal is to simulate scaling patterns, load testing, and
optimization using caching, sharding, and performance techniques.

------------------------------------------------------------------------

## Estimated Usage Metrics

### 1. Daily Active Users (DAU)

-   500K installs → \~10--20% monthly active users → **50K--100K MAU**
-   15--30% of MAU are daily active → **7.5K--30K DAU**
-   ✅ Estimated **10K--25K DAU**

### 2. Concurrent Users

-   1--5% of DAU online simultaneously → **300--1,000 concurrent users**

### 3. Requests Per Second (RPS)

Assume each user performs 25 requests per 15-minute session: - (1000 ×
25) / 900 ≈ **28 RPS** - Add spikes → up to **100--200 RPS**

✅ Baseline: 20--30 RPS\
✅ Peak: 100--200 RPS

------------------------------------------------------------------------

## Database Simulation Data

  --------------------------------------------------------------------------
  Entity         Ratio          Example Count                Notes
  -------------- -------------- ---------------------------- ---------------
  Users          100% installs  500,000                      Registered
                                                             users

  Questions      10--20% of     50K--100K                    Each asks 1--2
                 users                                       questions

  Answers        3--5 per       150K--500K                   Active
                 question                                    participation

  Tags           ---            \~200                        Shared taxonomy

  Votes          \~10 per       1.5M--5M                     Stress for
                 answer                                      joins

  Question-Tag   1--3 per       100K--300K                   Many-to-many
  relations      question                                    table
  --------------------------------------------------------------------------

------------------------------------------------------------------------

## Routes and Load Testing Focus

  Endpoint                            Type    Description         Load Share
  ----------------------------------- ------- ------------------- ------------
  `GET /questions`                    Read    List & pagination   40--50%
  `GET /questions/:id`                Read    View detail         25--30%
  `GET /questions/:id/statistics`     Read    Stats               10%
  `POST /votes`                       Write   Voting              5--10%
  `POST /questions/:id/make-answer`   Write   Answer creation     3--5%
  `POST /questions`                   Write   New question        1--2%

✅ Main routes for load testing: - `/questions` - `/questions/:id` -
`/questions/:id/statistics`

------------------------------------------------------------------------

## k6 Load Test Strategy

  Stage      Target                   Notes
  ---------- ------------------------ --------------------
  Warmup     50 VUs, 5 RPS            Verify correctness
  Baseline   300 VUs, 20--30 RPS      Normal traffic
  Peak       1000 VUs, 100--200 RPS   Stress test
  Soak       100 VUs, 4--6 hrs        Detect leaks

------------------------------------------------------------------------

## k6 Scenario Example

``` js
export const options = {
  scenarios: {
    read_traffic: {
      executor: 'constant-arrival-rate',
      rate: 27,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      exec: 'readScenario',
    },
    write_traffic: {
      executor: 'constant-arrival-rate',
      rate: 3,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 20,
      exec: 'writeScenario',
    },
  },
};

export function readScenario() {
  http.get(`${BASE_URL}/questions?limit=10&page=${Math.floor(Math.random() * 50)}`);
  http.get(`${BASE_URL}/questions/${randomId}`);
  http.get(`${BASE_URL}/questions/${randomId}/statistics`);
}

export function writeScenario() {
  http.post(`${BASE_URL}/votes`, JSON.stringify({ answerId: randomAnswer(), voteType: 'UP', userId: randomUser }), { headers });
}
```

------------------------------------------------------------------------

## Summary of Load Testing Priorities

  --------------------------------------------------------------------------------------
  Priority              Endpoint                            Type         Reason
  --------------------- ----------------------------------- ------------ ---------------
  🟢 High               `GET /questions`                    Read         Pagination and
                                                                         DB stress

  🟢 High               `GET /questions/:id`                Read         Joins & answer
                                                                         lists

  🟢 High               `GET /questions/:id/statistics`     Read         Aggregation
                                                                         bottlenecks

  🟡 Medium             `POST /votes`                       Write        Concurrency
                                                                         test

  🟡 Medium             `POST /questions/:id/make-answer`   Write        User
                                                                         interaction

  🔴 Low                `POST /questions`                   Write        Rare action

  🔴 Low                `/users`, `/tags`                   Read/Write   Admin/test only
  --------------------------------------------------------------------------------------
