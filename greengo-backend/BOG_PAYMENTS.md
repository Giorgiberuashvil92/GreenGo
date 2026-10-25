# Bank of Georgia payments

New card checkouts use BOG. Cash payments use the existing flow. The legacy
Flitt callback remains available for previously created Flitt payments.
The old SKIP_FLITT_PAYMENT switch no longer bypasses card payment.

## Deployment

Set these variables on the backend host (never in Expo/public variables):

- BOG_CLIENT_ID: Public Key from the bank merchant portal.
- BOG_CLIENT_SECRET: Secret Key from the bank merchant portal.
- BOG_PUBLIC_API_URL: externally reachable HTTPS API base including `/api`.
  Current default: `https://greengo-production.up.railway.app/api`.

Deploy the backend and the updated customer app. Confirm the actual public API
hostname before deployment. The checkout request supplies these URLs to BOG:

- POST `/api/payments/bog/callback` (RSA signature checked against raw request bytes).
- GET `/api/payments/bog/return` (redirects to `greengo://payment-result`).

The callback must be publicly reachable. Browser redirects alone never establish
payment success. After return, the app checks the server using a random capability
issued with its checkout; the server retrieves the bank receipt. Capability tokens
should be redacted from access logs.

BOG intents use a separate collection; existing Flitt intents/indexes are preserved.
An atomic order upsert prevents repeat fulfillment. Only `completed` receipts with
matching order reference, GEL currency, requested amount, and transferred amount
create an order. The backend sends business notifications after paid fulfillment.
Refunds, preauthorization and saved-card charging are not implemented by this change.

## Verification

- `npm run build`
- `npm test -- --runInBand --watchman=false bog.service.spec.ts`
- Before release, test a bank-approved payment, decline, cancellation, delayed
  callback, duplicate callback, and app return on a device. Verify that one paid
  order appears and business notifications arrive.

No live charge or production deployment was performed during implementation.

## Bank references

- https://api.bog.ge/docs/payments/authentication
- https://api.bog.ge/docs/payments/standard-process/create-order
- https://api.bog.ge/docs/payments/standard-process/callback
- https://api.bog.ge/docs/payments/standard-process/get-payment-details
