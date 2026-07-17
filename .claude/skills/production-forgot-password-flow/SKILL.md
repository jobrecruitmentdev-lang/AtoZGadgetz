---
name: production-forgot-password-flow
description: |
  Production-grade architecture and full implementation for Forgot Password /
  Reset Password flows. Covers DB schema (Prisma), token generation, hashing,
  API routes, rate limiting, session invalidation, email templates, frontend
  states, and security anti-patterns. Activates whenever building or reviewing
  any auth reset, password recovery, or token-based verification feature.
tools: [Read, Write, Bash, PowerShell, Grep]
---

# Production Forgot Password Flow

## Role
You are a **Senior Security Engineer**. When this skill activates, implement the
full flow end-to-end — DB schema, API routes, email, and frontend. Never implement
a partial flow. Never store plaintext tokens. Never reveal whether an email exists.

## When This Skill Activates
- Building a forgot password / reset password feature
- Reviewing any PR that touches auth, tokens, or password handling
- Any mention of reset link, email verification, or token expiry
- Auditing existing password reset for security issues

---

## 1. Security Principles (Non-Negotiable)

| Principle | Rule |
|---|---|
| **No enumeration** | Always respond "If an account exists, we sent an email" — never "Email not found" |
| **No plaintext tokens** | Hash token with SHA-256 before storing. Send only raw token in email. |
| **No reuse** | Mark token `used_at` on first use. Reject all subsequent uses. |
| **Short-lived** | Token expires in 15–30 minutes. Never longer. |
| **Session invalidation** | Invalidate ALL sessions on password reset — not just current device. |
| **No password in email** | Never email the new password. |
| **No token in logs** | Never log the raw token string. Log only `token_id` or hashed form. |
| **Rate limiting** | 5 requests/hr per email, 10 requests/hr per IP. |

---

## 2. Database Schema (Prisma)

```prisma
model PasswordResetToken {
  id         String    @id @default(cuid())
  user_id    String
  token_hash String    @unique        // SHA-256 of raw token — never raw
  expires_at DateTime                 // now() + 15 minutes
  used_at    DateTime?                // set on redemption, null = still valid
  created_at DateTime  @default(now())
  ip_address String?                  // IP that requested the reset
  user_agent String?                  // browser/device that requested

  user       User      @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([expires_at])              // for cleanup queries
}
```

**Cleanup job** — run daily to purge expired/used tokens:
```sql
DELETE FROM "PasswordResetToken"
WHERE expires_at < NOW() OR used_at IS NOT NULL;
```

---

## 3. Token Generation & Hashing

```typescript
// lib/auth/reset-token.ts
import crypto from 'crypto'

export function generateResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('hex')  // 64-char hex, 256-bit entropy
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}
```

**Rule:** `raw` goes into the email link. `hash` goes into the database. Never swap these.

---

## 4. API Routes

### 4.1 `POST /api/auth/forgot-password`

