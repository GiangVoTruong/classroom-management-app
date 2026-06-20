# classroom-management-app

Full-stack classroom management application (Coding Challenge #6). Instructors manage students, assign lessons, and chat in real time. Students view lessons, mark them complete, and message their instructor.

**Repository:** https://github.com/GiangVoTruong/classroom-management-app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, Axios, Socket.io Client |
| Backend | Node.js, Express 5, Socket.io, JWT |
| Database | Firebase Firestore |
| SMS | Twilio Verify |
| Email | Nodemailer (SMTP) |

---

## Project Structure

```
classroom-management-app/
│
├── client/                         # React frontend (Vite)
│   ├── src/
│   │   ├── main.jsx                # App entry point
│   │   ├── App.jsx                 # Route definitions
│   │   ├── App.css                 # Global + dashboard styles
│   │   ├── api.js                  # Axios client → Express API
│   │   ├── firebase.js             # Firebase web config
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Phone login (instructor/student)
│   │   │   ├── PhoneVerification.jsx
│   │   │   ├── StudentLogin.jsx    # Email OTP / username login
│   │   │   ├── EmailVerification.jsx
│   │   │   ├── SetupAccount.jsx    # Student password setup from email link
│   │   │   ├── InstructorDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── Chat.jsx            # Real-time messaging UI
│   │   │   ├── DashboardLayout.jsx # Sidebar + topbar shell
│   │   │   ├── Modal.jsx           # Create/Edit student modal
│   │   │   ├── AuthCard.jsx        # Auth page wrapper
│   │   │   └── AuthMethodLinks.jsx # Switch phone ↔ email login
│   │   │
│   │   ├── context/
│   │   │   ├── auth-context.js
│   │   │   └── AuthProvider.jsx    # User session (localStorage + JWT)
│   │   │
│   │   └── hooks/
│   │       ├── useAuth.js
│   │       └── useSocket.js        # Socket.io connection
│   │
│   └── package.json
│
├── .env                            # Shared env (backend + VITE_* vars)
├── config/                         # Backend service configs
│   ├── firebase.js                 # Firestore admin SDK
│   ├── twilio.js                   # Twilio Verify (send/check OTP)
│   └── email.js                    # SMTP welcome + login emails
│
├── routes/
│   ├── auth.js                     # POST /createAccessCode, /validateAccessCode (SMS)
│   ├── instructor.js               # Students CRUD, assign lessons
│   └── student.js                  # Email login, setup account, lessons, profile
│
├── services/
│   ├── authService.js              # SMS OTP business logic
│   └── studentService.js           # Firestore student lookups
│
├── socket/
│   └── chat.js                     # Socket.io: sendMessage, getHistory
│
├── scripts/
│   └── seed-instructor.js          # Seed instructor into Firestore
│
├── utils/
│   ├── phone.js                    # normalizePhone, toE164
│   ├── email.js                    # normalizeEmail
│   ├── jwt.js                      # signStudentToken
│   ├── generateCode.js             # 6-digit OTP
│   └── asyncHandler.js
│
├── screenshots/                    # App screenshots for submission
├── .env                            # All env vars (backend + frontend)
├── index.js                        # Express + Socket.io server entry
└── package.json
```

### Frontend routes

| Path | Page |
|------|------|
| `/` | Phone login (SMS) |
| `/verify-phone` | SMS OTP verification |
| `/student-login` | Student email / password login |
| `/verify-email` | Email OTP verification |
| `/setup-account?token=` | Student account setup |
| `/instructor` | Instructor dashboard (protected) |
| `/student` | Student dashboard (protected) |

### Firebase collections

| Collection | Purpose |
|------------|---------|
| `instructors` | Instructor profiles |
| `students` | Student data, lessons, credentials |
| `accessCodes` | SMS OTP (dev mode) |
| `emailAccessCodes` | Email login OTP |
| `messages/{roomId}/chat` | Chat message history |

---

## How to Run

### Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled
- Twilio Verify service (SMS login)
- SMTP account (Gmail App Password recommended)

### 1. Clone and install dependencies

```bash
git clone https://github.com/GiangVoTruong/classroom-management-app.git
cd classroom-management-app

npm install
cd client && npm install && cd ..
```

### 2. Environment

Copy `firebase-service-account.json` vào thư mục gốc (Firebase Console → Project Settings → Service Accounts).

Chỉnh sửa `.env` ở **thư mục gốc** (dùng chung cho backend và frontend):

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
FIREBASE_PROJECT_ID=your-project-id

INSTRUCTOR_PHONE=0334762421
INSTRUCTOR_NAME=Demo Instructor
INSTRUCTOR_EMAIL=instructor@example.com

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
# SMS_DEV_MODE=true

JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

> **Ghi chú HR / local test:** bật `SMS_DEV_MODE=true` để bỏ qua Twilio, OTP hiện trên màn verify.

### 3. Seed an instructor

Login role is determined by the `instructors` collection in Firestore:

```bash
npm run seed
```

Use the phone number from `INSTRUCTOR_PHONE` in `.env` to log in as instructor.

### 4. Start the application

Open **two terminals**:

**Terminal 1 — Backend (port 3000):**

```bash
npm start
```

**Terminal 2 — Frontend (port 5173):**

```bash
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Deploy on Vercel

Frontend + API chạy trên Vercel (serverless). **Chat (Socket.io) không hoạt động trên Vercel** — cần deploy backend riêng (Render/Railway) nếu cần chat real-time.

### Vercel Environment Variables

Trong Vercel Dashboard → Project → Settings → Environment Variables, thêm:

| Variable | Value |
|----------|--------|
| `FIREBASE_SERVICE_ACCOUNT` | Toàn bộ JSON service account (1 dòng) — **bắt buộc trên Vercel** |
| `SMS_DEV_MODE` | `true` (test SMS không cần Twilio) |
| `JWT_SECRET` | chuỗi bí mật bất kỳ |
| `SMTP_*` | cấu hình email |
| `INSTRUCTOR_PHONE` | SĐT instructor |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` |
| `VITE_API_URL` | để trống (dùng same-origin) |

`GOOGLE_APPLICATION_CREDENTIALS` **không dùng được** trên Vercel — phải dùng `FIREBASE_SERVICE_ACCOUNT`.

Sau khi push code (có `vercel.json` + `api/index.js`), Redeploy trên Vercel.

### 5. Quick test flow (local)

1. **Instructor:** go to `/` → enter seeded phone → enter SMS OTP → `/instructor`
2. **Add student:** Manage Students → Add Student → student receives setup email
3. **Student setup:** open `/setup-account?token=...` from email → set password
4. **Student login:** `/student-login` → email OTP or username/password → `/student`
5. **Chat:** both roles → Message tab in sidebar

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Express backend |
| `npm run dev` | Start backend with file watch |
| `npm run seed` | Seed instructor to Firestore |
| `npm run client` | Start Vite dev server |
| `npm run client:build` | Build frontend for production |

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/createAccessCode` | Send SMS OTP |
| POST | `/validateAccessCode` | Verify SMS OTP |
| POST | `/addStudent` | Create student + send setup email |
| POST | `/assignLesson` | Assign lesson to student(s) |
| GET | `/students` | List all students |
| PUT | `/editStudent/:phone` | Update student |
| DELETE | `/student/:phone` | Delete student |
| POST | `/student/loginEmail` | Send email login OTP |
| POST | `/student/validateAccessCode` | Verify email OTP → JWT |
| POST | `/student/setup-account` | Set password from setup link |
| POST | `/student/login` | Username/password login |
| GET | `/student/myLessons?phone=` | Get student lessons |
| POST | `/student/markLessonDone` | Mark lesson complete |

---

## Screenshots

Place screenshots in the `screenshots/` folder:

| File | URL to capture |
|------|----------------|
| `login.png` | http://localhost:5173/ |
| `instructor-dashboard.png` | http://localhost:5173/instructor |
| `student-dashboard.png` | http://localhost:5173/student |
| `chat.png` | `/instructor` or `/student` → **Message** tab |

![Login](screenshots/login.png)
![Instructor Dashboard](screenshots/instructor-dashboard.png)
![Student Dashboard](screenshots/student-dashboard.png)
![Chat](screenshots/chat.png)

---

## Submission

Public repo: https://github.com/GiangVoTruong/classroom-management-app

Email the link to:

- engineering@skiplinow.com
- hongnguyen.skipli.engineering@gmail.com

---

## License

ISC
