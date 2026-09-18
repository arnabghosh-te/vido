# Vidu — Video Communication & AI Knowledge Platform

A full-stack subscription-based **video communication and AI knowledge platform** built with **Node.js, Express.js, PostgreSQL, Sequelize, React.js, Tailwind CSS, LiveKit, Socket.IO, Gemini API, and pgvector**.

Vidu combines real-time video calling, token-based usage, multilingual transcription, AI-powered summaries, and document-based RAG question answering into a single platform.

> **Note:** This version intentionally does **not** use Redis or BullMQ. The architecture is kept simple and modular.

---

## 🚀 Features

### 👤 User Features

* User registration and login
* JWT authentication
* User profile management
* Update profile
* Change password
* Logout
* Subscription plan browsing
* Subscription purchase
* Token-based usage
* Token balance tracking
* Token transaction history
* Live video calling
* Shareable video call links
* Live multilingual transcription
* Transcript saving
* AI-generated transcript summaries
* Key points and action items
* PDF, DOCX and TXT document upload
* Document-based question answering
* RAG using PostgreSQL + pgvector
* Question history
* Real-time notifications
* Automatic call termination when tokens are exhausted

### 👑 Super Admin Features

* Super Admin authentication
* Admin dashboard
* User management
* User details
* Subscription monitoring
* Token usage monitoring
* Call history
* Active call monitoring
* Call duration monitoring
* Platform statistics
* Subscription plan CRUD
* Create subscription plans
* Update subscription plans
* Activate/deactivate plans
* Delete plans where safe
* Manage plan pricing
* Manage token allocation
* Manage plan duration

---

# 🛠️ Technology Stack

## Backend

| Technology         | Purpose                       |
| ------------------ | ----------------------------- |
| Node.js            | Backend runtime               |
| Express.js         | REST API framework            |
| PostgreSQL         | Database                      |
| Sequelize          | ORM                           |
| Sequelize CLI      | Database migrations           |
| JWT                | Authentication                |
| bcryptjs           | Password hashing              |
| Socket.IO          | Real-time communication       |
| Multer             | File uploads                  |
| LiveKit Server SDK | Video call token generation   |
| Gemini API         | AI summaries and document Q&A |
| pgvector           | Vector similarity search      |

## Frontend

| Technology        | Purpose                |
| ----------------- | ---------------------- |
| React.js          | Frontend framework     |
| Vite              | Development/build tool |
| Axios             | API communication      |
| Tailwind CSS      | UI styling             |
| React Router      | Client-side routing    |
| LiveKit React SDK | Video/audio calls      |
| Socket.IO Client  | Real-time events       |

### Not Used

```text
Redis
BullMQ
```

---

# 🏗️ Architecture

```text
                  React + Tailwind
                         |
                       Axios
                         |
                         ↓
                 Node.js + Express
                         |
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
 Authentication      Business Logic     Real-Time
       |                 |                 |
       |          ┌──────┼──────┐          |
       |          ↓      ↓      ↓          |
       |       Calls   RAG   Gemini     Socket.IO
       |          |
       |       LiveKit
       |
       ↓
 PostgreSQL
       |
    pgvector
```

### Video Calling

```text
React
  |
  ↓
LiveKit React SDK
  |
  ↓
LiveKit Room
  |
  ↓
Audio / Video
```

The backend generates secure LiveKit access tokens using the LiveKit Server SDK.

### AI / RAG

```text
Document
   ↓
Text Extraction
   ↓
Chunking
   ↓
Embeddings
   ↓
pgvector
   ↓
Similarity Search
   ↓
Relevant Chunks
   ↓
Gemini API
   ↓
Answer
```

---

# 👥 User Roles

The platform contains two roles:

```text
SUPER_ADMIN
USER
```

## USER

A normal user can:

* Register
* Login
* Logout
* Manage profile
* Change password
* View subscription plans
* Purchase subscriptions
* View token balance
* View token usage
* Create calls
* Join calls
* Share call links
* Make and receive calls
* View call duration
* Use multilingual transcription
* Save transcripts
* Generate AI summaries
* Upload documents
* Ask questions about documents
* View question history
* Receive notifications

## SUPER_ADMIN

The Super Admin can:

* Login
* Access admin dashboard
* View users
* View user details
* Monitor subscriptions
* Monitor token usage
* Monitor calls
* View active calls
* View platform statistics
* Create subscription plans
* Update subscription plans
* Activate/deactivate plans
* Delete plans where safe
* Manage pricing
* Manage token allocation
* Manage plan duration

---

# 📁 Project Structure

## Backend

