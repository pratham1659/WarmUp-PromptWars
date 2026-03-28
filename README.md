# IntentBridge AI 🧠

**Turn chaos into clarity.**

IntentBridge AI is a powerful tool designed to process messy, real-world inputs and transform them into structured, validated, and actionable outputs using the Google Gemini API. Whether it's a panicked tech support request or a complex set of instructions, IntentBridge detects the intent, urgency, and entities to provide a clear path forward.

---

## 🚀 Features

- **Intent Recognition**: Automatically identifies the primary goal of the user's input.
- **Urgency Detection**: Classifies requests based on priority (e.g., critical, high, medium, low).
- **Actionable Steps**: Generates a list of concrete tasks to resolve the situation.
- **Structured Output**: Provides clean JSON responses ready for integration.
- **Multimodal Support**: Capable of processing both text and images (coming soon/integrated).

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Vanilla CSS
- **Backend**: FastAPI (Python 3.10+)
- **AI Engine**: Google Gemini API
- **Tooling**: Node.js, npm, pip

---

## 🏗️ Project Structure

```bash
.
├── backend/            # FastAPI Backend
│   ├── routes/         # API Endpoints
│   ├── services/       # Gemini AI Integration
│   ├── schemas/        # Pydantic Models
│   └── main.py         # App Entry Point
├── frontend/           # React Frontend (Vite)
│   ├── src/            # Components & Logic
│   └── index.html      # Main HTML
└── prompts/            # AI Prompt Templates (Ignored in Git)
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js & npm
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🔌 API Documentation

### POST `/api/process`
Processes raw input to return structured data.

**Request Body:**
```json
{
  "text": "My laptop won't turn on and I have a presentation in 10 minutes!"
}
```

**Successful Response:**
```json
{
  "intent": "Emergency Tech Support",
  "urgency": "critical",
  "user_message": "Based on your input, I've prepared immediate action steps...",
  "actions": [
    { "description": "Hard reset laptop", "type": "alert" },
    { "description": "Check charger & power", "type": "search" }
  ]
}
```

---

## 📝 License
MIT License. Created for **WarmUp-PromptWars**.
