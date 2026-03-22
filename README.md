# 🐴 Reba Love Ranch — Ranch Sitter PWA (Appwrite Edition)

A mobile-first Progressive Web App for ranch sitting at Reba Love Ranch in the Sierra Nevada foothills.

## Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Vite |
| PWA | vite-plugin-pwa (Workbox) |
| Backend / DB | **Appwrite Cloud** |
| File Storage | Appwrite Storage |
| Hosting | Vercel |
| CI/CD | Git → Vercel auto-deploy |

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your Appwrite credentials
npm run dev
```

**👉 See [APPWRITE_SETUP.md](./APPWRITE_SETUP.md) for the full step-by-step Appwrite Cloud setup.**

## Features

| Screen | Backend |
|---|---|
| Today dashboard | localStorage (resets daily) |
| Feed Schedule | Static (hardcoded) |
| Daily Care | localStorage |
| Property Tasks | **Appwrite** — completions tracked cross-device |
| Animals | Static (profiles) |
| Emergency / Evacuation | Static |
| Manure Log | **Appwrite** — owner can see spread history |
| Health Records | **Appwrite** — full vet record history |
| Notes + Photos | **Appwrite** — photos stored in Appwrite Storage |

## Graceful Degradation

Every Appwrite-connected page falls back to localStorage if the backend isn't configured yet. The app works out of the box — Appwrite adds cross-device sync and owner visibility on top.

## Brand

Sky Blue `#4A90E2` · Petal Pink `#FFB7C5` · Forest Green `#2E7D32` · Warm Beige `#FDF3E1`
Fonts: **Montserrat** (headings) + **Open Sans** (body)
