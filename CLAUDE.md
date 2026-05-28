# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using React 19, TypeScript, and Tailwind CSS. The project uses **pnpm** as its package manager and follows the App Router convention.

**⚠️ Important:** Next.js 16 has breaking changes from prior versions. Consult `node_modules/next/dist/docs/` before implementing features. Always heed deprecation notices in error messages.

## Quick Start

### Development
- **Dev server:** `pnpm dev` → runs on `http://localhost:3000`
- **Build:** `pnpm build`
- **Start production build:** `pnpm start`
- **Lint:** `pnpm lint`

### Package Manager
This project uses **pnpm** exclusively. Do not use npm or yarn. Install dependencies with `pnpm install` or `pnpm add <package>`.

The workspace configuration (`pnpm-workspace.yaml`) allows for monorepo-style development. Note the `allowBuilds` section enables sharp (image optimization) and unrs-resolver.

## Architecture & File Structure

### App Directory
- `app/layout.tsx` – Root layout wrapping all pages, defines metadata, fonts (Geist Sans/Mono)
- `app/page.tsx` – Home page component
- `app/globals.css` – Global styles with Tailwind directives
- `public/` – Static assets (SVGs, images)

### Configuration
- `tsconfig.json` – TypeScript configuration with path alias `@/*` for project root
- `next.config.ts` – Next.js configuration (currently minimal)
- `postcss.config.mjs` – Tailwind CSS v4 integration via `@tailwindcss/postcss`
- `eslint.config.mjs` – ESLint configuration using flat config format (ESLint 9+) with Next.js core-web-vitals and TypeScript presets

### CSS & Styling
- Tailwind CSS v4 (via PostCSS)
- No component library installed; Tailwind classes used directly
- Dark mode support available through Tailwind's dark mode utilities

## Key Development Notes

### TypeScript
- Strict mode enabled (`"strict": true`)
- Target: ES2017
- Module resolution: bundler
- Next plugin configured for type checking

### Images & Fonts
- Use `next/image` for image optimization (see `app/page.tsx` for examples)
- Use `next/font/google` for font optimization (Geist fonts configured in layout)

### Environment Variables
- `.env*` files ignored by git (add credentials to `.env.local`)
- Use `process.env.NEXT_PUBLIC_*` for client-side env vars

### ESLint
New flat config format (ESLint 9). Add custom rules to `eslint.config.mjs` if needed. See AGENTS.md for Next.js version warnings.

## Common Patterns

### Server & Client Components
Next.js 16 uses Server Components by default. Mark interactive components with `"use client"` at the top of the file.

### Metadata API
Use `Metadata` type from "next" and export metadata objects from layout/page components instead of deprecated `Head` component.

### Routing
App Router convention: file structure maps directly to routes. Create new routes by adding files/directories in `app/`.

## Workspace & Build Tools

The project enables `sharp` (image optimization) and `unrs-resolver` in the pnpm workspace configuration. These allow smooth Next.js image handling without additional setup.

## Deployment

This project is configured for Vercel deployment. Build artifacts go to `.next/` (excluded from git). See README.md for deployment instructions.
