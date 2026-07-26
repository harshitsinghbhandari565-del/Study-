# STUDYMAP — Full Project Context (as of 2026-07-26)

## 🚀 Current Status

- **LIVE at:** [https://study-chi-one.vercel.app/](https://study-chi-one.vercel.app/)
- **Onboarding works:** Shows "Welcome to STUDYMAP — What should we call you?"
- **vercel.json fix:** ✅ COMMITTED & PUSHED (arena/019f9e45-study branch)
- **PWA icons:** ✅ COMMITTED & PUSHED (icon-192.png, icon-512.png, apple-touch-icon.png)
- **⚠️ DEPLOYMENT NOTE:** Changes are on `arena/019f9e45-study` branch. They need to be merged to `main` for Vercel to auto-deploy. Use a PR or manual merge.

---

## 📱 What Is STUDYMAP?

A **mobile-first gamified study tracker PWA** for a Class 12 CBSE student (user is in Lucknow, UP, India). Built entirely via AI prompts — no PC, no budget, Android phone only.

**Core features:**
- Syllabus tracker (Physics, Chemistry, Maths, CS, PE, English — CBSE aligned)
- Session logging with XP/levels/game mechanics
- Test countdown + calendar (board/mock/school types with color-coded dots)
- Pace Tracker + Readiness formula (Completion 40%, Confidence 35%, Revision 25%)
- Smart Study Planner (auto 7-day schedule, 2-5 sessions/day)
- Daily Checklist on Dashboard (below streak counter, parent-child resource subtasks)
- Goals with manual completion lock
- Wall of Proof (last 30 days tiles, tap for detail overlay)
- Dark/Light mode (system pref default, manual override, localStorage)
- JSON Export/Import backup
- PWA: service worker, offline banner, installable on Android
- Onboarding: name + at least one test date (mandatory)
- Bottom nav tabs: Dashboard, Subjects, Analytics, Planner, Tests, Profile

---

## 🗂️ Actual Project Structure (Vite + React)

> ⚠️ This is a **Vite SPA**, NOT Next.js. The routing is state-based (no react-router).

```
├── package.json              # Vite + React + Tailwind
├── vite.config.ts            # react(), tailwindcss(), viteSingleFile()
├── vercel.json               # ✅ SPA rewrite rule (fixes 404s)
├── index.html                # Entry point + apple-touch-icon link
├── public/
│   ├── sw.js                 # Service worker (cache-first, fallback to /)
│   ├── manifest.json         # PWA manifest
│   ├── icon-192.png          # ✅ App icon (192x192)
│   ├── icon-512.png          # ✅ App icon (512x512)
│   └── apple-touch-icon.png  # ✅ iOS icon (180x180)
├── src/
│   ├── main.tsx              # React root
│   ├── App.tsx               # Main app — state-based routing via AppView
│   ├── index.css             # Tailwind + CSS variables (light/dark)
│   ├── pages/
│   │   ├── AnalyticsPage.tsx
│   │   ├── GoalsPage.tsx
│   │   ├── PlannerPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RevisionsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── SubjectDetailPage.tsx
│   │   ├── SubjectsPage.tsx
│   │   └── TestsPage.tsx
│   ├── components/
│   │   ├── dashboard/        # 15+ dashboard components
│   │   ├── analytics/        # heatmap, study-hours, subject-radar, timeline-feed, weekly-report
│   │   ├── game-hub/         # badge-grid, boss-tracker, subject-levels, wall-of-proof
│   │   ├── goals/            # calendar-view, goal-card, goal-form
│   │   ├── planner/          # schedule-list
│   │   ├── profile/          # share-button, wall-of-proof-modal, wall-of-proof-preview
│   │   ├── revisions/        # revision-alert
│   │   ├── subjects/         # chapter-search
│   │   ├── ui/               # boss-badge, confidence-rating, connection-status, progress-bar, etc.
│   │   ├── onboarding/       # onboarding-flow
│   │   ├── bottom-nav.tsx
│   │   ├── chapter-card.tsx
│   │   ├── morning-checklist.tsx
│   │   ├── page-transition.tsx
│   │   └── session-logger.tsx
│   ├── contexts/
│   │   ├── study-context.tsx # All app state + localStorage persistence
│   │   └── theme-context.tsx # Dark/light mode
│   ├── lib/
│   │   ├── constants.ts      # SUBJECTS, chapters, resources (CBSE data)
│   │   ├── seed-data.ts      # Fresh state factory
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── utils.ts          # calculateLevel, etc.
│   └── utils/
│       └── cn.ts             # Tailwind class merge utility
└── .env.local.example        # Environment variable template
```

---

## 🔧 Routing Architecture

**Current: State-based routing** — `useState<AppView>` in `App.tsx`

```typescript
type AppView =
  | { type: "dashboard" } | { type: "subjects" } | { type: "subject-detail"; subjectId: string }
  | { type: "analytics" } | { type: "profile" } | { type: "goals" } | { type: "revisions" }
  | { type: "tests" } | { type: "planner" } | { type: "settings" };
```

**Implications:**
- ✅ No URL changes = no 404s from within the app
- ❌ No deep links — can't share a URL to a specific page
- ❌ No browser back/forward button support
- ❌ Refresh always goes to dashboard (last state is in localStorage but URL is always `/`)
- ✅ Simple — no router dependency needed

**vercel.json fix** handles the server-side 404 issue. All routes serve `index.html`.

---

## 📋 Iteration History (completed)

| Iteration | What |
|-----------|------|
| 1/1.2 | Syllabus correction: Chem units only, Physics/Maths unit+chapter, CS/PE units, English (Reading, Creative Writing, Flamingo Prose/Poetry, Vistas). Boss chapters corrected. PE bosses: Test & Measurement, Biomechanics, Training in Sports |
| 2 | Removed Practice section globally. CS/PE/English resources = 5 (School Lecture, NCERT, Self Studied, Online Lecture, PYQs). Removed challenge/grind. Real data (not demo) |
| 3.1 | Test registry, week tracker, goals calendar |
| 3.2 | Test countdown hero, days studied vs remaining, rest day planner, post-test reflection, renamed Exam→Test |
| 3.3 | Full monthly calendar, study hours optional, deadline pressure cards, pre-test ritual checklist |
| 3.4 | Test week countdown mode + seconds toggle |
| 3.5 | Pace Tracker + "If Today Were Test Day" readiness (40/35/25 weights) |
| 3.6 | Smart Study Planner: button on Planner page, editable max sessions/day (2-5), 7-day vertical list, prioritize by pace status then nearest test |
| 4.1 | Dark/light toggle (system pref first launch, localStorage override, Dashboard header icon) |
| 4.2 | Chapter notes textarea (auto-save on blur). Edit/delete session from timeline + rebuild cascade |
| 4.3 | Search/filter on Subjects: All → Incomplete → ⭐Shaky → Boss → subject chips |
| 4.4 | Manual JSON export/import backup + last backup timestamp |
| 4.5 | PWA: SW, app shell cache, rotating reminder banner, offline/online status banner |
| 5.1 | Settings page (in Profile area), no 7th tab, skip removed daily challenge |
| 5.2 | Rename Game Hub → Profile, /profile route, stats summary, trophy room, Wall of Proof preview+modal, Copy Stats share |
| 5.3 | Onboarding: name + ≥1 test date mandatory. Confirm/reorder subjects. Name in Dashboard greeting + Profile header |
| **6.0** | **vercel.json SPA rewrite fix** (fixes 404 on sub-routes) |
| **6.1** | **PWA icons added** (192px, 512px, apple-touch-icon) |

---

## 👤 User Profile

- **Location:** Lucknow, UP, India
- **Device:** Android phone only (no PC, no Termux)
- **Budget:** Zero
- **Class:** 12 CBSE (board exams coming)
- **Subjects:** Physics, Chemistry, Maths, CS, PE, English
- **Style:** Prefers concise, direct, copy-paste instructions. Mobile-friendly paths only.
- **Data:** localStorage-based. Export backup regularly.

---

## 🔑 Key Technical Notes

- **Vite SPA** (confirmed: `vite.config.ts` + `vite-plugin-singlefile`)
- All state in React Context (`study-context.tsx`) + localStorage
- Theme in separate `theme-context.tsx`
- Service worker at `public/sw.js` (cache-first with `/` fallback)
- Manifest at `public/manifest.json`
- Build output: single `index.html` (~949KB) via `vite-plugin-singlefile`
- No router library — state-based navigation only
- **Deployment:** Vercel auto-deploys from GitHub `main` branch

---

## 📌 Next Steps (priority order)

1. ✅ **FIX 404s** — vercel.json added (needs merge to main)
2. ✅ **PWA icons** — added (needs merge to main)
3. **🔄 MERGE TO MAIN** — Create PR or merge `arena/019f9e45-study` → `main` so Vercel deploys
4. **Test all pages** after deploy
5. **Install as PWA** on Android (Chrome → ⋮ → Add to Home Screen)
6. **Complete onboarding** with real name + board exam date
7. **Export first backup**
8. **Consider adding hash-based routing** for proper back-button support and deep links
9. Any new features/fixes as needed

---

## 💬 Activation Message for New Chat

Copy-paste this at the start of your new chat:

```
STUDYMAP PROJECT CONTINUATION.

Read the attached file STUDYMAP_PROJECT_CONTEXT.md first.

Current status: App is LIVE at https://study-chi-one.vercel.app/
Recent fixes: vercel.json SPA rewrite + PWA icons added (on arena branch, needs merge to main)
Next priority: Merge to main, verify deploy, then continue development.

My constraints: Android phone only, no PC, zero budget, prefer copy-paste commands.
My style: Be concise and direct. Give exact steps. Ask me to paste errors if needed.
```
