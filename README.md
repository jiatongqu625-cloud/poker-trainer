# Poker Trainer (MVP)

Web MVP for NLH training drills (scenario-based) + opponent profiles.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite (dev)

## Local dev
```bash
npm i
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open: http://localhost:3000

## Notes
- This is an MVP scaffold. The decision engine is designed to be replaceable with a real GTO/solver-backed engine later.