```typescript
// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateResetToken } from '@/lib/auth/reset-token'
import { sendPasswordResetEmail } from '@/lib/email/reset'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  // 1. Rate limit — 5 requests/hr per IP
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const limited = await rateLimit(`forgot-pw:${ip}`, 5, 3600)
  if (limited) {
    return NextResponse.json({ message: 'Too many requests.' }, { status: 429 })
  }

  // 2. Validate input
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid email.' }, { status: 400 })
  }
  const { email } = parsed.data

  // 3. ALWAYS return the same response — prevents enumeration
  const GENERIC_RESPONSE = NextResponse.json({
    message: "If an account with that email exists, we've sent a password reset link.",
  })

  // 4. Look up user — silently exit if not found
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return GENERIC_RESPONSE   // same response, no timing leak ideally

  // 5. Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { user_id: user.id, used_at: null },
  })

  // 6. Generate token
  const { raw, hash } = generateResetToken()

  // 7. Store HASHED token
  await prisma.passwordResetToken.create({
    data: {
      user_id:    user.id,
      token_hash: hash,
      expires_at: new Date(Date.now() + 15 * 60 * 1000),  // 15 minutes
      ip_address: ip,
      user_agent: req.headers.get('user-agent') ?? undefined,
    },
  })

  // 8. Send email with RAW token
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${raw}`
  await sendPasswordResetEmail({ to: email, name: user.name ?? 'there', resetUrl })

  // 9. Return generic response regardless of outcome
  return GENERIC_RESPONSE
}
```

---

### 4.2 `GET /api/auth/reset-password/validate?token=`

```typescript
// app/api/auth/reset-password/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/auth/reset-token'

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('token')
  if (!raw) {
    return NextResponse.json({ valid: false, error: 'Missing token.' }, { status: 400 })
  }

  const hash = hashToken(raw)
  const token = await prisma.passwordResetToken.findUnique({
    where: { token_hash: hash },
  })

  if (!token)                          return NextResponse.json({ valid: false, error: 'Invalid token.' }, { status: 400 })
  if (token.used_at)                   return NextResponse.json({ valid: false, error: 'Token already used.' }, { status: 400 })
  if (token.expires_at < new Date())   return NextResponse.json({ valid: false, error: 'Token expired.' }, { status: 400 })

  return NextResponse.json({ valid: true })
}
```

---

### 4.3 `POST /api/auth/reset-password`

```typescript
// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/auth/reset-token'
import { hashPassword } from '@/lib/auth/password'
import { z } from 'zod'

const schema = z.object({
  token:        z.string().min(64).max(64),
  new_password: z.string().min(8).max(128),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const { token: raw, new_password } = parsed.data

  const hash = hashToken(raw)

  // 1. Find token record
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where:   { token_hash: hash },
    include: { user: true },
  })

  // 2. Validate all conditions
  if (!tokenRecord) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 })
  }
  if (tokenRecord.used_at) {
    return NextResponse.json({ error: 'This reset link has already been used.' }, { status: 400 })
  }
  if (tokenRecord.expires_at < new Date()) {
    return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 })
  }

  // 3. Hash new password
  const passwordHash = await hashPassword(new_password)

  // 4. Atomic transaction: update password + mark token used + invalidate all sessions
  await prisma.$transaction([
    // Update password
    prisma.user.update({
      where: { id: tokenRecord.user_id },
      data:  { password_hash: passwordHash },
    }),
    // Mark token as used (single-use enforcement)
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data:  { used_at: new Date() },
    }),
    // Invalidate ALL active sessions for this user
    prisma.session.deleteMany({
      where: { user_id: tokenRecord.user_id },
    }),
    // Invalidate ALL refresh tokens
    prisma.refreshToken.deleteMany({
      where: { user_id: tokenRecord.user_id },
    }),
  ])

  return NextResponse.json({ message: 'Password updated successfully.' })
}
```

---

## 5. Password Hashing Utility

```typescript
// lib/auth/password.ts
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS)
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}
```

---

## 6. Rate Limiting Utility (Redis)

```typescript
// lib/rate-limit.ts
import { redis } from '@/lib/redis'

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const current = await redis.incr(key)
  if (current === 1) await redis.expire(key, windowSeconds)
  return current > limit
}
```

Usage in routes:
```typescript
// Per email (5 requests/hr)
const emailLimited = await rateLimit(`forgot-pw:email:${email}`, 5, 3600)

// Per IP (10 requests/hr)
const ipLimited = await rateLimit(`forgot-pw:ip:${ip}`, 10, 3600)

