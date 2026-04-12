# StockFlow: 18+ Roadmap (Requires Adult Account Holder)

These features require an adult (18+) to set up because they involve payments, legal agreements, or identity verification. You can build the UI and logic now, but an adult will need to create and manage the accounts.

---

## 1. Payment Processing (LemonSqueezy / Stripe)

**What:** Accept payments for Pro/Enterprise plans so StockFlow can generate revenue.

**Why 18+:** Payment processors (Stripe, LemonSqueezy, Paddle) require the account holder to be 18+ and may require identity verification, tax forms, and a bank account.

**What an adult needs to do:**
- Create a LemonSqueezy or Stripe account
- Complete identity verification (KYC)
- Link a bank account for payouts
- Sign the merchant agreement
- Set up tax collection (VAT/GST if applicable)

**What you can build now:**
- Pricing page UI (already started)
- Subscription management UI
- Webhook handlers for payment events
- Plan gating logic (free vs pro features)

---

## 2. Custom Domain & SSL

**What:** Use a custom domain like `stockflow.app` instead of `stock-flow-2fqn.vercel.app`.

**Why 18+:** Domain registrars (Namecheap, Cloudflare, Google Domains) require the registrant to be 18+ and provide real contact info (WHOIS).

**What an adult needs to do:**
- Purchase a domain (~$10-15/year)
- Set up DNS records pointing to Vercel
- Enable SSL (usually automatic on Vercel)

**What you can build now:**
- Everything works on the Vercel subdomain already
- Update sitemap/robots/meta once domain is set

---

## 3. Transactional Email Service (Resend / SendGrid)

**What:** Send emails for password resets, low-stock alerts, order confirmations, weekly reports.

**Why 18+:** Email services require account verification, and sending emails from a custom domain requires domain ownership verification. Terms of service require 18+.

**What an adult needs to do:**
- Create a Resend or SendGrid account
- Verify a sending domain (DNS records)
- Agree to anti-spam terms

**What you can build now:**
- Email templates (HTML/React Email)
- Email trigger logic (when to send)
- Notification preferences UI
- The API integration code (just needs API key)

---

## 4. Terms of Service & Privacy Policy

**What:** Legal pages required for any SaaS that collects user data.

**Why 18+:** These are legal documents. While you can draft them, an adult should review and publish them. Using generators like Termly or iubenda requires an adult account.

**What an adult needs to do:**
- Review and approve the legal text
- Publish on the website
- Ensure GDPR/CCPA compliance if serving EU/US users

**What you can build now:**
- Draft terms of service page
- Draft privacy policy page
- Cookie consent banner UI
- Data export/deletion features (GDPR right to erasure)

---

## 5. Google Analytics / Mixpanel / PostHog

**What:** Track user behavior, page views, feature usage to make data-driven decisions.

**Why 18+:** Analytics services require account holders to be 18+ and agree to data processing terms.

**What an adult needs to do:**
- Create a Google Analytics or PostHog account
- Accept data processing agreements

**What you can build now:**
- Add the tracking script/SDK to the app
- Define custom events (signup, product_created, stock_adjusted)
- Build an internal analytics dashboard

---

## 6. OAuth Providers (Google Sign-In, GitHub)

**What:** Let users sign in with Google, GitHub, or other providers for easier onboarding.

**Why 18+:** Registering an OAuth app on Google Cloud Console or GitHub requires agreeing to developer terms (18+). Google also requires a privacy policy URL.

**What an adult needs to do:**
- Create OAuth app on Google Cloud Console
- Create OAuth app on GitHub
- Configure redirect URIs
- Submit for verification (Google requires it for public apps)

**What you can build now:**
- Supabase already supports OAuth — just needs provider credentials
- Login UI with social buttons
- Account linking logic

---

## 7. SMS Notifications (Twilio)

**What:** Send SMS alerts for critical low-stock warnings or order updates.

**Why 18+:** Twilio and similar services require identity verification, a valid phone number, and agreement to messaging compliance rules (TCPA).

**What an adult needs to do:**
- Create a Twilio account
- Verify identity
- Purchase a phone number
- Register for A2P messaging (required in many countries)

**What you can build now:**
- SMS preference settings UI
- Alert trigger logic
- Message templates
- The API integration code

---

## 8. App Store / Play Store Listing

**What:** Publish StockFlow as a mobile app (PWA wrapper or React Native).

**Why 18+:** Apple Developer Program ($99/year) requires 18+. Google Play Developer ($25 one-time) requires 18+.

**What an adult needs to do:**
- Create Apple Developer account
- Create Google Play Developer account
- Submit app for review
- Manage app store listing

**What you can build now:**
- PWA is already set up and installable
- Optimize for mobile experience
- Create app icons and screenshots
- Write app store description

---

## 9. Business Bank Account

**What:** Receive payments and manage StockFlow finances properly.

**Why 18+:** Banks require account holders to be 18+. Business accounts may need a registered business entity.

**What an adult needs to do:**
- Open a business or personal bank account
- Register a business entity (optional but recommended)
- Link to payment processor

---

## 10. Affiliate / Referral Program

**What:** Let users earn rewards for referring others to StockFlow.

**Why 18+:** Affiliate platforms (Rewardful, FirstPromoter) require 18+ and involve financial payouts.

**What an adult needs to do:**
- Create account on affiliate platform
- Set up payout rules
- Manage tax reporting for affiliates

**What you can build now:**
- Referral tracking logic (unique codes/links)
- Referral dashboard UI
- Reward display and history

---

## Priority Order

When you're ready to involve an adult, tackle these in order:

1. **Custom Domain** — Makes the app look professional ($10-15/year)
2. **Terms of Service & Privacy Policy** — Required before collecting user data seriously
3. **Payment Processing** — Start generating revenue
4. **Transactional Emails** — Critical for user experience (password resets, alerts)
5. **Google Analytics** — Understand how users interact with your app
6. **OAuth Providers** — Reduce signup friction
7. **SMS Notifications** — Nice-to-have for power users
8. **App Store Listing** — Expand reach (PWA works fine for now)
9. **Business Bank Account** — When revenue starts flowing
10. **Affiliate Program** — When you have enough users to benefit from referrals

---

*This document was generated for StockFlow (https://stock-flow-2fqn.vercel.app). All the UI and logic for these features can be built now — only the account creation and legal agreements need an adult.*
