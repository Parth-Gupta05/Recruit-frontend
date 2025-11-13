# Recruitment App — Frontend (React + Vite)

This is the frontend for a recruitment system that supports job posting, applicant job matching, and employer dashboards.  
It includes authentication, job listings, AI-based match scoring display, and resume viewing — built with React + Vite.

---

## 🔧 Tech Stack
- **React + Vite**
- **React Router**
- **Axios**
- **Framer Motion** (animations)
- **JWT Auth (stored in cookies)**

---

## 🚀 Features
- User authentication (login/register)
- Applicant view → browse & apply to jobs  
- Employer view → post jobs & manage applicants  
- Applicants ranked by **AI-based match score**
- Sliding drawer to view full applicant details & resume
- Environment-based API configuration (`VITE_API_URL`)

---

## 📦 Setup

```bash
npm install
npm run dev
```

## 🔧 Environment Setup

Create a `.env` file in the project root:

VITE_API_URL=http://localhost:8050

yaml
Copy code

---

## 📁 Project Structure (Brief)

src/
pages/ # Login, Register, Alljobs, Jobsposted, PostJob
components/ # UI components
utils/ # auth + API helpers
App.jsx

yaml
Copy code

---

## 🔗 Expected API Endpoints

POST /auth/login
POST /auth/register

GET /jobs
GET /jobs/user/:userId

POST /jobs/create

POST /applications/apply
GET /applications/job/:jobId

Copy code
