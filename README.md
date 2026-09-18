# Vidu — Video Communication & AI Document Platform
# Vidu — Video Communication & AI Document Platform

Vidu is a full-stack web application designed for **video communication and AI-powered document interactions**. Built with **Node.js, Express.js, PostgreSQL, Sequelize, React.js, Tailwind CSS, LiveKit, Socket.IO, and the Gemini API**.
Vidu is a full-stack web application designed for **video communication and AI-powered document interactions**. Built with **Node.js, Express.js, PostgreSQL, Sequelize, React.js, Tailwind CSS, LiveKit, Socket.IO, and the Gemini API**.

It allows users to engage in real-time video calls and upload documents (PDF, DOCX, TXT) to chat with them utilizing Google's Gemini AI.
It allows users to engage in real-time video calls and upload documents (PDF, DOCX, TXT) to chat with them utilizing Google's Gemini AI.

---

## 🚀 Features

* **User Accounts**: Register, login, and secure JWT-based authentication.
* **Live Video Calling**: Real-time video/audio calls powered by LiveKit.
* **AI Document Chat**: Upload documents and interact with them (Q&A) using Google's Gemini AI directly via the native Gemini File API (No external vector database needed).
* **Token Economy**: Call token tracking system and user subscription plans.
* **Real-time Updates**: Powered by Socket.IO for in-app messaging and updates.

---

## 🛠️ Technology Stack

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL
* **ORM:** Sequelize & Sequelize CLI
* **Authentication:** JWT, bcryptjs
* **Real-time & Video:** Socket.IO, LiveKit Server SDK
* **File Uploads:** Multer
* **AI & Machine Learning:** Google GenAI SDK (`@google/genai`)

### Frontend
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS (v4)
* **Routing:** React Router
* **API Communication:** Axios
* **Real-time & Video:** Socket.IO Client, LiveKit React SDK and Components

---

## 🚀 Setup & Installation

### Prerequisites
1. **Node.js** (v18 or higher recommended)
2. **PostgreSQL** installed and running on your local machine
3. **LiveKit Server** credentials (URL, API Key, API Secret)
4. **Gemini API Key** from Google AI Studio

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd vidu
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
NODE_ENV=development
PORT=5000

# Database Credentials
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secret
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# LiveKit Credentials
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Token Rate
CALL_TOKEN_RATE_PER_MINUTE=10
```

Run database migrations to set up the tables:
```bash
npx sequelize-cli db:migrate
```

Start the backend development server:
Start the backend development server:
```bash
npm run dev
```
The backend should now be running on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
The backend should now be running on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

---

## 🗄️ Database Design

The application uses **PostgreSQL + Sequelize**. The core models currently include:
* `User` (Authentication and profile data)
* `Document` (Uploaded file metadata and Gemini references)
* (Additional models are in development for subscriptions and token transactions)

---

## 🔒 Security Notes
- **Environment Variables**: Never commit your `.env` files to GitHub. Make sure they are listed in your `.gitignore`.
- **Backend Secrets**: Keep your Gemini API key, LiveKit secrets, JWT Secrets, and Database passwords strictly on the backend. 
- **Frontend Variables**: Only public variables should use the `VITE_` prefix on the frontend.
Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

---

## 🗄️ Database Design

The application uses **PostgreSQL + Sequelize**. The core models currently include:
* `User` (Authentication and profile data)
* `Document` (Uploaded file metadata and Gemini references)
* (Additional models are in development for subscriptions and token transactions)

---

## 🔒 Security Notes
- **Environment Variables**: Never commit your `.env` files to GitHub. Make sure they are listed in your `.gitignore`.
- **Backend Secrets**: Keep your Gemini API key, LiveKit secrets, JWT Secrets, and Database passwords strictly on the backend. 
- **Frontend Variables**: Only public variables should use the `VITE_` prefix on the frontend.
