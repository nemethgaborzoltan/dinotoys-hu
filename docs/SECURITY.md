# Security baseline

- Never trust client totals, stock or discounts.
- Create orders in a transaction and reserve inventory atomically.
- Use payment webhook signatures and idempotency.
- Apply RLS to customer-owned data; service-role access remains server-only.
- Rate-limit auth, checkout, search and forms.
- Store no raw card data.
- Sanitize/admin-review rich product content.
- CSP, HSTS, Referrer-Policy and Permissions-Policy in production.
- Audit admin price, stock, compliance and refund changes.