```text
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── migrations/
├── routes/
├── services/
├── sockets/
├── utils/
├── uploads/
├── app.js
├── server.js
├── .env
└── package.json
```

### Services

```text
services/
├── authService.js
├── subscriptionService.js
├── tokenService.js
├── callService.js
├── livekitService.js
├── transcriptionService.js
├── geminiService.js
├── ragService.js
├── documentService.js
└── notificationService.js
```

Business logic should remain inside services while controllers remain thin.

---

## Frontend

```text
frontend/
└── src/
    ├── api/
    │   ├── axios.js
    │   ├── authApi.js
    │   ├── userApi.js
    │   ├── subscriptionApi.js
    │   ├── callApi.js
    │   ├── transcriptApi.js
    │   ├── documentApi.js
    │   └── adminApi.js
    │
    ├── components/
    │   ├── common/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── subscription/
    │   ├── call/
    │   ├── transcript/
    │   ├── document/
    │   └── admin/
    │
    ├── pages/
    │   ├── auth/
    │   ├── user/
    │   └── admin/
    │
    ├── layouts/
    ├── context/
    │   ├── AuthContext.jsx
    │   └── SocketContext.jsx
    │
    ├── hooks/
    ├── routes/
    ├── utils/
    ├── App.jsx
    └── main.jsx
│
├── public/
├── package.json
└── vite.config.js
```

---

# 🗄️ Database Design

The application uses **PostgreSQL + Sequelize**.

## Main Tables

```text
users
roles
user_roles

subscription_plans
subscriptions
token_transactions

calls

transcripts
transcript_segments
summaries

documents
document_chunks
document_questions

notifications
```

Sequelize associations are maintained in:

```text
models/index.js
```

---

# 🔐 Authentication

Authentication uses JWT.

JWT payload:

```json
{
  "userId": 1,
  "email": "user@example.com",
  "role": "USER"
}
```

Passwords are hashed using:

```text
bcryptjs
```

The application uses:

```text
authenticate
authorizeUser
authorizeSuperAdmin
```

middleware.

Sensitive credentials are never exposed to the React application.

---

# 💳 Subscription System

Super Admins manage subscription plans dynamically.

Example plans:

| Plan     | Price | Tokens | Duration |
| -------- | ----: | -----: | -------: |
| Basic    |  ₹199 |  1,000 |  30 days |
| Standard |  ₹499 |  5,000 |  60 days |
| Premium  |  ₹999 | 15,000 |  90 days |

These are example values only. Actual plans are stored in PostgreSQL.

## Subscription Snapshot

When a user purchases a plan, its values are copied into the subscription.

For example:

```text
allocatedTokens = 1000
remainingTokens = 1000
usedTokens = 0
```

If the Super Admin later changes the plan from:

```text
1000 tokens
```

to:

```text
2000 tokens
```

existing subscriptions continue using their original allocation.

Only new purchases receive the updated plan values.

---

# 🪙 Token System

Video calls use tokens.

Example configuration:

```env
CALL_TOKEN_RATE_PER_MINUTE=10
```

Example:

```text
Rate = 10 tokens/minute

Call duration = 5 minutes

Caller usage   = 50 tokens
Receiver usage = 50 tokens
```

Every token change creates a transaction.

Transaction types:

```text
CREDIT
DEBIT
REFUND
ADJUSTMENT
```

Token balances should never be changed without recording the corresponding transaction.

---

# 📞 LiveKit Video Calling

LiveKit is responsible for:

* Audio
* Video
* WebRTC
* Room connection
* Participant management
* Connection handling

Socket.IO is **not** used as the video transport.

## Call Flow

```text
User A
  ↓
Create Call
  ↓
Backend validates subscription
  ↓
Create Call Record
  ↓
Generate Call ID
  ↓
Generate LiveKit Room
  ↓
Generate LiveKit Token
  ↓
Return Shareable URL
  ↓
User A shares URL
  ↓
User B opens URL
  ↓
Backend validates subscription
  ↓
Generate LiveKit Token
  ↓
User B joins
  ↓
Video Call
```

Example:

```text
/call/abc123
```

---

# 💰 Token Billing

Both participants are charged for the call.

The backend calculates duration using:

```text
startedAt
endedAt
```

The frontend cannot be trusted to provide the final call duration.

The billing system is designed to be idempotent so a call cannot be charged twice because of:

* API retries
* Socket reconnects
* Browser refresh
* Duplicate events
* Network issues

---

# ⚠️ Token Exhaustion

When a user's tokens are exhausted:

