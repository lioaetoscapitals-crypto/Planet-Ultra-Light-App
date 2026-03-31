# Planet Ultra API

Backend starter for Resident Management (mobile + backoffice).

## Run

```bash
cd "/Users/l.paunikar/Downloads/download/Ultra Planet App/services/api"
npm install
npm run dev
```

Base URL: `http://localhost:4000/v1`

## Auth for local testing

Use headers:

- `x-role: Admin | Manager | Security | Resident`
- `x-user-id: usr-admin-001` (or any id)

## Available module endpoints

- `/v1/users`
- `/v1/apartments`
- `/v1/gate-logs`
- `/v1/invitations`
- `/v1/bookings`
- `/v1/notices`
- `/v1/market-items`
