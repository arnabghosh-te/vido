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

# 💰 Token Bi
