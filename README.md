# Backend Application
Question-and-answer (Q&A) platform using NestJS, Postgres, Typeorm with Docker support and Swagger API documentation.
## 🚀 Getting Started

To run the project locally, simply use:

```bash
docker compose up
```
This will start the application along with all necessary services.
## ⚙️ Core Functionalities

- ✅ Create user
- ✅ Get all users list
- ✅ Create tag
- ✅ Get all tags list
- ✅ Create question
- ✅ Get all questions with pagination
- ✅ Answer question
- ✅ Mark an answer for a question as correct (only the owner of the question is allowed)
- ✅ Get one question with statistics about the number of answers
- ✅ Create answer
- ✅ Get statistics of answers with the number of votes
- ✅ Vote on answer
- ✅ Assign tags to questions
- ✅ Filter questions based on tags

---
## 📚 API Documentation
Swagger UI is available at:

```bash
http://localhost:3000/docs
```
You can explore all available endpoints and test them directly through the browser.



---
> **Note:** All endpoints are subject to global rate limiting unless explicitly overridden.


## 🔒 Rate Limiting

By default, the API is rate-limited to:

- **10 requests per minute per IP**
- If a user exceeds this limit, the server will respond with `429 Too Many Requests`.

---

Routes:

## Questions Routes

All endpoints are prefixed with `/questions`.

### POST `/questions`
- **Summary:** Create a new question

### GET `/questions`
- **Summary:** Get a list of questions with optional filtering by tags
- **Query Parameters:**
  - `limit` (optional): Number of questions per page
  - `page` (optional): Page number
  - `tags` (optional): Array of tags to filter questions

### GET `/questions/:id`
- **Summary:** Get a single question by ID
- **Path Parameters:**
  - `id`: UUID of the question

### GET `/questions/:id/statistics`
- **Summary:** Get statistics for a specific question
- **Path Parameters:**
  - `id`: UUID of the question

### POST `/questions/:id/make-answer`
- **Summary:** Create an answer for a specific question
- **Path Parameters:**
  - `id`: UUID of the question

### POST `/questions/:id/mark-answer-correct`
- **Summary:** Mark an answer as correct for a specific question
- **Path Parameters:**
  - `id`: UUID of the question

---

## Users Routes

All endpoints are prefixed with `/users`.

### POST `/users`
- **Summary:** Create a user (test-only functionality)

### GET `/users`
- **Summary:** Get all users (for test purposes)

---

## Tags Routes

All endpoints are prefixed with `/tags`.

### POST `/tags`
- **Summary:** Create a new tag

### GET `/tags`
- **Summary:** Get all tags with optional pagination
- **Query Parameters:**
  - `limit` (optional)
  - `page` (optional)

---

## Votes Routes

All endpoints are prefixed with `/votes`.

### POST `/votes`
- **Summary:** Submit a vote for an answer
- **Body Parameters:**
  - `answerId`
  - `voteType`
  - `userId`


---
## 🗄️ Database Info

Database Migrations:
You can find all database migration files in the following directory:


```bash
src/database/migrations
```
These migrations define the structure and changes applied to the database schema over time.


## Unit test
for running unit test, run this command:
`npm run test`