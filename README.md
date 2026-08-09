# Thelaryon

Magic: The Gathering collection manager.

- Site: [thelaryon.com](https://thelaryon.com)
- Stack: Next.js, Neon Postgres, Drizzle, Neon Auth, Scryfall

## Getting Started

```bash
npm install
cp .env.example .env.local
# vul DATABASE_URL en Neon Auth vars in
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features (current)

- Card search via Scryfall (`/search`)
- Card detail + add to collection (`/cards/[id]`)
- Collection overview with value summary (`/collection`)
- Email auth (sign-up / sign-in / profile)

## Database

Neon Postgres + Drizzle ORM.

```bash
npm run db:generate
npm run db:migrate
```
