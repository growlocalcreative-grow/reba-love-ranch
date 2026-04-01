# 🐴 RebaLove Ranch — Appwrite Cloud Setup Guide

Complete this guide in order. Takes about 15 minutes total in your browser.

---

## Step 1 — Create Your Appwrite Project

1. Sign in at **[cloud.appwrite.io](https://cloud.appwrite.io)**
2. Click **Create Project**
3. Name it: `reba-love-ranch`
4. Copy the **Project ID** shown at the top of the dashboard — you'll need it soon

---

## Step 2 — Add a Web Platform

1. In your project, go to **Settings → Platforms**
2. Click **Add Platform → Web**
3. Name: `RLR Dev`, Hostname: `localhost`
4. Add a second platform for production:
   - Name: `RLR Production`, Hostname: `your-app.vercel.app` (update once you know your Vercel URL)

---

## Step 3 — Create the Database

1. Go to **Databases** in the sidebar
2. Click **Create Database**
3. Name it: `ranch`
4. Copy the **Database ID** — you'll need it

---

## Step 4 — Create Collections

For each collection below, go to **Databases → ranch → Create Collection**.
After creating each collection, go to its **Settings tab** and set:
- **Permissions:** Add `role:any` with **Read** + **Create** + **Update** + **Delete** access
  *(You can tighten this with auth later)*

Then add the attributes listed for each collection.

---

### Collection: `manure_log`

| Attribute key | Type | Required | Default |
|---|---|---|---|
| `spread_date` | String | ✅ | — |
| `notes` | String | — | `""` |
| `rock_jam_occurred` | Boolean | — | `false` |
| `rock_jam_notes` | String | — | `""` |

---

### Collection: `ranch_notes`

| Attribute key | Type | Required | Default |
|---|---|---|---|
| `author` | String | ✅ | — |
| `note_type` | String | ✅ | — |
| `animal` | String | — | `""` |
| `content` | String | ✅ | — |
| `photo_urls` | String[] (array) | — | `[]` |

---

### Collection: `health_records`

| Attribute key | Type | Required | Default |
|---|---|---|---|
| `animal` | String | ✅ | — |
| `record_type` | String | ✅ | — |
| `record_date` | String | ✅ | — |
| `description` | String | ✅ | — |
| `vet_name` | String | — | `""` |
| `next_due_date` | String | — | `null` |
| `notes` | String | — | `""` |

---

### Collection: `task_completions`

| Attribute key | Type | Required | Default |
|---|---|---|---|
| `task_id` | String | ✅ | — |
| `task_title` | String | — | `""` |
| `completed_at` | String | ✅ | — |
| `notes` | String | — | `""` |

---

### Collection: `care_logs` *(optional — for future full sync)*

| Attribute key | Type | Required | Default |
|---|---|---|---|
| `animal` | String | ✅ | — |
| `log_date` | String | ✅ | — |
| `care_type` | String | ✅ | — |
| `completed` | Boolean | — | `false` |
| `notes` | String | — | `""` |

---

## Step 5 — Create the Storage Bucket

1. Go to **Storage** in the sidebar
2. Click **Create Bucket**
3. Name it: `ranch-photos`
4. Copy the **Bucket ID**
5. Go to **Permissions** inside the bucket settings:
   - Add `role:any` with **Read** + **Create** access

---

## Step 6 — Set Up Your .env File

Back in your project code:

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=        ← from Step 1
VITE_APPWRITE_DB_ID=             ← from Step 3
VITE_APPWRITE_BUCKET_ID=         ← from Step 5

# Collection IDs — from each collection's Settings tab
VITE_COL_MANURE_LOG=manure_log
VITE_COL_RANCH_NOTES=ranch_notes
VITE_COL_HEALTH_RECORDS=health_records
VITE_COL_TASK_COMPLETIONS=task_completions
VITE_COL_CARE_LOGS=care_logs
```

> **Note:** The Collection ID in Appwrite is NOT the same as the collection name.
> After creating each collection, click into it → Settings → copy the Collection ID.

---

## Step 7 — Deploy to Vercel

1. Push your code to GitHub
2. Go to **[vercel.com](https://vercel.com)** → New Project → import your repo
3. In the **Environment Variables** section, add every variable from your `.env` file
4. Click **Deploy**
5. Once deployed, go back to Appwrite → **Settings → Platforms** → update your production platform with your real Vercel URL

---

## Step 8 — Install as PWA on iPhone

1. Open your Vercel URL in **Safari** on iPhone
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Done — it installs like a native app, works offline!

---

## How the App Works Without Full Backend Setup

The app is designed with **graceful degradation**:

- If Appwrite isn't configured yet, every page that fetches data falls back to `localStorage`
- This means the sitter can use the app immediately, even before the backend is wired up
- Once you configure Appwrite, data persists in the cloud — visible from any device

This is especially useful so the **owner** can see what the **sitter** has logged in real time.

---

## Collections Not Yet Wired to Appwrite

These pages currently use static data or localStorage only. They're ready to connect:

| Page | Collection needed | Status |
|---|---|---|
| Dashboard checklist | `care_logs` | localStorage ✅ |
| Animals | Static (rarely changes) | hardcoded ✅ |
| Feed Schedule | Static (hardcoded schedule) | hardcoded ✅ |
| Emergency contacts | Static | hardcoded ✅ |
| Evacuation | Static | hardcoded ✅ |

---

*Built with ❤️ for Reba Love Ranch · Sierra Nevada Foothills*
