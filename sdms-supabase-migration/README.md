# SDMS migration starter: Express + Supabase Auth + PostgreSQL

> **Starter scaffold, not a completed migration.** The supplied `discipline-management-system.zip` contains many zero-byte application files, including `package.json`, `scr/App.jsx`, and the Base44 client. The original UI therefore cannot safely be patched or verified from that archive.

## Target architecture
- React/Vite frontend hosted on Vercel.
- Node.js + Express API hosted on Render.
- Supabase Auth for sign-in and JWT validation.
- Supabase-hosted PostgreSQL for application records.
- Keep the Supabase service-role key on the server only.

## Setup
1. Create a Supabase project and configure Auth redirect URLs.
2. Review and apply `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
3. In `server`, copy `.env.example` to `.env`, fill the values, then run `npm install` and `npm run dev`.
4. In the frontend, configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`; install `@supabase/supabase-js`.
5. Deploy the frontend to Vercel and the Express service to Render. Set production CORS origins and environment variables there.

## Security notes
- Never commit `.env` or expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.
- Do not let users assign themselves administrator roles.
- Test organization-level authorization and audit requirements before production.
- Review the SQL schema against the actual business rules before applying it to production.

## Migration caveat
No populated database export or MongoDB connection configuration was present in the supplied ZIP. Do not migrate live records by guessing. Export the existing collections, map legacy IDs, migrate in dependency order, and verify counts and relationships before switching traffic.

The API examples in this starter cover health checks and basic person/incident listing and creation only; expand and test them against your complete application requirements before production use.
