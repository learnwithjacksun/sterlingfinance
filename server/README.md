# True Mark FB API

Express + MongoDB backend for the `client/` and `admin/` apps.

## Setup

```bash
cd server
npm install
cp .env.example .env     # fill in the values (see below)
npm run seed:admin       # creates the first admin account + admin passcode
npm run dev              # http://localhost:5000
```

Requires Node 22.9+. MongoDB must be a **replica set** (MongoDB Atlas works out of the box) so balance changes can run in
transactions. A standalone local `mongod` works for development only (it falls back to non-transactional writes outside
production and logs a warning).

### Environment

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs access tokens (32+ random chars) |
| `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL_DAYS`, `RESET_TOKEN_TTL_MINUTES` | Token lifetimes (15m / 30 / 45) |
| `CLIENT_URL`, `ADMIN_URL` | Allowed CORS origins and the base of links in emails |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | Transactional email (verify the sender/domain in Brevo) |
| `IMGBB_API_KEY` | Avatar and KYC image hosting (uploaded by the server) |
| `INFOBIP_API_KEY`, `INFOBIP_BASE_URL`, `INFOBIP_SENDER` | Admin "Send SMS" |
| `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, `INITIAL_ADMIN_PASSCODE` | Used by `npm run seed:admin` |
## Authentication

Token based, no cookies, so it keeps working cross-site on iOS/Safari.

- `POST /api/auth/login` returns `{ user, accessToken, accessTokenExpiresAt, refreshToken }`.
- Send `Authorization: Bearer <accessToken>` on every request. Access tokens last 15 minutes.
- `POST /api/auth/refresh` with `{ refreshToken }` rotates the pair. Reusing an old refresh token revokes the whole session.
- Password recovery uses an emailed reset link (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`).
- Admin API: the account must have `role: "admin"` **and** have passed `POST /api/admin/auth/passcode` (the passcode is
  stored hashed). The passcode result is a token with the `pc` claim, required by every other `/api/admin` route.

## Endpoints

Errors always look like `{ "error": { "code", "message", "details?" } }`.

**Auth** `/api/auth`: `POST register | login | refresh | logout | forgot-password | reset-password | change-password`, `GET me`

**Customer** `/api/me`
- `GET /` profile, `PATCH /pin`, `PATCH /avatar` (multipart `avatar`)
- `GET /transactions?page&limit`, `POST /transfer` (PIN, active account and balance enforced server-side; atomic debit)
- `POST /kyc/idme` (multipart `frontIdImg`, `backIdImg` + fields), `POST /kyc/heloc`

**Admin** `/api/admin`
- `POST /auth/passcode`
- Users: `GET /users?search&page&limit`, `POST /users`, `GET|PATCH|DELETE /users/:id`, `PATCH /users/:id/status`,
  `PATCH /users/:id/role`, `POST /users/:id/send-reset`
- Money: `POST /users/:id/fund`, `POST /users/:id/debit` (atomic, writes the ledger row)
- Transactions: `GET /transactions?user&status&type`, `GET|PATCH|DELETE /transactions/:id`, `POST /transactions/:id/sms`.
  Setting a **debit** to `failed` refunds the user; moving it back out of `failed` charges it again.
- Codes: `GET|PUT /users/:id/code`, `POST /users/:id/code/message`
- KYC: `GET /kyc`, `PATCH /kyc/:id`, `GET /heloc`, `PATCH /heloc/:id`
- Settings: `PUT /settings/passcode`

## Security notes

Rotate the previously exposed imgbb, SMTPexpress and Infobip keys.
