# IT Institute CRM + ERP

Production-shaped MERN scaffold for a role-based IT institute CRM/ERP.

## Architecture

- `server`: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, RBAC middleware.
- `client`: React, Vite, Tailwind CSS, role-wise dashboard shell.
- `server/src/models`: all core CRM/ERP Mongoose models.
- `server/src/routes`: REST APIs for auth, users, leads, admissions, courses, batches, fees, attendance, HR, tasks, demos, materials, tests, certificates, notifications, reports and settings.

## Setup

```bash
npm run install:all
copy server\.env.example server\.env
copy client\.env.example client\.env
npm run dev
```

## Testing Steps

1. Start MongoDB locally or use MongoDB Atlas.
2. Fill `server/.env`.
3. Run `npm run dev`.
4. Register a Super Admin with `POST /api/auth/register`.
5. Login from frontend or `POST /api/auth/login`.
6. Create users, courses, batches and leads.
7. Assign a lead to a telecaller.
8. Forward interested lead to counsellor.
9. Convert lead to admission and verify a student, fee record and receipt number are generated.

## Deployment

- Backend: deploy `server` to Render/Railway/AWS with `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.
- Frontend: deploy `client` to Vercel/Netlify with `VITE_API_URL`.
- Database: use MongoDB Atlas with network access restricted to deployment hosts.
- Production hardening: enable HTTPS, rotate JWT secrets, configure mail/SMS providers, add object storage for documents/materials, and schedule backups.
