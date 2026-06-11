# API Reference

Base URL: `/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

## Core REST Modules

Every module supports:

- `GET /module?page=1&limit=20&search=term`
- `GET /module/:id`
- `POST /module`
- `PATCH /module/:id`
- `DELETE /module/:id`

Modules:

- `/users`
- `/roles`
- `/permissions`
- `/leads`
- `/follow-ups`
- `/students`
- `/courses`
- `/batches`
- `/faculty`
- `/staff`
- `/fees`
- `/payments`
- `/attendance`
- `/demo-classes`
- `/tasks`
- `/study-materials`
- `/assignments`
- `/tests`
- `/certificates`
- `/notifications`
- `/expenses`
- `/salaries`
- `/branches`
- `/settings`

## Lead Flow APIs

- `POST /leads/:id/assign`
  - Body: `{ "telecallerAssigned": "USER_ID" }`
- `POST /leads/:id/call-history`
  - Body: `{ "status": "Interested", "remarks": "Asked for demo", "followUpDate": "2026-06-12T10:00:00.000Z" }`
- `POST /leads/:id/forward`
  - Body: `{ "counsellorAssigned": "USER_ID", "remarks": "Hot lead" }`
- `POST /leads/:id/convert`
  - Body: `{ "course": "COURSE_ID", "batch": "BATCH_ID", "totalFees": 50000, "discount": 5000, "initialPayment": 10000, "paymentMode": "UPI" }`

## Reports

- `GET /reports/dashboard`
