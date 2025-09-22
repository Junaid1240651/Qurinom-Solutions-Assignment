# Backend API Documentation

A Node.js/Express + MongoDB backend for a Trello-like boards → lists → cards application with users, roles, comments, and member management. This document explains the architecture, setup, environment variables, folder structure, and the main REST endpoints.

## Stack
- Node.js 18+
- Express 5
- MongoDB with Mongoose 8
- JWT authentication (header or httpOnly cookie)
- express-validator for request validation
- Deployed via Vercel Serverless (app.js entry)

## Quick Start
1. Install dependencies
   - From the `backend` folder:
     - `npm install`
2. Create a `.env` file with the variables below
3. Start the server locally
   - `npm run dev` (nodemon) or `npm start`

The server listens on `PORT` (default 3000) and exposes routes under `/api/*`.

## Environment Variables
Create `backend/.env` with:
- `PORT=3000`
- `MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority`
- `JWT_SECRET=your_jwt_secret`
- `JWT_EXPIRE=7d`
- `NODE_ENV=development` (or `production`)

Notes:
- Cookies use `secure: NODE_ENV === 'production'` and `sameSite: 'strict'`.
- CORS is enabled for `https://qurinom-solutions-assignment.vercel.app` and `http://localhost:3001`.

## Project Structure
```
backend/
  app.js                 # Express app entry (used by Vercel)
  package.json
  vercel.json            # Vercel serverless config
  controllers/
    authController.js    # Register/login/me/logout/profile
    boardController.js   # Boards CRUD + members + board fetch with nested pop.
    listController.js    # Lists CRUD + reorder within board
    cardController.js    # Cards CRUD + move + search + comments
    userController.js    # User search, get by id, update profile
  middleware/
    auth.js              # JWT auth (header or cookie), authorize helper
    errorHandler.js      # Async wrapper + centralized error responses
  models/
    User.js              # User with hashed password
    Board.js             # Board with owner, members (roles), lists refs
    List.js              # List with position and cards refs
    Card.js              # Card with position, labels, members, comments
    Comment.js           # Comment referencing card and author
  routes/
    auth.js              # /api/auth/*
    boards.js            # /api/boards/*
    lists.js             # /api/lists/*
    cards.js             # /api/cards/*
    users.js             # /api/users/*
  services/
    authService.js       # Auth helpers (token, cookie, profile CRUD)
  utils/
    cookies.js           # Helpers to set/clear/read token cookie
    jwt.js               # JWT sign/verify + header token extraction
    response.js          # Consistent JSON API responses
    validation.js        # express-validator rules per resource
```

## Conventions
- All responses: `{ success: boolean, message: string, data?: any, errors?: any }`.
- Auth: Bearer token in `Authorization` header or `token` httpOnly cookie.
- Validation: requests validated using `express-validator`. Failures return `400` with `Validation failed`.
- Errors: centralized in `middleware/errorHandler.js`.

## Authentication Routes (/api/auth)
- POST `/register` — Register a user
  - Body: `{ name, email, password, useCookies? }`
  - Returns `{ user, token? }` (token omitted if `useCookies=true`; cookie set instead)
- POST `/login` — Login a user
  - Body: `{ email, password, useCookies? }`
  - Returns `{ user, token? }`
- GET `/me` — Get current user (auth)
- POST `/logout` — Logout (auth) — clears cookie if set
- PUT `/profile` — Update name/email (auth)

## Board Routes (/api/boards)
- GET `/` — Get all boards for current user (owner or member)
- GET `/:id` — Get a single board with nested lists → cards → comments; validates access
- POST `/` — Create board (auth)
  - Body: `{ title, description?, background?, isStarred? }`
  - Automatically sets owner and adds creator as admin in members
- PUT `/:id` — Update board (owner or admin)
- DELETE `/:id` — Delete board (owner only). Also deletes lists and cards.
- POST `/:id/members` — Add member (owner/admin)
  - Body: `{ email, role? = 'editor' }`
