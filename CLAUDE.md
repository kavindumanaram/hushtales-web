This is Claude.md file have this in root : # HushTales — Frontend

## Product Vision
HushTales is a Netflix-style platform where mothers 
record their voice once, AI generates personalised 
animated children's stories, and videos play back 
in mum's voice. Parents manage profiles and content.
Children have a safe dedicated viewing zone.
Community members can share and discover public stories.

## Tech Stack
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- State management: Zustand
- Data fetching: React Query (TanStack Query)
- Auth: AWS Amplify with Cognito (coming later)
- Video player: Video.js or React Player
- Animations: Framer Motion
- Icons: Lucide React
- Hosting: Vercel

## Design Direction
Think Netflix meets a warm children's book.
Dark background (#0f0f0f) for the main app.
Warm accent colours: amber (#F59E0B), soft cream (#FFF8F0)
Rounded corners everywhere.
Large thumbnails, immersive full screen video.
Child-friendly fonts: Nunito or Poppins.
Smooth transitions between pages.
Mobile first — most parents use phones at bedtime.

## Backend API
All backend is already built on AWS.
Lambda Function URLs are the API endpoints.
No API Gateway — direct Lambda URLs.
CORS is enabled on all endpoints.

Current endpoints (get real URLs from Tanveer):

POST {STORY_GENERATOR_URL}
Body: { character, theme, child_name, user_id, mode }
Returns: { job_id, story_text, mode }

POST {SUBMIT_URL}
Body: { script_text, user_id, character_id }
Returns: { job_id }

GET {GET_JOBS_URL}
Returns: array of all story jobs

GET {LIST_VOICES_URL}
Returns: array of all voice profiles

GET {CHECK_VOICE_URL}
Returns: { status, heygen_voice_id }

GET {GET_UPLOAD_URL}?user_id={user_id}
Returns: { upload_url, s3_key }

## Hardcoded for now (until auth is built)
active_user_id = "user_test_001"
This will be replaced with Cognito JWT later.
Build all components to accept user_id as a prop
so swapping to real auth is one change not many.

## Pages to build (in order)
1. Home / Landing page
2. Library page (all videos)
3. Story generator page
4. Video player page
5. Voice setup page
6. Kids zone page
7. Auth pages (login, register) — Phase 5

## Folder structure
hushtales-web/
├── app/
│   ├── page.tsx              (home/landing)
│   ├── library/page.tsx      (video library)
│   ├── generate/page.tsx     (story generator)
│   ├── player/[id]/page.tsx  (video player)
│   ├── voice/page.tsx        (voice setup)
│   ├── kids/page.tsx         (kids zone)
│   └── layout.tsx            (root layout)
├── components/
│   ├── ui/                   (buttons, cards, badges)
│   ├── video/                (player, thumbnail, card)
│   ├── voice/                (recorder, uploader)
│   └── story/                (generator form, status)
├── lib/
│   ├── api.ts                (all API calls)
│   ├── store.ts              (Zustand state)
│   └── constants.ts          (Lambda URLs, config)
├── hooks/
│   ├── useJobs.ts            (fetch and poll jobs)
│   ├── useVoice.ts           (voice profile state)
│   └── useGenerate.ts        (story generation flow)
└── public/
    └── characters/           (character illustrations)

## Code standards
- TypeScript strict mode always
- All API calls in lib/api.ts only
  Never call fetch directly from components
- React Query for all server state
- Zustand for client UI state only
- Every component gets its own file
- Mobile first responsive design
- No inline styles — Tailwind only
- Accessibility: aria labels on all interactive elements