if (emailLimited || ipLimited) {
  return NextResponse.json({ message: 'Too many requests.' }, { status: 429 })
}
```

---

## 7. Email Template

```typescript
// lib/email/reset.ts
import { sendEmail } from '@/lib/email/sender'

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string
  name: string
  resetUrl: string
}) {
  await sendEmail({
    to,
    subject: 'Reset your AtoZ Gadgetz password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Reset your password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below.
           This link expires in <strong>15 minutes</strong> and can only be used once.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#0D743B;
                  color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
        <p style="margin-top:24px;font-size:0.85rem;color:#666;">
          If you didn't request this, you can safely ignore this email.
          Your password will not change.
        </p>
        <p style="font-size:0.8rem;color:#999;">
          Link not working? Copy and paste this URL:<br/>
          <span style="word-break:break-all;">${resetUrl}</span>
        </p>
      </div>
    `,
  })
}
```

**Email rules:**
- Button links to `resetUrl` (contains raw token)
- Expires in 15 minutes — state this explicitly
- "Single use" — state this explicitly
- Never mention the new password
- Never mention whether the email was found in the system

---

## 8. Frontend Flow & UI States

### 8.1 Forgot Password Page (`/forgot-password`)

```tsx
// app/forgot-password/page.tsx
'use client'
import { useState } from 'react'

type State = 'idle' | 'loading' | 'sent' | 'error'

export default function ForgotPasswordPage() {
  const [state, setState] = useState<State>('idle')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setState('sent')   // Always show sent — even if email doesn't exist
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div>
        <h1>Check your email</h1>
        <p>
          If an account with <strong>{email}</strong> exists, we've sent a
          password reset link. Check your inbox (and spam folder).
        </p>
        <p>The link expires in 15 minutes.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Forgot your password?</h1>
      <p>Enter your email and we'll send you a reset link.</p>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        disabled={state === 'loading'}
      />
      <button type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? 'Sending…' : 'Send reset link'}
      </button>
      {state === 'error' && <p>Something went wrong. Please try again.</p>}
    </form>
  )
}
```

### 8.2 Reset Password Page (`/reset-password?token=...`)

```tsx
// app/reset-password/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type State = 'validating' | 'invalid' | 'idle' | 'loading' | 'success' | 'error'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''

  const [state, setState] = useState<State>('validating')
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  // Validate token on mount before showing form
  useEffect(() => {
    if (!token) { setState('invalid'); return }
    fetch(`/api/auth/reset-password/validate?token=${token}`)
      .then(r => r.json())
      .then(d => setState(d.valid ? 'idle' : 'invalid'))
      .catch(() => setState('invalid'))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }

    setState('loading')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: password }),
    })
    const data = await res.json()

    if (res.ok) {
      setState('success')
      setTimeout(() => router.push('/login'), 3000)
    } else {
      setError(data.error ?? 'Something went wrong.')
      setState('error')
    }
  }

  if (state === 'validating') return <p>Validating your reset link…</p>

  if (state === 'invalid') return (
    <div>
      <h1>Invalid or expired link</h1>
      <p>This reset link is invalid or has expired. Reset links are valid for 15 minutes.</p>
      <a href="/forgot-password">Request a new reset link</a>
    </div>
  )

  if (state === 'success') return (
    <div>
      <h1>Password updated</h1>
      <p>Your password has been changed. All your devices have been signed out.</p>
      <p>Redirecting to login…</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <h1>Set new password</h1>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="New password (min 8 characters)"
        required
        minLength={8}
        disabled={state === 'loading'}
      />
      <input
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder="Confirm new password"
        required
        disabled={state === 'loading'}
      />
      <button type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? 'Updating…' : 'Update password'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
```

---

## 9. Security Anti-Patterns (Never Do These)

| Anti-Pattern | Risk | Correct Approach |
|---|---|---|
| `"Email not found"` response | Account enumeration — attacker maps valid emails | Always: "If an account exists, we sent an email" |
| Store raw token in DB | Token theft = instant account takeover | Store SHA-256 hash only |
| Tokens expire in 24hr+ | Long window for phishing link use | 15–30 minutes max |
| Reusable tokens | Replay attack | Set `used_at` on first use, reject thereafter |
| No session invalidation | Attacker's session stays valid after victim resets | Delete ALL sessions in same transaction |
| Password in email | Credential exposure | Never send passwords — only reset links |
| Token in server logs | Log scraping = token theft | Log only `token_id`, never raw token |
| No rate limit | Email bombing + brute force | 5/hr per email, 10/hr per IP |
| MD5 / SHA-1 for token hash | Weak hash, rainbow tables possible | SHA-256 minimum |
| Short token entropy | Brute-forceable | 32 random bytes (256-bit) minimum |

---

## 10. Test Suite

```typescript
// __tests__/auth/forgot-password.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as forgotPwHandler } from '@/app/api/auth/forgot-password/route'
import { POST as resetPwHandler }  from '@/app/api/auth/reset-password/route'

describe('POST /api/auth/forgot-password', () => {
  it('always returns same message regardless of whether email exists', async () => {
    const res1 = await forgotPwHandler(makeReq({ email: 'exists@test.com' }))
    const res2 = await forgotPwHandler(makeReq({ email: 'notexist@test.com' }))
    expect(await res1.json()).toEqual(await res2.json())   // no enumeration
    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
  })

  it('returns 429 after 5 requests from same IP', async () => {
    for (let i = 0; i < 5; i++) {
      await forgotPwHandler(makeReq({ email: `test${i}@x.com` }))
    }
    const res = await forgotPwHandler(makeReq({ email: 'blocked@x.com' }))
    expect(res.status).toBe(429)
  })

  it('returns 400 on invalid email format', async () => {
    const res = await forgotPwHandler(makeReq({ email: 'notanemail' }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/reset-password', () => {
  it('rejects used token', async () => {
    const { token } = await setupUsedToken()
    const res = await resetPwHandler(makeReq({ token, new_password: 'NewPass123!' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/already been used/i)
  })

  it('rejects expired token', async () => {
    const { token } = await setupExpiredToken()
    const res = await resetPwHandler(makeReq({ token, new_password: 'NewPass123!' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/expired/i)
  })

  it('rejects weak password', async () => {
    const { token } = await setupValidToken()
    const res = await resetPwHandler(makeReq({ token, new_password: '123' }))
    expect(res.status).toBe(400)
  })

  it('invalidates all sessions after successful reset', async () => {
    const { token, userId } = await setupValidToken()
    await resetPwHandler(makeReq({ token, new_password: 'NewStrongPass123!' }))
    const sessions = await prisma.session.findMany({ where: { user_id: userId } })
    expect(sessions).toHaveLength(0)
  })

  it('token cannot be used twice', async () => {
    const { token } = await setupValidToken()
    await resetPwHandler(makeReq({ token, new_password: 'NewStrongPass123!' }))
    const res2 = await resetPwHandler(makeReq({ token, new_password: 'AnotherPass456!' }))
    expect(res2.status).toBe(400)
  })
})
```

---

## 11. Pre-Merge Checklist

```
[ ] Raw token never stored in DB — only SHA-256 hash
[ ] Raw token never appears in server logs
[ ] Forgot-password endpoint always returns same response body
[ ] Token expires_at set to now() + 15 minutes
[ ] used_at set on first successful use
[ ] Second use of same token returns 400
[ ] ALL sessions deleted in same transaction as password update
[ ] Rate limiting: 5/hr per email, 10/hr per IP
[ ] Password hashed with bcrypt (SALT_ROUNDS = 12)
[ ] Reset email does not contain the new password
[ ] Frontend shows same message whether email found or not
[ ] Validate endpoint called on page load before showing form
[ ] Expired/invalid token shows "Request a new link" — not a form
[ ] Test: token cannot be used twice (replay attack)
[ ] Test: enumeration — same response for found/not-found email
[ ] Test: rate limit triggers at correct threshold
[ ] Test: all sessions cleared after reset
```
