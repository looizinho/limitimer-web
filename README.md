# Limitimer

A countdown timer web application built with Next.js 16, React 19, TypeScript, and Tailwind CSS. It supports user registration/login, multiple timer instances, QR code control, and persists data in MongoDB. Designed for deployment on Vercel.

<div align="center">
  <a href="https://www.youtube.com/watch?v=To7MAZv7lWc">
    <img src="https://img.youtube.com/vi/To7MAZv7lWc/0.jpg" alt="Texto Alternativo">
  </a>
</div>

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Development Server](#running-the-development-server)
- [Building for Production](#building-for-production)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Timer Management](#timer-management)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features
- User registration and login with username (3‑20 lowercase letters) and 4‑digit PIN.
- Create, start, pause, reset, and stop countdown timers.
- QR code generation for mobile control of timers.
- Server‑side persistence with MongoDB.
- Dark mode support via Tailwind CSS.
- Deployable to Vercel with zero‑config Vercel Functions (Fluid Compute).

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm
- **Database:** MongoDB (connected via `MONGO_URL` env var)
- **QR Codes:** `qrcode.react`
- **Authentication:** Custom auth via API routes
- **Hosting:** Vercel (Fluid Compute)

## Prerequisites
- Node.js (v20+ recommended)
- pnpm (`npm i -g pnpm` or `brew install pnpm`)
- Access to a MongoDB instance (e.g., MongoDB Atlas)
- Vercel account (optional, for deployment)

## Installation
```bash
# Clone the repo
git clone https://github.com/looizinho/limitimer-web.git
cd limitimer-web

# Install dependencies
pnpm install
```

## Running the Development Server
```bash
pnpm dev
```
Visit <http://localhost:3000> (or any origin listed in `next.config.ts`).

## Building for Production
```bash
pnpm build   # Create a production build
pnpm start   # Run the built app
```

## Environment Variables
Create a `.env.local` file at the project root (git‑ignored) with the following key:
```
MONGO_URL=<your-mongodb-connection-string>
```
The app reads `process.env.MONGO_URL` to connect to MongoDB. Ensure the variable is set both locally and in Vercel (Settings → Environment Variables).

## Project Structure
```
/
├─ app/                     # Next.js App Router pages
│   ├─ layout.tsx
│   ├─ page.tsx             # Home page
│   ├─ api/
│   │   ├─ auth/
│   │   │   └─ register-login/route.ts   # Auth endpoint
│   │   └─ timers/
│   │       ├─ route.ts       # POST – create timer
│   │       └─ [id]/route.ts # GET / PUT – timer CRUD
│   └─ timer/
│       └─ [id]/            # Desktop and mobile timer UI
├─ components/             # Reusable UI components
│   ├─ Footer.tsx
│   ├─ HomeContent.tsx
│   ├─ LoginPanel.tsx
│   ├─ QRCode.tsx
│   └─ TimerDisplay.tsx
├─ lib/                    # Business logic
│   ├─ mongodb.ts            # MongoDB connection helper
│   ├─ timerStorage.ts       # CRUD ops for timers
│   ├─ userStorage.ts        # User registration & login helpers
│   ├─ useAuthContext.ts    # React context for auth state
│   └─ useTimerState.ts     # Hook for client‑side timer polling
├─ public/                 # Static assets (icons, images)
├─ types/                  # TypeScript type definitions
│   ├─ timer.ts
│   └─ user.ts
├─ next.config.ts          # Next.js config (allowedDevOrigins)
├─ tsconfig.json
├─ package.json
└─ README.md               # This file
```

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register-login` | Register a new user or log in an existing one. Expects `{ username, pin }`. |
| `POST` | `/api/timers` | Create a new timer. Body: `{ eventName?, initialSeconds?, userId? }`. Returns `{ id, eventName, initialSeconds }`. |
| `GET` | `/api/timers/:id` | Retrieve timer details. |
| `PUT` | `/api/timers/:id` | Update timer state. Body: `{ action: 'start'|'pause'|'stop'|'reset'|'set-time'|'mark-qr-scanned', seconds? }`. |
| `GET` | `/api/timers/:id` (via client) | Used by the `useTimerState` hook for polling. |

## Authentication Flow
1. **Login / Register** – Client sends `username` (3‑20 lowercase letters) and a 4‑digit PIN to `/api/auth/register-login`.
2. If the user exists, the endpoint returns the stored `userId` and `username`.
3. If the user does not exist, a new record is created (username is unique).
4. The client stores `userId` and `username` in `localStorage` (`limitimer_userId`, `limitimer_username`) and uses the `AuthContext` to expose auth state throughout the app.

## Timer Management
- **Create** – Home page (`HomeContent`) posts to `/api/timers` with an optional event name and timer length (default 60 s).
- **Control** – Desktop (`/timer/:id`) and mobile (`/timer/:id/mobile`) pages use the `useTimerState` hook to poll the timer every second and expose actions (`start`, `pause`, `stop`, `reset`, `set-time`).
- **QR Code** – `QRCode` component renders a QR code linking to the mobile view, allowing remote control of the timer. Scanning the QR code automatically marks the timer as “QR scanned” via `markQrScanned`.

## Dual-Target Build System

This project supports two build targets:

### Web Build (Default)
```bash
pnpm dev       # Local development
pnpm build     # Production SSR build for Vercel
pnpm start     # Run production server locally
```

The web build is a standard Next.js SSR application deployed to Vercel.

### Tauri Build (In Development)
```bash
pnpm tauri:dev    # Development server with Tauri config
pnpm tauri:build  # Static export to out/ directory
```

The Tauri build generates a static export for embedding in the Tauri desktop app. This is in active development (Phase 2-3).

**Note:** Use `pnpm build` (web) for Vercel deployment. Use `pnpm tauri:build` for desktop testing.

## Deployment
The project is ready for Vercel:
```bash
# From the repo root
vercel   # (or `vercel --prod` to deploy to production)
```
- Vercel Functions run on Fluid Compute (Node.js 24 LTS).
- Environment variables are managed in the Vercel dashboard (add `MONGO_URL`).
- The `allowedDevOrigins` list in `next.config.ts` must include any host you use for local development (`mac`, `mac.local`, etc.).

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/your-feature`).
3. Install dependencies with `pnpm install`.
4. Make your changes and run `pnpm lint` to ensure code quality.
5. Open a Pull Request with a clear description of the change.

## License
This project is open‑source. See the repository for the appropriate license file.

---
*Generated by Claude Code*.
