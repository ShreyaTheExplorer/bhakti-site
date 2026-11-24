# Bhakti Geet – MVP

1. Create a free project at supabase.com.
2. SQL Editor > paste schema.sql > Run.
3. Authentication > Users > Add user (your admin email + password). Then Authentication > Sign In / Providers > turn OFF "Allow new users to sign up".
4. Project Settings > API: copy Project URL and anon public key.
5. Copy .env.example to .env and paste both values.
6. npm install
7. npm run dev  -> open http://localhost:3000 (admin: /admin/login)
8. Optional: put a deity image at public/bg.jpg for the background.
9. Deploy: push to GitHub, import in Vercel, add the same two env vars, deploy.
