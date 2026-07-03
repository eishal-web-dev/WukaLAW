# API Specification Document

---

# 1. Document Information

| Field | Details |
|--------|---------|
| Document Name | API Specification |
| Project Name | WakuLaw – Explainable AI Legal Intelligence Platform |
| Document ID | WK-DOC-007 |
| Version | 1.0 |
| Status | Draft |
| Prepared By | Team WakuLaw |
| Reviewed By | Sir Zahid Sarwar |
| Department | Software Engineering |
| Last Updated | 03 July 2026 |

---

# 2. Revision History

| Version | Date | Author | Description |
|----------|------------|--------------|----------------|
| 1.0 | 03 July 2026 | Team WakuLaw | Initial API Specification |

---

# 3. Table of Contents

1. Introduction

2. API Standards

3. Authentication APIs

4. User APIs

5. Case APIs

6. Document APIs

7. AI APIs

8. Report APIs

9. Administration APIs

10. Error Responses

11. Status Codes

12. Versioning

---

# 4. Introduction

## Purpose

This document defines all REST APIs used by the WakuLaw platform.

It serves as the contract between the React frontend, Spring Boot backend, and FastAPI AI services.

Every endpoint specifies:

- URL
- HTTP Method
- Request Body
- Response Body
- Authentication
- Validation
- Status Codes

---

# 5. API Standards

## Base URL

```

/api/v1

```

---

## Response Format

Every API shall return the following structure.

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "timestamp": "2026-07-03T10:30:00Z"
}
```

---

## Authentication

JWT Bearer Token

Example

```

Authorization: Bearer <JWT_TOKEN>

```

---

## Content Type

```

application/json

```

---

## HTTP Methods

| Method | Purpose |
|---------|----------|
| GET | Retrieve Data |
| POST | Create |
| PUT | Replace |
| PATCH | Partial Update |
| DELETE | Delete |

---

# End of Part 1
