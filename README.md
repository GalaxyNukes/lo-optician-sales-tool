# lo-optician-sales-tool

LensOnline Campaign Catalog — optician sales tool built with Next.js 14, Sanity CMS, and Vercel.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| CMS | Sanity v3 (embedded at `/studio`) |
| Hosting | Vercel |
| Styling | CSS Modules + CSS Variables |
| Font | Plus Jakarta Sans |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Sanity project

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Create a new project — name it `LensOnline Campaign Catalog`
3. Choose dataset: `production`
4. Copy your **Project ID**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_token   # Editor role, from sanity.io/manage → API → Tokens
SANITY_REVALIDATE_SECRET=any_long_random_string
```

### 4. Run locally

```bash
npm run dev
```

- **Tool** → [localhost:3000](http://localhost:3000)
- **Studio** → [localhost:3000/studio](http://localhost:3000/studio)

### 5. Seed initial content in Sanity Studio

Open the Studio and create:

**Goals (Step 1)**
- Get new customers to shop
- Get existing customers to shop
- Grow revenue
- Grow private label
- Increase awareness
- Grow active customers

**Actions (Step 2)**
- 10% on EyeDefinition
- 10% on everything
- 10% on BRIGHT
- 1+1 on PURE
- Custom action ← enable `isCustom: true`
- None

**Needs (Step 3)** — set `briefingBlockType` for each
- Social Media campaign → `af-social`
- Google ADS → `af-social`
- Mockup / AI → `af-sticker`
- Printed materials → `af-print`
- Landing Page → `af-landing`
- POS Materials → `af-sticker`

**Subject Filters**
- Spring, Autumn, Winter, Summer, Optician focused, Multifocal, Myopia

**Visual Styles**
- Lifestyle, Lifestyle + Product, Illustrative

Then add your first **Campaign** with all fields filled.

### 6. Deploy to Vercel

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/lo-optician-sales-tool.git
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com) → Import repository
2. Add all environment variables from `.env.local`
3. Deploy

### 7. Enable draft preview

Visit: `https://your-app.vercel.app/api/draft?secret=YOUR_SANITY_REVALIDATE_SECRET`

This enables Sanity draft mode so you can preview unpublished campaigns.

---

## Sanity Studio workflow

```
New campaign → Save as Draft → Preview at /?preview=true → Publish → Live
```

---

## Future: Asana integration

When ready, add to `.env.local`:

```env
ASANA_ACCESS_TOKEN=your_token
ASANA_PROJECT_ID=your_project_id
ASANA_DEFAULT_ASSIGNEE_ID=assignee_gid
```

Then create `app/api/briefing/route.ts` to POST task creation on form submit.

---

## Project structure

```
├── app/
│   ├── page.tsx                    ← server component, fetches Sanity data
│   ├── studio/[[...index]]/        ← embedded Sanity Studio
│   └── api/draft|exit-draft/       ← preview mode routes
├── components/
│   ├── CampaignCatalog.tsx         ← root client component
│   ├── Nav, ClientStep             ← header + optician form
│   ├── SelectionStep               ← reusable step 1/2/3 accordion
│   ├── SubjectFilters              ← filter chips
│   ├── CampaignGrid                ← 5-col campaign cards
│   ├── DetailOverlay               ← slide-up detail panel
│   ├── BriefingSection             ← dynamic briefing blocks
│   ├── SummaryModal                ← summary + briefing doc generator
│   └── BottomBar                   ← sticky selected count + actions
├── sanity/
│   ├── schemaTypes/                ← campaign, goal, action, need, subject, visualStyle
│   ├── lib/client.ts               ← Sanity client (normal + preview)
│   ├── lib/queries.ts              ← all GROQ queries
│   └── sanity.config.ts            ← Studio config
```
