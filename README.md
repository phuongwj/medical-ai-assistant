# Medical AI Assistant

## Table of Contents:

- [Purpose](#purpose)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
    + [POST /api/sendMessage](#post-apisendmessage)
    + [POST /api/ingestDocuments](#post-apiingestdocuments)
- [Local Setup Instructions](#local-setup-instructions)
	+ [Notes](#notes)
	+ [1. Clone the repository](#1-clone-the-repository)
	+ [2. Get a Gemini API Key](#2-get-a-gemini-api-key)
	+ [3. Install PostgreSQL and pgvector](#3-install-postgresql-and-pgvector)
	+ [4. Install pgvector Extension](#4-install-pgvector-extension)
		+ [Windows](#windows)
		+ [macOS](#macos)
	+ [5. Set Up the Database](#5-set-up-the-database)
		+ [Windows](#windows-1)
		+ [macOS](#macos-1)
	+ [6. Create a `.env` file](#6-create-a-env-file)
	+ [7. Install Dependencies & Run the App](#7-install-dependencies--run-the-app)
	+ [8. Access the Chat Interface](#8-access-the-chat-interface)
- [Troubleshooting](#troubleshooting)


## Purpose

This project is a simple chat application designed to reduce clinician administrative burdens by answering frequently asked questions (FAQs) about a medical centre. It uses a lightweight Retrieval-Augmented Generation (RAG) approach, leveraging Google Gemini for AI responses and PostgreSQL with pgvector for semantic search. The chatbot only answers questions based on ingested FAQ documents, focusing on administrative topics (appointments, billing, hours, etc.) and never provides medical advice.

You can check out the demo video [here](https://youtu.be/D6few9ELmfA).


## Project Structure

```
medical-ai-assistant/
│
├── backend/
│   ├── controllers/
│   │   └── messageController.js   # Handles chat logic, RAG, and ingestion
│   ├── databases/
│   │   ├── postgres.js            # PostgreSQL connection setup
│   │   └── script.sql             # SQL schema for tables
│   ├── routes/
│   │   └── messageRoutes.js       # API route definitions
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Express server setup
│
├── frontend/
│   ├── message.html               # Chat UI
│   ├── message.js                 # Frontend chat logic
│   └── message.css                # Chat styling
│
└── README.md                      # Project documentation
```


## API Endpoints


### 1. `POST /api/sendMessage`

- **Description:** Handles user chat messages and returns an AI-generated answer based on FAQ context.
- **Request Body:**
```json
{
    "message": "What are your clinic hours?"
}
```
- **Response:**
```json
{
    "success": true,
    "message": "Our clinic is open from 8am to 5pm, Monday to Friday.",
    "confidence": "high",
    "sources": [
        {
            "title": "Clinic Hours",
            "category": "General",
            "similarity": "0.912"
        }
    ]
}
```


### 2. `POST /api/ingestDocuments`
- **Description:** One-time endpoint to ingest FAQ documents, chunk them, and store embeddings. Please call this right after populating the `faq_documents` table.
- **Request Body:** *None*
- **Response:**
```json
{
    "success": true,
    "message": "Successfully ingested ... documents into ... chunks"
}
```


## Local Setup Instructions

Please note: There are two branches `main` and `dev`, to run this project locally, please check out to branch `dev`, as `main` is for AWS development purposes. 


### Notes
- **First Run:** After adding FAQ documents, call `POST /api/ingestDocuments` (e.g., with Postman or curl) to generate embeddings.
- **Security:** Never expose your Gemini API key or database credentials publicly.
- **Limitations:** This chatbot only answers administrative questions based on the provided FAQ context. It does **not** provide medical advice or diagnosis.


### 1. Clone the repository
```bash
git clone https://github.com/phuongwj/medical-ai-assistant.git
cd medical-ai-assistant
git checkout dev
```


### 2. Get a Gemini API Key
- Sign up at [Google AI Studio](https://aistudio.google.com/app/apikey) and create a Gemini API key.
- Save this key for later, you'll need it in your environment variables.


### 3. Install PostgreSQL and pgvector
- Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/) (if you don't have it yet!).
- **During Installation:** Remember the password you set for the `postgres` user.
- Add PostgreSQL to your system PATH if the installer asks.


### 4. Install pgvector Extension

#### Windows:
1. Install [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Select "Desktop development with C++" during installation
2. Install pgvector:
- Follow the instruction [here](https://github.com/pgvector/pgvector) to install the pgvector extension.

#### macOS
```bash
brew install pgvector
```


### 5. Set Up the Database
> **Run these commands from the project root directory (`medical-ai-assistant/`)**

#### Windows:
1. **Open Command Prompt or PowerShell as Administrator**

2. **Navigate to PostgreSQL bin directory:**
	```cmd
	cd "C:\Program Files\PostgreSQL\<version>\bin"
	```
	*(Replace `<version>` with your installed version, e.g., `15` or `16`)*

3. **Create the database:**
	```cmd
	createdb -U postgres medical_ai
	```

4. **Run the database script:**
	```cmd
	psql -U postgres -d medical_ai -f "C:\path\to\medical-ai-assistant\backend\databases\script.sql"
	```
	*(Replace with your actual project path)*

5. **Verify the setup:**
	```cmd
	psql -U postgres -d medical_ai -c "SELECT COUNT(*) FROM faq_documents;"
	```
	You should see `25` documents loaded.

#### macOS:
PostgreSQL commands should work directly from the terminal.

1. **Create the database:**
	```bash
	createdb -U postgres medical_ai
	```

2. **Run the database script:**
	```bash
	psql -U postgres -d medical_ai -f backend/databases/script.sql
	```

3. **Verify the setup:**
	```bash
	psql -U postgres -d medical_ai -c "SELECT COUNT(*) FROM faq_documents;"
	```
	You should see `25` documents loaded.


### 6. Create a `.env` File
- In the `backend/` folder, create a `.env` file with the following:
	```env
	GEMINI_API_KEY=your_gemini_api_key_here
	DB_HOST=localhost
	DB_PORT=5432
	DB_USER=postgres
	DB_PASSWORD=your_postgres_password
	DB_NAME=medical_ai
	```

### 7. Install Dependencies & Run the App
- Open a terminal in the `backend/` folder and run:
	```bash
	npm install
	npm run dev
	```
- The server will start on [http://localhost:8000](http://localhost:8000)


### 8. Access the Chat Interface
- Open your browser and go to: [http://localhost:8000](http://localhost:8000)
- You should see the chat UI. Try asking a question! 
	> You could try ask something like "How do I book an appointment?", "How do I see my lab results, and how long do they usually take?", or "Can you diagnose my chest pain?".


## Troubleshooting
- If you encounter errors with `pgvector`, ensure Visual Studio C++ Build Tools are installed and the extension is enabled in your database.
- For database connection issues, double-check your `.env` values and PostgreSQL service status.
- If any of the steps above doesn't work, please don't hesitate to contact me :)