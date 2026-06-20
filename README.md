# classroom-management-app

Full-stack classroom management app (Coding Challenge #6). Instructors manage students, assign lessons, and chat in real time. Students complete lessons and message their instructor.

**Repository:** https://github.com/GiangVoTruong/classroom-management-app

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, Axios, Socket.io Client |
| Backend | Node.js, Express 5, Socket.io, JWT |
| Database | Firebase Firestore |
| SMS | Twilio Verify |
| Email | Nodemailer (SMTP) |

## Project Structure

```
classroom-management-app/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── api.js             # Axios API client
│   │   ├── components/        # Chat, Modal, DashboardLayout, ...
│   │   ├── context/           # AuthProvider (localStorage + JWT)
│   │   ├── hooks/             # useAuth, useSocket
│   │   └── pages/             # Login, dashboards, setup, verify
│   └── .env.example
├── config/                    # firebase, twilio, email
├── routes/                    # auth, instructor, student
├── services/                  # authService, studentService
├── socket/                    # Socket.io chat
├── scripts/                   # seed-instructor.js
├── screenshots/               # App screenshots (see below)
├── index.js                   # Express entry
└── .env.example
```

## Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled
- Twilio Verify service (SMS login)
- SMTP credentials (student welcome + login emails)

## Setup & Run

### 1. Clone and install

```bash
git clone https://github.com/GiangVoTruong/classroom-management-app.git
cd classroom-management-app
npm install
cd client && npm install && cd ..
```

### 2. Environment

```bash
cp .env.example .env
cp client/.env.example client/.env
```

Edit `.env`:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
FIREBASE_PROJECT_ID=your-project-id

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

JWT_SECRET=change-me-in-production

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

INSTRUCTOR_PHONE=0334762421
INSTRUCTOR_NAME=Demo Instructor
INSTRUCTOR_EMAIL=instructor@example.com
```

Place your Firebase service account JSON at `firebase-service-account.json` (never commit this file).

Optional: `SMS_DEV_MODE=true` skips Twilio and shows OTP in the UI for local testing.

### 3. Seed instructor

```bash
npm run seed
```

### 4. Start servers

**Backend:**

```bash
npm start
```

**Frontend:**

```bash
cd client
npm run dev
```

Open http://localhost:5173

## User Flows

### Instructor — Phone + SMS OTP

1. Login at `/` with phone number
2. Enter SMS code at `/verify-phone`
3. Dashboard: manage students, assign lessons, chat

### Student onboarding (instructor-created)

1. Instructor adds student (`POST /addStudent`) → welcome email with setup link
2. Student opens `/setup-account?token=...` → sets password
3. Student logs in at `/student-login` via **email OTP** or **username/password**

### Real-time chat

Instructor and student use the **Message** tab. Socket.io events: `join`, `sendMessage`, `receiveMessage`, `getHistory`.

## API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/createAccessCode` | Send SMS OTP |
| POST | `/validateAccessCode` | Verify SMS OTP |
| POST | `/addStudent` | Create student + send setup email |
| POST | `/assignLesson` | Assign lesson(s) |
| GET | `/students` | List students |
| POST | `/student/loginEmail` | Send email login OTP |
| POST | `/student/validateAccessCode` | Verify email OTP → JWT |
| POST | `/student/setup-account` | Set password from setup link |
| POST | `/student/login` | Username/password login |

## Firebase Collections

| Collection | Purpose |
|------------|---------|
| `instructors` | Instructor profiles |
| `students` | Student profiles, lessons, credentials |
| `accessCodes` | SMS OTP (dev mode) |
| `emailAccessCodes` | Email login OTP |
| `messages/{roomId}/chat` | Chat history |

## Screenshots

| File | Description |
|------|-------------|
| `screenshots/login.png` | Phone login |
| `screenshots/instructor-dashboard.png` | Instructor dashboard |
| `screenshots/student-dashboard.png` | Student dashboard |
| `screenshots/chat.png` | Real-time chat |

![Login](screenshots/login.png)
![Instructor Dashboard](screenshots/instructor-dashboard.png)
![Student Dashboard](screenshots/student-dashboard.png)
![Chat](screenshots/chat.png)

## Submission

Public repo: https://github.com/GiangVoTruong/classroom-management-app

Email the link to:

- engineering@skiplinow.com
- hongnguyen.skipli.engineering@gmail.com

## License

ISC