```text
1. Send Socket.IO event
2. Notify both users
3. Terminate LiveKit call
4. Calculate final duration
5. Calculate token usage
6. Deduct tokens
7. Create token transaction
8. Mark call TOKEN_EXHAUSTED
9. Save call record
```

The frontend immediately responds to the server event.

---

# 🔔 Real-Time Notifications

Socket.IO is used only where real-time communication is required.

Supported events include:

```text
Notifications
Token warnings
Token exhaustion
Call status updates
Transcript updates
```

Notification types:

```text
LOW_TOKEN
TOKEN_EXHAUSTED
CALL_STARTED
CALL_ENDED
SUBSCRIPTION_EXPIRING
```

Notifications are both:

1. Stored in PostgreSQL
2. Delivered through Socket.IO

Duplicate notifications should not be continuously generated.

---

# 📝 Multilingual Transcription

The transcription architecture is abstracted so the provider can be replaced later.

```text
LiveKit Audio
     ↓
Speech-to-Text Service
     ↓
Language Detection
     ↓
Transcript Segment
     ↓
Backend
     ↓
Socket.IO
     ↓
React
```

Transcript segments contain:

```text
speakerId
text
language
startTime
endTime
```

Example:

```text
User A:
Hello, how are you?

Language:
en

User B:
मैं ठीक हूँ।

Language:
hi
```

---

# 🤖 Gemini AI

Gemini is used exclusively from the backend.

Environment variable:

```env
GEMINI_API_KEY=
```

Service:

```text
services/geminiService.js
```

Main functions:

```text
generateSummary()
askDocumentQuestion()
generateEmbedding()
```

The Gemini API key is never exposed to React.

---

# 📄 AI Transcript Summaries

Saved transcripts can be processed by Gemini.

```text
Transcript
    ↓
Gemini
    ↓
Summary
    ↓
Key Points
    ↓
Action Items
    ↓
Important Decisions
```

Generated summaries are stored in PostgreSQL.

---

# 📚 Document RAG

Supported file types:

```text
PDF
DOCX
TXT
```

Multer is used for uploads.

## RAG Pipeline

```text
Upload Document
       ↓
Extract Text
       ↓
Split Into Chunks
       ↓
Generate Embeddings
       ↓
Store in pgvector
       ↓
User Asks Question
       ↓
Generate Question Embedding
       ↓
Vector Similarity Search
       ↓
Retrieve Relevant Chunks
       ↓
Send Context + Question to Gemini
       ↓
Generate Answer
```

The entire document is not sent to Gemini for every question.

Only relevant chunks are retrieved.

If the answer cannot be found in the uploaded document, the system should clearly state that the information could not be found rather than hallucinating an answer.

---

# 🌐 API Overview

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
PUT  /api/auth/profile
PUT  /api/auth/change-password
```

## Subscription Plans

```text
GET /api/subscription-plans
```

## Admin Subscription Plans

```text
POST   /api/admin/subscription-plans
GET    /api/admin/subscription-plans
GET    /api/admin/subscription-plans/:id
PUT    /api/admin/subscription-plans/:id
PATCH  /api/admin/subscription-plans/:id/status
DELETE /api/admin/subscription-plans/:id
```

## Calls

```text
POST /api/calls
GET  /api/calls/:callId
POST /api/calls/:callId/join
POST /api/calls/:callId/end
```

## Transcripts

```text
POST   /api/transcripts
GET    /api/transcripts
GET    /api/transcripts/:id
DELETE /api/transcripts/:id
POST   /api/transcripts/:id/summary
```

## Documents

```text
POST /api/documents
GET  /api/documents
GET  /api/documents/:id
POST /api/documents/:id/ask
DELETE /api/documents/:id
```

---

# 🖥️ Frontend Routes

## User

```text
/login
/register
/dashboard
/subscriptions
/call/:callId
/documents
/transcripts
```

## Super Admin

```text
/admin/dashboard
/admin/users
/admin/calls
/admin/subscription-plans
```

---

# ⚙️ Environment Variables

## Backend

Create:

```text
backend/.env
```

Example:

```env
NODE_ENV=development

PORT=5000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=vidu
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

GEMINI_API_KEY=

CALL_TOKEN_RATE_PER_MINUTE=10
```

> Never commit `.env` to GitHub.

Add:

```text
.env
```

to `.gitignore`.

---

## Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

Only public frontend configuration should use `VITE_` variables.

Never put these in the frontend:

```text
JWT_SECRET
GEMINI_API_KEY
LIVEKIT_API_SECRET
DB_PASSWORD
```

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone <your-repository-url>
cd vidu
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
```

