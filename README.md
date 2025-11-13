Recruitment App — Frontend

A React frontend for the Recruitment App prototype (employer & applicant flows).
Built with Vite + React. Provides job posting, employer dashboard, applicant ranking (AI match score), resume viewing, and basic auth via JWT stored in cookies.

Table of contents

Quick start

Prerequisites

Environment variables

Available scripts

Project structure

Routing & pages

Authentication & cookies

API endpoints (expected)

Deployment notes (static hosts)

Testing & linting

Contributing

License

1. Quick start
# install dependencies
npm install

# dev server
npm run dev

# build for production
npm run build

# preview production build locally
npm run preview

2. Prerequisites

Node.js v16+ (recommended)

npm or yarn

A running backend API (see section API endpoints for required routes)

3. Environment variables

Create a .env file at project root (Vite uses VITE_ prefix):

VITE_API_URL=http://localhost:8050


VITE_API_URL — base URL of your backend API. Defaults to http://localhost:8050 when not set.

Do not store secrets (JWT secret) here; backend must sign tokens and frontend must only store tokens in a cookie.

4. Available scripts

npm run dev — start dev server (Vite)

npm run build — build production assets

npm run preview — locally preview build

npm run lint — run linting (if configured)

npm run test — run tests (if added)

5. Project structure (high-level)
src/
  components/
    Header.jsx
    JobCard.jsx
    ApplicantDrawer.jsx
  pages/
    Login.jsx
    Register.jsx
    Alljobs.jsx
    Jobsposted.jsx
    PostJob.jsx
  utils/
    auth.js        # cookie read/write helpers, JWT decode helper
    api.js         # axios instance
    extract.js     # resume parsing helpers (frontend helpers only)
  App.jsx
  main.jsx
index.html
vite.config.js

6. Routing & pages

Routes are implemented using react-router:

/ — landing or login

/alljobs — list of all jobs (applicant view)

/register — registration page

/employer — employer dashboard (Jobsposted)

/postjob — create a job form

/job/:id — job detail (if implemented)

Note: If your host returns 404 on direct refresh, follow the Deployment notes (add rewrite/redirect to index.html) or use HashRouter.

7. Authentication & cookies

Backend returns a JWT on login. The frontend stores the JWT in a cookie named auth_token and user info in auth_user.

Simple cookie helpers are in src/utils/auth.js.

To decode token without external libs we use:

const decodedToken = JSON.parse(atob(token.split('.')[1]));
const userId = decodedToken.userId || decodedToken.id || decodedToken._id;


For protected actions (posting a job, fetching employer jobs), the frontend decodes the token to get userId and includes the token as Authorization: Bearer <token> where required.

Security note: Storing JWTs in cookies is convenient but be cautious in production — consider httpOnly, Secure cookies set by backend for better protection.

8. API endpoints (expected)

The frontend expects these backend endpoints (examples):

POST /auth/login — returns { token, user }

POST /auth/register — register user

GET /jobs — list all jobs

GET /jobs/user/:userId — list jobs posted by employer

POST /jobs/create — create a job { title, description, company, location, skillsRequired[], postedBy }

POST /applications/apply — apply for a job (resume upload + parsed data)

GET /applications/job/:jobId — list applications for job (must return applicants sorted by score desc)

Response shapes used in the app:

Job: { _id, title, description, company, location, skillsRequired, postedBy, createdAt, appliedcount }

Application: { _id, jobId, userId: { _id, name, email, phone, resumeUrl }, resumeUrl, score, appliedAt }

Adjust base URL via VITE_API_URL.

9. Deployment notes

Common problem: routes return 404 on refresh. Fix depending on host:

Netlify: add public/_redirects:

/*    /index.html   200


Vercel: add vercel.json rewrites:

{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }


Express server (serving build): add a fallback:

app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));


GitHub Pages: use HashRouter or set homepage and configure correctly. For simplicity use HashRouter (routes like /#/alljobs).

Recommendation: use BrowserRouter + host rewrite for production. Use HashRouter only for quick deployments where you cannot configure rewrites.

10. Dependencies (main)

react, react-dom

react-router-dom

axios

framer-motion (animations)

form libraries (optional)

tailwind / CSS (if used)

Install dependencies:

npm install react react-dom react-router-dom axios framer-motion

11. Testing & linting

Add unit tests for critical utils (auth cookie helpers, API wrapper).

Basic manual tests:

Login flow, token stored in cookie

Employer: create job, see job in /employer

Applicant: apply for job, check job applicants via drawer

Direct URL refresh to /alljobs (ensure rewrites set correctly)

12. Contributing

Fork the repo

Create a feature branch: git checkout -b feat/my-feature

Commit and push: git commit -m "feat: ..." && git push

Open a PR with description and test plan

13. Troubleshooting (common issues)

Page not found on refresh: configure server rewrites or use HashRouter.

CORS errors: ensure backend sets CORS to allow browser origin.

Token not found: check cookie name (auth_token) and path/domain settings.

Resume viewer not loading: ensure resumeUrl is a public URL (Cloudinary or signed URL).
