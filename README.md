# VITALORA — Health & Wellness Supplement E-Commerce Platform

**"Better Health. Better Every Day."**

A full-stack, production-ready e-commerce platform for a premium D2C supplement brand: Angular 20 (standalone components, signals, Tailwind CSS v4) on the frontend, Spring Boot 4 / Java 17 on the backend, PostgreSQL for persistence, JWT auth, and Cash-on-Delivery checkout.

## Stack

| Layer     | Technology                                                                 |
|-----------|-----------------------------------------------------------------------------|
| Frontend  | Angular 20, TypeScript, standalone components, Reactive Forms, RxJS, Tailwind CSS v4 |
| Backend   | Spring Boot 4.1, Java 17, Spring Security, Spring Data JPA/Hibernate, Flyway |
| Database  | PostgreSQL 17                                                                |
| Auth      | JWT (jjwt), BCrypt password hashing                                         |

## Project layout

```
mfn/
├── backend/    Spring Boot API (Maven project)
├── frontend/   Angular application
└── database/   (reserved — schema lives in backend/src/main/resources/db/migration)
```

## Prerequisites

- Java 17+ and Maven
- Node.js 20+ and npm
- PostgreSQL 14+ running locally (or reachable)

## First-time setup

### 1. Database

Create a role and database (defaults match `application.yml`; override via env vars if you use different credentials):

```sql
CREATE ROLE vitalora WITH LOGIN PASSWORD 'vitalora';
CREATE DATABASE vitalora OWNER vitalora;
```

The schema and seed data (categories, 8 sample products, FAQs, homepage/about/contact/policy CMS copy, demo reviews) are applied automatically via Flyway on first backend startup — no manual SQL needed beyond creating the empty database above.

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`. On first boot it also seeds an **admin account**:

- Email: `admin@vitalora.com`
- Password: `Vitalora@Admin123`

Override any of these via environment variables before first run (see `backend/src/main/resources/application.yml` for the full list — `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_DEFAULT_EMAIL`, `ADMIN_DEFAULT_PASSWORD`, `APP_CORS_ORIGINS`, etc.). All defaults are dev-only — **set real values before deploying**.

### 3. Frontend

```bash
cd frontend
npm install
npm start          # ng serve, http://localhost:4200
```

The dev server proxies API calls to `http://localhost:8080/api` (see `src/environments/environment.ts`). For a production build:

```bash
npm run build       # outputs to frontend/dist/frontend
```

## What's implemented

Everything in the spec's "Final Quality Requirements" checklist is live and backed by real data — not a static mock:

- Customer registration/login/forgot-reset password (JWT), profile, change password
- Product catalog browsing, search, category/price/rating filters, sorting, pagination
- Product detail with gallery, benefits/ingredients/nutrition/usage/warnings tabs, review submission
- Cart (server-persisted for logged-in users, `localStorage`-persisted for guests, merged on login), wishlist
- Multi-step COD checkout → real order creation → order history/detail/tracking
- Admin: JWT-protected `/admin`, separate admin login, product CRUD (+ multi-image upload/reorder), category CRUD, inventory view/update with low-stock highlighting, review moderation, FAQ CRUD/reorder, and a lightweight CMS for homepage/about/contact/policy copy + promotional banners
- Contact form persisted to the database and viewable by admins

## Scope notes (intentional, per spec)

- **Payments:** Cash on Delivery only. The `payments` table and DTOs support only `COD`; no gateway is wired in, by design.
- **Admin order management:** intentionally not built (spec §20). Order APIs and data exist; customers can view their own orders.
- **No analytics/revenue dashboard:** the admin panel opens straight into Product Management, per spec.
- **Forgot-password email:** no SMTP is configured. The reset link is logged to the backend console (`AuthServiceImpl.forgotPassword`) instead of emailed — swap in a real mail sender for production.
- **Product imagery:** the 8 seed products use hand-built brand-consistent SVG illustrations (`frontend/public/assets/products/*.svg`) rather than licensed photography.
- **Sitemap:** `frontend/public/robots.txt` is in place; `sitemap.xml` would need to be generated from the live product/category catalog at deploy/build time.

## Known environment quirk

This was built against **Spring Boot 4**, which moved to a modularized autoconfiguration and a Jackson 3.x default JSON stack. If you're extending the backend: Flyway needs the explicit `spring-boot-starter-flyway` dependency (not just `flyway-core`), and any code needing `com.fasterxml.jackson.databind.ObjectMapper` should inject the bean defined in `JacksonConfig` rather than assume Spring autowires one for you.
