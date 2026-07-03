# Software Requirements Specification (SRS)

---

# 1. Document Information

| Field | Details |
|--------|---------|
| Document Name | Software Requirements Specification |
| Project Name | WakuLaw – Explainable AI Legal Intelligence Platform |
| Document ID | WK-DOC-003 |
| Version | 1.0 |
| Status | Draft |
| Prepared By | Team WakuLaw |
| Reviewed By | Sir Zahid Sarwar |
| Department | Software Engineering |
| Last Updated | 03 July 2026 |

---

# 2. Revision History

| Version | Date | Author | Description |
|----------|------------|----------------|-----------------------------|
| 1.0 | 03 July 2026 | Team WakuLaw | Initial Software Requirements Specification |

---

# 3. Table of Contents

1. Introduction

2. Overall Description

3. External Interface Requirements

4. System Features

5. Non-Functional Requirements

6. AI Requirements

7. Database Requirements

8. Security Requirements

9. Appendices

---

# 4. Introduction

## 4.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for WakuLaw, an Explainable AI Legal Intelligence Platform. The purpose of this document is to provide a complete technical specification that guides the design, development, testing, deployment, and maintenance of the system.

The SRS serves as the primary reference for developers, testers, project supervisors, and future contributors by describing how the system shall behave, the services it shall provide, and the constraints under which it must operate.

---

## 4.2 Scope

WakuLaw is a web-based Legal Intelligence Platform that integrates Artificial Intelligence, Machine Learning, Natural Language Processing, and Explainable AI to support legal research and case analysis.

The platform enables users to:

- Predict possible court case outcomes.
- Retrieve similar historical legal cases.
- Summarize lengthy legal documents.
- Analyze legal evidence.
- Detect contradictions.
- Simulate courtroom scenarios.
- Interact with an AI Legal Assistant.
- Manage legal cases through a secure web application.

The platform functions solely as a legal decision-support system and shall not replace legal professionals or judicial authorities.

---

## 4.3 Intended Audience

This document is intended for:

- Project Supervisor
- Software Developers
- AI Engineers
- UI/UX Designers
- Database Engineers
- Software Testers
- Future Project Contributors

---

## 4.4 Definitions, Acronyms and Abbreviations

| Term | Definition |
|------|------------|
| AI | Artificial Intelligence |
| ML | Machine Learning |
| NLP | Natural Language Processing |
| XAI | Explainable Artificial Intelligence |
| API | Application Programming Interface |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| UI | User Interface |
| UX | User Experience |
| PRD | Product Requirements Document |
| SRS | Software Requirements Specification |

---

## 4.5 References

The requirements defined within this document are derived from:

- WakuLaw Product Vision Document (WK-DOC-001)
- WakuLaw Product Requirements Document (WK-DOC-002)
- IEEE 29148 Software Requirements Specification Standard
- SWEBOK (Software Engineering Body of Knowledge)
- Artificial Intelligence Research Publications
- Legal Technology (LegalTech) Literature

---

## 4.6 Document Overview

This document specifies the technical requirements for WakuLaw and serves as the engineering blueprint for system implementation.

Subsequent chapters describe the overall system architecture, software interfaces, functional requirements, non-functional requirements, AI requirements, database requirements, security requirements, and implementation constraints.
---

# 5. Overall Description

## 5.1 Product Perspective

WakuLaw is a standalone web-based Legal Intelligence Platform designed to support legal professionals, researchers, students, and educational institutions through Artificial Intelligence. The system combines legal case management with AI-powered decision-support tools, providing intelligent legal analysis while maintaining transparency and human oversight.

The platform follows a modular architecture consisting of four primary layers:

- Presentation Layer (React Frontend)
- Business Logic Layer (Spring Boot Backend)
- AI Intelligence Layer (Python FastAPI Services)
- Data Layer (MongoDB)

Each layer operates independently and communicates through secure RESTful APIs, allowing future scalability and modular expansion.

---

## 5.2 Product Functions

The major functions of WakuLaw include:

### User Management

- User Registration
- User Authentication
- Profile Management
- Role-Based Access Control

---

### Case Management

- Create New Case
- Upload Legal Documents
- Edit Case Information
- Delete Cases
- Search Cases
- View Case History

---

### AI Legal Intelligence

- Court Case Outcome Prediction
- Similar Case Retrieval
- Legal Document Summarization
- AI Legal Assistant
- Explainable AI

---

### Legal Analytics

- Evidence Strength Analysis
- Contradiction Detection
- Risk Assessment
- Legal Timeline Generation

---

### Courtroom Intelligence

- Courtroom Simulation
- What-If Scenario Analysis

---

### Dashboard & Reports

- Analytics Dashboard
- Prediction Reports
- Evidence Reports
- Downloadable PDF Reports

---

### Administration

- User Management
- Dataset Management
- AI Model Monitoring
- System Monitoring
- Audit Logs

---

## 5.3 User Classes and Characteristics

The system supports multiple categories of users.

| User Class | Description |
|------------|-------------|
| Administrator | Manages users, datasets, AI models, and overall platform configuration. |
| Lawyer | Uploads legal cases, performs legal research, analyzes evidence, and receives AI-assisted predictions. |
| Law Student | Uses the platform for educational purposes, learning legal concepts, and studying historical cases. |
| Legal Researcher | Performs legal analytics, judicial trend analysis, and research activities. |
| Guest User | May access public information but cannot perform protected operations without authentication. |

---

## 5.4 Operating Environment

The platform shall operate within the following environment.

### Client Side

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

---

### Server Side

- Ubuntu Linux Server
- Windows Server

---

### Backend

- Spring Boot
- Java 21

---

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

---

### AI Services

- Python
- FastAPI
- PyTorch
- Hugging Face Transformers
- Sentence Transformers
- Scikit-learn

---

### Database

- MongoDB

---

## 5.5 Design Constraints

The following constraints influence system development.

- Limited availability of Pakistani legal datasets.
- Academic development timeline.
- Budget limitations restrict commercial AI services.
- AI predictions are advisory only.
- Legal decisions remain the responsibility of qualified legal professionals.
- Internet connectivity is required for web access.

---

## 5.6 Assumptions and Dependencies

### Assumptions

- Users possess basic computer literacy.
- Historical legal datasets are available for AI model training.
- Users have stable internet access.
- The hosting environment supports Java, Python, and MongoDB.

---

### Dependencies

The platform depends on:

- React
- Spring Boot
- MongoDB
- FastAPI
- JWT Authentication
- Hugging Face
- FAISS
- GitHub
- Docker