Configure PostgreSQL credentials and application secrets.

Run migrations:

```bash
npx sequelize-cli db:migrate
```

Start development server:

```bash
npm run dev
```

Backend should run on:

```text
http://localhost:5000
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
.env
```

with:

```env
VITE_API_URL=http://localhost:5000/api
```

Start React:

```bash
npm run dev
```

The Vite development server will provide the frontend URL.

---

# 🔄 Development Workflow

The application is developed incrementally.

```text
Phase 1
Project Setup
     ↓
Phase 2
Authentication
     ↓
Phase 3
Super Admin
     ↓
Phase 4
Subscription Plans
     ↓
Phase 5
User Subscription
     ↓
Phase 6
Token System
     ↓
Phase 7
LiveKit Calling
     ↓
Phase 8
Token Billing
     ↓
Phase 9
Transcription
     ↓
Phase 10
Gemini Summary
     ↓
Phase 11
RAG
     ↓
Phase 12
Admin Analytics
     ↓
Phase 13
Testing & Security
```

---

# 🧪 Testing

The application should test:

* Authentication
* Authorization
* Role protection
* Subscription rules
* Token allocation
* Token deduction
* Token transactions
* Token exhaustion
* LiveKit calls
* Concurrent calls
* Call reconnection
* Call termination
* Multilingual transcription
* Gemini failures
* Large document processing
* RAG retrieval
* File upload security
* API security
* Ownership validation
* Duplicate billing

---

# 🔒 Security

Security measures include:

* JWT authentication
* Role-based authorization
* bcryptjs password hashing
* Helmet
* CORS
* Rate limiting
* Input validation
* File type validation
* File size limits
* Database foreign keys
* Sequelize transactions
* Idempotent token billing
* User ownership checks
* Secure API credentials

Never expose:

```text
Database password
JWT secret
Gemini API key
LiveKit API secret
User passwords
```

to the frontend.

---

# 📊 User Dashboard

The dashboard provides:

```text
User Name

Active Subscription
Subscription Expiry
Remaining Tokens
Used Tokens

Start New Call

Recent Calls
Recent Transcripts
Recent Documents
Notifications
```

---

# 👑 Super Admin Dashboard

The admin dashboard provides:

```text
Total Users
Active Users
Active Subscriptions
Total Calls
Active Calls
Total Call Duration
Total Tokens Consumed
Total Documents
Total Transcripts
```

---

# 🎯 Project Goal

Vidu brings together:

```text
Authentication
      +
Subscriptions
      +
Token Economy
      +
Live Video Calling
      +
Multilingual Transcription
      +
AI Summaries
      +
Document RAG
      +
Real-Time Notifications
      +
Super Admin Management
```

into one modular full-stack platform.

The final user journey is:

```text
                 USER
                   |
            Register / Login
                   |
            User Dashboard
                   |
       ┌───────────┼───────────┐
       ↓           ↓           ↓
 Subscription    Calls      Documents
       ↓           ↓           ↓
    Tokens      LiveKit       RAG
                   ↓
             Transcription
                   ↓
            Save Transcript
                   ↓
             Gemini Summary
```

Super Admin:

```text
              SUPER ADMIN
                   |
            Admin Dashboard
                   |
       ┌───────────┼───────────┐
       ↓           ↓           ↓
     Users    Subscriptions   Usage
                   |
            Create / Edit Plans
                   |
          Price / Tokens / Duration
```

---

# 📌 Development Principles

* Build one phase at a time.
* Complete database changes before dependent application logic.
* Use Sequelize migrations for database changes.
* Keep associations in `models/index.js`.
* Keep business logic inside services.
* Keep controllers thin.
* Do not assume files exist before creating them.
* Avoid unnecessary rewrites of working code.
* Validate ownership on the backend.
* Never trust client-provided billing information.
* Keep API keys and secrets on the backend.
* Use LiveKit for video/audio.
* Use Socket.IO only for real-time events.
* Do not introduce Redis or BullMQ.
* Fix errors before moving to the next development phase.

---

# 📄 License

This project is currently intended for development and educational purposes.

Add your preferred license here before publishing the project publicly.

---

## ⭐ Project Status

Development is being completed incrementally according to the defined development phases.

```text
Backend
   ↓
Database
   ↓
APIs
   ↓
React Integration
   ↓
LiveKit
   ↓
AI / RAG
   ↓
Testing
   ↓
Production Readiness
```

---

### Built With

**Node.js · Express.js · PostgreSQL · Sequelize · React · Vite · Tailwind CSS · LiveKit · Socket.IO · Gemini · pgvector**