- DELETE `/:id/members/:memberId` — Remove member (owner/admin; cannot remove owner)

## List Routes (/api/lists)
- GET `/board/:boardId` — Get all lists of a board (auth + access)
- POST `/` — Create list (auth + content access: owner/admin/editor)
  - Body: `{ title, board }`
- PUT `/:id` — Update list (auth + content access)
- PUT `/:id/reorder` — Reorder list within a board (auth + content access)
  - Body: `{ position: number }`
- DELETE `/:id` — Delete list (auth + content access)

## Card Routes (/api/cards)
- GET `/list/:listId` — Get cards in a list (auth + access)
- GET `/search` — Search cards across user-accessible boards (auth)
  - Query: `q?`, `boardId?`, `label?`, `dueDate?`
- POST `/` — Create card (auth + content access)
  - Body: `{ title, description?, list, dueDate?, labels? }`
- PUT `/:id` — Update card (auth + content access)
- PUT `/:id/move` — Move card to another list (auth + content access)
  - Body: `{ listId, position }`
- DELETE `/:id` — Delete a card (auth + content access)
- GET `/:id/comments` — Get comments for a card (auth + access)
- POST `/:id/comments` — Add a comment (auth + access)
  - Body: `{ text }`

## User Routes (/api/users)
- GET `/search` — Search users by email (auth; excludes current user; max 10 results)
  - Query: `email`
- GET `/:id` — Get user by id (auth)
- PUT `/profile` — Update profile fields (auth)

## Models
- User: `{ name, email (unique), password (hashed), avatar?, boards[] }`
- Board: `{ title, description?, owner, members[{ user, role: 'admin'|'editor'|'viewer', joinedAt }], lists[], background, isArchived, isStarred }`
 - Board: `{ title, description?, owner, members[{ user, role: 'admin'|'editor'|'viewer', joinedAt }], lists[], background, isPrivate, isArchived, isStarred }`
- List: `{ title, board, position, cards[], isArchived }`
- Card: `{ title, description?, list, board, position, dueDate?, labels[], attachments[], members[], comments[], isArchived }`
- Comment: `{ text, card, author, createdAt, updatedAt }`

## Middleware
- `auth(req,res,next)`: extracts bearer token or cookie; verifies JWT; attaches `req.user`.
- `errorHandler(err, req, res, next)`: maps common Mongoose/JWT errors to API responses.

## Utilities
- `jwt.js`: `generateToken`, `verifyToken`, `extractTokenFromHeader`
- `cookies.js`: `setTokenCookie`, `clearTokenCookie`, `getTokenFromCookies`
- `response.js`: helpers to send success/error/validation/auth/forbidden/notFound
- `validation.js`: all express-validator chains for auth/boards/lists/cards/users

## Deployment (Vercel)
- `vercel.json` routes all traffic to `app.js` using `@vercel/node`.
- Keep request runtime under ~25s (app adds a global 25s timeout) due to Vercel’s 30s limit.

## Common Flows
- Create Board → Create Lists → Create Cards → Add Comments
- Invite members to board (owner/admin) → members can have roles and permissions:
  - owner/admin: manage board, members, content
  - editor: create/edit content
  - viewer: read-only
 - Visibility:
   - Team (isPrivate=false): Any authenticated user can view and edit content
   - Private (isPrivate=true): Only owner and invited members can view/edit

## Error Format Examples
- 401 (no token): `{ success: false, message: "No token, authorization denied" }`
- 403 (no access): `{ success: false, message: "Access denied" }`
- 400 (validation): `{ success: false, message: "Validation failed", errors: [...] }`

## Health Check
- GET `/api/health` → `{ success: true, message: 'Server is running', timestamp }`

## Scripts
- `npm run dev` — start with nodemon
- `npm start` — start normally

---
If anything is unclear or you need examples for specific endpoints (requests/responses), let me know and I’ll add them.