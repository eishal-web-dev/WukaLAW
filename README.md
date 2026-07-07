<div align="center">

# ⚖️ WakuLaw

### Explainable AI Legal Intelligence Platform

**Transforming Legal Data into Explainable Intelligence**

---

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot-6DB33F?style=for-the-badge&logo=springboot)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Python](https://img.shields.io/badge/AI-Python-3776AB?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/Framework-FastAPI-009688?style=for-the-badge&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

**Final Year Project**

Department of Software Engineering

</div>

---

# 📖 Overview

WakuLaw is an Explainable Artificial Intelligence platform developed to assist legal professionals, researchers, students, and judicial institutions in analyzing legal cases using Machine Learning and Natural Language Processing.

Unlike traditional AI systems that only generate predictions, WakuLaw focuses on **Explainable AI (XAI)** by providing transparent reasoning, confidence scores, supporting evidence, and similar historical cases behind every prediction.

The platform is designed as a **Legal Decision Support System**, **not** as a replacement for judges, lawyers, or courts.

---

# 🎯 Vision

To become Pakistan's leading AI-powered legal intelligence platform by combining Artificial Intelligence, Machine Learning, Natural Language Processing, and Explainable AI to improve legal research, accessibility, transparency, and judicial decision support.

---

# 🚀 Mission

To empower legal professionals with intelligent, explainable, and ethical AI technologies that reduce research time, improve legal analysis, and provide transparent insights while respecting the principles of justice and fairness.

---

# ✨ Core Features

## 🤖 AI Legal Intelligence

- Court Case Outcome Prediction
- Explainable AI (Prediction Reasoning)
- Similar Case Retrieval
- Legal Document Summarization
- AI Legal Assistant
- Legal Question Answering

---

## ⚖️ Legal Analytics

- Evidence Strength Analysis
- Contradiction Detection
- Risk Score Analysis
- Legal Timeline Generator
- Citation Recommendation
- Legal Document Intelligence

---

## 🏛 Courtroom Intelligence

- AI Courtroom Simulation
- What-If Analysis Engine
- Prediction Confidence Analysis
- Manipulation Detection
- Bias & Fairness Detection

---

## 📊 Dashboard

- Analytics Dashboard
- Lawyer Dashboard
- Client Dashboard
- Case Management
- Secure Authentication
- Audit Logs

---

# 🏗 System Architecture

```
                        WakuLaw

                     React Frontend
                            │
                            ▼
                  FastAPI REST Backend
                            │
                            ▼
               Legal Intelligence Modules
                        (Python)
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  RAG Q&A Engine     Similarity Engine   Summarization Engine
        │                   │                   │
        └───────────────┬───┴───────────────────┘
                        ▼
                 Explainable AI Layer
                        │
        ┌───────────────┴────────────────┐
        ▼                                ▼
   SQLite / SQL                      FAISS Index
```

> The current MVP architecture is documented in [`docs/00_MVP/ARCHITECTURE_MVP.md`](docs/00_MVP/ARCHITECTURE_MVP.md). The MVP scope is defined in [`docs/00_MVP/MVP_SCOPE.md`](docs/00_MVP/MVP_SCOPE.md); advanced engines below are future scope.

---

# 🧠 AI Modules

The AI Engine consists of multiple intelligent modules working together.

| Module | Description |
|---------|-------------|
| Prediction Engine | Predicts possible court outcomes |
| Similarity Engine | Finds similar historical cases |
| Summarization Engine | Generates concise summaries |
| Evidence Analyzer | Evaluates evidence quality |
| Contradiction Detector | Detects inconsistencies |
| Explainable AI | Explains every prediction |
| Risk Analyzer | Calculates legal risk |
| Bias Detector | Evaluates fairness |
| Courtroom Simulation | Simulates legal arguments |

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion

---

## Backend

- Python
- FastAPI
- SQLAlchemy
- REST APIs

---

## Artificial Intelligence

- Python
- FastAPI
- PyTorch
- Hugging Face Transformers
- Sentence Transformers
- Scikit-learn

---

## Database

- SQLite (MVP) — PostgreSQL/MongoDB planned for later phases

---

## Vector Search

- FAISS

---

## Development

- Git
- GitHub
- Docker
- GitHub Actions

---

# 📂 Repository Structure

```
WakuLaw

├── .github          # issue/PR templates, workflows
├── apps
│   ├── web          # React + Vite + TypeScript + Tailwind frontend
│   └── api          # FastAPI backend + AI modules (ai/)
├── docs
│   ├── 00_MVP       # authoritative scope & architecture for current version
│   └── 01–12_...    # full long-term vision documentation
├── datasets         # dataset registry + small committed samples
├── README.md
└── LICENSE
```

## ✅ Current Status (MVP implemented)

Working today, fully local and free:

| Feature | Status |
|---------|--------|
| User registration & login (JWT, per-user documents) | ✅ |
| Document upload (.txt/.pdf) with validation | ✅ |
| Text extraction, cleaning, chunking | ✅ |
| Structured document summarization (extractive) | ✅ |
| Legal Q&A grounded in uploaded documents (RAG) with sources & confidence | ✅ |
| Similar case search (embeddings + FAISS) with relevance threshold | ✅ |
| Dashboard, responsive UI, disclaimers on all AI output | ✅ |
| Backend test suite (20 tests) | ✅ |
| Outcome prediction, courtroom simulation, Urdu, bias detection | 🔭 future scope |

## 🚀 Getting Started

**One command (Windows / macOS / Linux — needs Python 3.10+ and Node 18+):**

```bash
python run.py
```

First run installs everything automatically (one-time ~1.5 GB download of AI libraries), then starts the API on :8000 and the app on :5173. Later runs start in seconds. `python run.py --setup` installs without starting.

**Alternative — Docker (one command, needs Docker Desktop):**

```bash
docker compose -f docker/docker-compose.yml up --build
```

**Alternative — manual (with Make, macOS/Linux):**

```bash
make setup       # install backend + frontend dependencies
make api         # terminal 1 — backend on :8000
make web         # terminal 2 — frontend on :5173
make test        # run the backend test suite
```

Then open **http://localhost:5173**, create an account, and upload a judgment (.txt/.pdf).
Run `make help` for all commands. Details: `apps/api/README.md`, `apps/web/README.md`.

Notes:
- The first document upload downloads the embedding model once (~90 MB); afterwards everything runs offline.
- Q&A answers are extractive by default; install [Ollama](https://ollama.com) (free) for generated answers — auto-detected, no configuration.

---

# 🧩 Development Philosophy

WakuLaw follows professional software engineering practices.

### Documentation First

Every feature is documented before implementation.

### Clean Architecture

Each module has a single responsibility.

### Explainable AI

Every AI prediction must include reasoning.

### Security by Design

Authentication, authorization, encryption, and auditing are integrated from the beginning.

### Modular Development

Frontend, Backend, AI, and Database remain independent and loosely coupled.

### Responsible AI

Predictions are advisory only and never replace legal professionals or judicial authorities.

---

# 🛣 Development Roadmap

## Phase 1

- Repository Setup
- Documentation
- Product Vision
- PRD
- IEEE SRS

---

## Phase 2

- Database Design
- System Architecture
- API Design
- UI Design

---

## Phase 3

- Frontend Development
- Backend Development
- Authentication

---

## Phase 4

- AI Model Training
- NLP Pipeline
- Similarity Search

---

## Phase 5

- Integration
- Testing
- Deployment
- Final Presentation

---

# 🔒 Security

The platform implements:

- JWT Authentication
- Role-Based Access Control
- Password Encryption
- Audit Logging
- Secure REST APIs
- Input Validation
- Error Handling

---

# 🤖 AI Ethics

WakuLaw follows Responsible AI principles.

- Transparency
- Explainability
- Fairness
- Accountability
- Privacy
- Human Oversight

The system provides legal decision support only and should not be considered a replacement for professional legal advice.

---

# 👨‍💻 Contributors

**Supervisor**

- Sir Zahid Sarwar

**Development Team**

- Eishal
- Marwah Iftikhar

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Future Scope

Future versions of WakuLaw may include:

- Voice-based legal assistant
- OCR for scanned legal documents
- Multi-language support
- Predictive sentencing analysis
- Court hearing scheduling
- Mobile application
- Cloud deployment
- Integration with digital court systems

---

# 🤝 Contributing

Contributions are welcome.

Please read **CONTRIBUTING.md** before submitting issues or pull requests.

---

# 📧 Contact

For academic or development-related queries, please contact the project contributors through the GitHub repository.

---

<div align="center">

### ⚖️ WakuLaw

### Explainable AI Legal Intelligence Platform

**Built with ❤️ for the Future of Legal Technology**

</div>
