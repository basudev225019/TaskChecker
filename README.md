# Task Tracker (MERN Capstone)

A web app where a registered user can create, complete and delete personal tasks, each with an optional due date. Users only ever see their own tasks.

**Tech stack:** MongoDB (Mongoose) · Express 5 · React 18 (Vite) · Node.js

**Live app:** https://taskchecker-pi.vercel.app/
**Live API:** https://taskchecker-pi.vercel.app/api (health check: [/api/health](https://taskchecker-pi.vercel.app/api/health))
**GitHub repository:** https://github.com/basudev225019/TaskChecker

---

## 1. Project definition

| Item | Decision |
|---|---|
| Problem | People lose track of small tasks and deadlines when they are spread across notes and memory. |
| Target users | Registered users. There is one role: user. (Admin is out of scope for the MVP.) |
| MVP (must have) | Register, log in, log out; create, list, complete and delete tasks; due dates; loading, empty and error states; responsive layout. |
| Later | Editing task titles, filtering and search, pagination controls in the UI, password reset, dark-mode toggle, email reminders. |

### User stories and acceptance criteria

- **US1 Register.** As a visitor, I want to create an account so that my tasks are saved.
  - Name, email and a password of at least 8 characters are required.
  - A duplicate email shows "That email is already registered".
- **US2 Log in.** As a user, I want to log in so that I can reach my tasks.
  - A wrong email or password shows the same generic message.
  - Opening `/` while logged out redirects to `/login`.
- **US3 Add a task.** As a user, I want to add a task with an optional due date.
  - An empty title shows a validation message and nothing is saved.
  - The new task appears at the top of the list without a page refresh.
- **US4 Complete a task.** As a user, I want to tick a task off when it is done.
- **US5 Delete a task.** As a user, I want to remove a task I no longer need.
- **US6 Privacy.** As a user, I cannot see or change another user's tasks (the API returns 404 for them).
- **US7 Overdue.** As a user, I can see which open tasks are past their due date.

## 2. Architecture

```
React (Vite)  --HTTP JSON-->  Express API  --Mongoose-->  MongoDB
   client/                      server/
```

- The browser never talks to MongoDB. All HTTP calls live in `client/src/services/`.
- Auth uses a JWT sent as `Authorization: Bearer <token>`. Passwords are hashed with bcrypt (12 rounds).
- Every task query filters by the logged-in user's id on the server.

```
client/src/        components/ pages/ services/ context/
server/src/        routes/ controllers/ models/ middleware/ config/ utils/
server/test/      unit tests for validation rules
```

## 3. API contract

| Method | Path | Auth | Body / query | Success | Errors |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | No | `name`, `email`, `password` | 201 `{ token, user }` | 400 invalid input, 409 email taken, 429 too many attempts |
| POST | `/api/auth/login` | No | `email`, `password` | 200 `{ token, user }` | 400 missing fields, 401 wrong credentials, 429 |
| GET | `/api/tasks` | Yes | `page`, `limit` (max 50) | 200 `{ items, page, limit, total, totalPages }` | 401 |
| POST | `/api/tasks` | Yes | `title`, `dueDate` (optional) | 201 task | 400, 401 |
| PATCH | `/api/tasks/:id` | Yes | any of `title`, `dueDate`, `completed` | 200 task | 400, 401, 404 |
| DELETE | `/api/tasks/:id` | Yes | — | 204 | 400, 401, 404 |
| GET | `/api/health` | No | — | 200 `{ status: "ok" }` | — |

All errors use one shape: `{ "message": "..." }`. Stack traces and database errors are logged on the server, never sent to the client.

## 4. Running it locally

You need Node.js 18 or newer and a MongoDB database. Either install MongoDB locally, or create a free cluster on MongoDB Atlas and copy its connection string.

**1. Start the API**

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`: set `MONGO_URI` and replace `JWT_SECRET` with a long random string. Then:

```bash
npm run dev
```

**2. Start the frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` requests to the API on port 5000.

**3. Run the tests**

```bash
cd server
npm test
```

## 5. Environment variables

| Where | Name | Purpose |
|---|---|---|
| server | `PORT` | Port for the API (default 5000) |
| server | `MONGO_URI` | MongoDB connection string |
| server | `JWT_SECRET` | Secret used to sign login tokens. Never commit it. |
| server | `JWT_EXPIRES_IN` | Token lifetime, for example `1h` |
| server | `CLIENT_ORIGIN` | Comma-separated frontend origins allowed by CORS |
| client | `VITE_API_URL` | Full API base URL for production builds, for example `https://your-api.example.com/api`. Leave empty in development. |

Only `.env.example` files are committed. Real `.env` files are ignored by Git.

## 6. Deployment checklist

1. **Database:** create a managed MongoDB (for example Atlas). Create a database user with access to this database only. Put the connection string in the host's environment variables.
2. **API:** deploy `server/` to a host that runs a long-running Node process. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (your live frontend URL) and `PORT` if the host requires it.
3. **Frontend:** set `VITE_API_URL` to the live API URL, then run `npm run build` in `client/` and host `client/dist/`. Configure the host to serve `index.html` for unknown paths so `/login` works on refresh.
4. **Check:** the site loads over HTTPS, sign-up, login, add, complete and delete all work, refreshing `/login` works, and no request points at `localhost`.

### Deploying to Vercel (frontend and API together)

`vercel.json` builds the React app and serves the Express API as a serverless function (`api/index.js`) on the same domain, so no CORS setup or `VITE_API_URL` is needed.

1. In MongoDB Atlas, allow network access from `0.0.0.0/0` (Vercel has no fixed IPs).
2. In Vercel, import the GitHub repository and leave the root directory as the repository root.
3. Add the environment variables `MONGO_URI` and `JWT_SECRET` (and optionally `JWT_EXPIRES_IN`), then deploy.

Login rate limiting is kept in memory, so on serverless it applies per function instance rather than globally.

## 7. Testing done

| Area | What was checked | Result |
|---|---|---|
| Input validation | Register, login and task rules, including NoSQL-injection-style input (`{ "$ne": null }`) | 8 of 8 unit tests pass (`npm test`) |
| Frontend build | Production build of the React app | Builds without errors (`npm run build`) |
| API routing without a database | `/api/health` returns 200; `/api/tasks` without a token returns 401; a malformed login returns 400 | Passed |
| Full flow with a live MongoDB (MongoDB Atlas) | Register → add with due date → complete → delete; user B gets 404 on user A's task; duplicate email gives 409; wrong password gives 401; correct login gives 200 | Passed |

## 8. Known limitations

- The dashboard loads the first 50 tasks only. Paging controls are not in the UI yet (the API supports them).
- The JWT is kept in `localStorage`. That is simple but exposed to script injection; an httpOnly cookie is the safer option for production.
- Logging out only clears the token on the client. Tokens stay valid until they expire (default 1 hour).
- No automated browser (end-to-end) tests yet.

## 9. Screenshots

_Add screenshots of the login page, the dashboard (with tasks and the empty state) and the mobile view here._
