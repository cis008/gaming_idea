# Gamified AI Study Companion

Full-stack learning app with a React frontend, Django REST backend, and LangChain + CrewAI multi-agent AI orchestration.

## Features

- Landing page with full-screen Earth-from-space hero and CTA buttons
- Login / Signup
- Dashboard with points, levels, quizzes completed, accuracy, progress bar, streak, badges, and recent quizzes
- Learning flow: topic input → AI concept explanation
- Quiz flow: AI-generated MCQ quiz (3-5 questions)
- Result flow: score, mistake explanations, XP gain animation, level-up notification
- Gamification rules:
  - Correct answer: +10 XP
  - Levels: 1 (0 XP), 2 (50 XP), 3 (100 XP), 4 (200 XP)
  - Badges: First Quiz, Perfect Score, 5 Quiz Streak

## Architecture

### AI Layer (LangChain + CrewAI)
- `apps/ai_agents/agents.py`: defines ConceptTutorAgent, QuizGeneratorAgent, QuizEvaluatorAgent, GamificationAgent
- `apps/ai_agents/tasks.py`: CrewAI tasks
- `apps/ai_agents/crew.py`: sequential crew workflow
- `apps/ai_agents/service.py`: LangChain prompt templates + LLM calls + structured outputs + fallback behavior

### Backend Endpoints
- `POST /api/explain-topic`
- `POST /api/generate-quiz`
- `POST /api/submit-quiz`
- `GET /api/dashboard`
- `GET /api/progress`
- `POST /api/signup`
- `POST /api/login`

## Backend Setup (Django)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

## Frontend Setup (React + Tailwind)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Env Variables

Backend `.env`:

- `LLM_PROVIDER=openai` or `gemini`
- `OPENAI_API_KEY=...`
- `GEMINI_API_KEY=...`
- Optional: `OPENAI_MODEL`, `GEMINI_MODEL`

Frontend `.env`:

- `VITE_API_BASE_URL=http://127.0.0.1:8000/api`

## Application Flow

Landing Page
→ User Login / Signup
→ User Dashboard
→ Topic Selection
→ AI Concept Explanation
→ AI Generated Quiz
→ User Submits Answers
→ AI Evaluates Quiz
→ Gamification Updates
→ Dashboard Updates
