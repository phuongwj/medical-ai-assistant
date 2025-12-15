# Medical AI Assistant

## Purpose

This project is a simple chat application designed to reduce clinician administrative burdens by answering frequently asked questions (FAQs) about a medical centre. It uses a lightweight Retrieval-Augmented Generation (RAG) approcah, leveraging Google Gemini for AI responses and PostgreSQL with pgvector for semantic search. The chatbot only answers questions based on ingested FAQ documents, focusing on administrative topics (appointments, billing, hours, etc.) and never provides medical advice.


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

### 1. Get a Gemini API Key
- Sign up at [Google AI Studio](https://aistudio.google.com/app/apikey) and create a Gemini API key.
- **Install Visual Studio C++ Build Tools (Windows only, required for pgvector):**
	- Download from [https://visualstudio.microsoft.com/visual-cpp-build-tools/](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
	- During installation, select "Desktop development with C++".
- **Install pgvector extension:**
	- Open a terminal (as admin) and run:
		```sh
		cd "C:\Program Files\PostgreSQL\<version>\bin"
		psql -U postgres
		CREATE EXTENSION IF NOT EXISTS vector;
		```
	- If you get an error, ensure pgvector is installed. You can install it via [pgvector GitHub](https://github.com/pgvector/pgvector#installation) or using `CREATE EXTENSION` if using PostgreSQL 15+.

    ### 3. Set Up the Database
- Create a new database (e.g., `medical_ai`):
	```sh
	createdb -U postgres medical_ai
	```
- Run the provided SQL script to create tables:
	```sh
	psql -U postgres -d medical_ai -f backend/databases/script.sql
	```
- Populate the `faq_documents` table with your FAQ data (manually or via SQL).

### 4. Create a `.env` File
- In the `backend/` folder, create a `.env` file with the following:
	```env
	GEMINI_API_KEY=your_gemini_api_key_here
	DB_HOST=localhost
	DB_PORT=5432
	DB_USER=postgres
	DB_PASSWORD=your_postgres_password
	DB_NAME=medical_ai
	```

### 5. Install Dependencies & Run the App
- Open a terminal in the `backend/` folder and run:
	```sh
	npm install
	npm run dev
	```
- The server will start on [http://localhost:8000](http://localhost:8000)

### 6. Access the Chat Interface
- Open your browser and go to: [http://localhost:8000](http://localhost:8000)
- You should see the chat UI. Try asking a question!


## Notes
- **First Run:** After adding FAQ documents, call `POST /api/ingestDocuments` (e.g., with Postman or curl) to generate embeddings.
- **Security:** Never expose your Gemini API key or database credentials publicly.
- **Limitations:** This chatbot only answers administrative questions based on the provided FAQ context. It does **not** provide medical advice or diagnosis.


## Troubleshooting
- If you encounter errors with `pgvector`, ensure Visual Studio C++ Build Tools are installed and the extension is enabled in your database.
- For database connection issues, double-check your `.env` values and PostgreSQL service status.
