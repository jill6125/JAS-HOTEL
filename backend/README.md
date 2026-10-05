# JAS Hotel API - Backend Service

Production-ready backend for **JAS Hotel**, a luxury boutique hotel dining and room reservation platform in Mumbai, India.

Built with **Python 3**, **Flask 3.1.x**, **PyMongo**, **MongoDB**, **Werkzeug**, and **pytest**.

---

## 1. Features

- **Authentication**:
  - Secure signup, login, session inspection (`/api/auth/me`), and logout.
  - Password hashing via Werkzeug (`scrypt` / `pbkdf2`).
  - Session-based authentication with `HttpOnly`, `SameSite`, and configurable cookie flags.
  - Email normalization and uniqueness constraint.
- **Menu Catalog**:
  - Full hotel dining catalog with Indian culinary specialties.
  - Category filtering, full-text search, and availability checks.
  - Idempotent seed script (`python -m app.db.seed`) with 25 realistic dishes and beverages.
- **Order Engine**:
  - **Critical Rule**: Zero client trust for prices and totals. All line items, subtotals, 18% GST, and totals are computed authoritatively on the server.
  - Room service and pickup support.
  - Authenticated order history with user isolation.
  - Safe cancellation rules (only `pending` and `confirmed` orders can be cancelled).
- **Room Booking Engine**:
  - Luxury suites catalog (`/api/rooms`) with Arabian Sea views, specs, and pricing.
  - Authenticated suite reservation (`/api/bookings`) with server-side nights & 18% luxury GST calculation.
  - User booking history and cancellation lifecycle.
- **Health Check**:
  - `/api/health` verifying API and MongoDB connectivity.
- **Razorpay Ready**:
  - Configuration placeholders prepared in `.env` for upcoming Razorpay payment gateway integration.

---

## 2. Directory Architecture

```text
backend/
├── app/
│   ├── __init__.py          # Flask application factory (create_app)
│   ├── config.py            # Environment configurations (Dev, Test, Prod)
│   ├── constants.py         # Currency, tax rates, roles, and status enums
│   ├── errors.py            # Centralized error handlers & AppException
│   ├── extensions.py        # Flask-CORS and third-party extensions
│   ├── middleware.py        # Security response headers & request timing
│   ├── blueprints/
│   │   ├── auth/            # Authentication blueprint (/api/auth)
│   │   │   ├── routes.py
│   │   │   └── service.py
│   │   ├── menu/            # Menu blueprint (/api/menu)
│   │   │   ├── routes.py
│   │   │   └── service.py
│   │   ├── orders/          # Orders blueprint (/api/orders)
│   │   │   ├── routes.py
│   │   │   └── service.py
│   │   ├── rooms/           # Rooms & bookings blueprint (/api/rooms & /api/bookings)
│   │   │   ├── routes.py
│   │   │   └── service.py
│   │   └── health.py        # Health check blueprint (/api/health)
│   ├── db/
│   │   ├── client.py        # Persistent PyMongo MongoClient singleton
│   │   ├── indexes.py       # MongoDB compound & unique index creation
│   │   └── seed.py          # Idempotent database seeder
│   └── utils/
│       ├── auth.py          # login_required decorator & current_user getter
│       ├── serialization.py # BSON/ObjectId to JSON serializer
│       └── validation.py    # Request payload validators
├── tests/
│   ├── conftest.py          # Pytest fixtures and mongomock DB fixture
│   ├── test_auth.py         # Auth test suite
│   ├── test_menu.py         # Menu test suite
│   ├── test_orders.py       # Orders and pricing test suite
│   └── test_rooms.py        # Rooms and bookings test suite
├── run.py                   # Development & production server startup
├── requirements.txt         # Python dependencies
├── .env                     # Local environment file
├── .env.example             # Environment template
└── README.md
```

---

## 3. Getting Started

### Prerequisites

- **Python 3.10+** (Python 3.11 or 3.12 recommended)
- **MongoDB** running locally on port `27017` (e.g. via MongoDB Community Server or Docker)

### Installation

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   A `.env` file is included with sensible defaults. To customize, copy `.env.example`:
   ```bash
   cp .env.example .env
   ```

---

## 4. Database Initialization & Seeding

Seed the database with authentic Indian royal culinary items and luxury suites:

```bash
python -m app.db.seed
```

This script:
- Creates required MongoDB indexes (unique `email`, text index for menu search, compound indexes for orders and bookings).
- Upserts 25 curated menu items (Breakfast, Starters, Main Courses, Sides, Desserts, Beverages).
- Upserts luxury suites (The Maharaja Presidential Suite, Royal Marine Bay Suite, Executive Heritage Suite, Deluxe Heritage Chamber).
- Is **idempotent** (can be executed multiple times without creating duplicate records).

---

## 5. Running the API Server

Start the Flask development server on `http://localhost:5000`:

```bash
python run.py
```

Or using Flask CLI:
```bash
flask --app run.py run --port 5000 --debug
```

### Health Check

Open in your browser or run:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "database": "connected",
  "service": "jas-hotel-api",
  "status": "ok"
}
```

---

## 6. Running Tests

Run the complete test suite with `pytest`:

```bash
pytest
```

With test coverage:
```bash
pytest --cov=app tests/
```

*Note: The test suite uses `mongomock`, so tests can run completely in-memory without a live MongoDB instance.*

---

## 7. API Reference

### Health
- `GET /api/health` - Ping server and database connectivity

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register a new customer (`name`, `email`, `password`)
- `POST /api/auth/login` - Authenticate customer (`email`, `password`)
- `GET /api/auth/me` - Retrieve current session user (`{ authenticated: boolean, user: ... }`)
- `POST /api/auth/logout` - Clear session cookie

### Menu (`/api/menu`)
- `GET /api/menu` - List menu items (supports `?category=...`, `?search=...`, `?featured=true`, `?available=true`)
- `GET /api/menu/<id>` - Retrieve menu item details

### Orders (`/api/orders`)
- `POST /api/orders` - Place order (**Authentication required**)
  - Server calculates subtotal, 18% GST tax, and total authoritatively.
- `GET /api/orders` - List current user's order history (**Authentication required**)
- `GET /api/orders/<id>` - Get order detail (**Authentication required**, user isolated)
- `PATCH /api/orders/<id>/cancel` - Cancel order (**Authentication required**, only if `pending` or `confirmed`)

### Rooms & Bookings (`/api`)
- `GET /api/rooms` - Browse luxury suites (supports `?category=...`, `?search=...`, `?adults=...`, `?featured=true`)
- `GET /api/rooms/<id>` - Get suite details
- `POST /api/bookings` - Reserve a suite (**Authentication required**, calculates nights and 18% GST)
- `GET /api/bookings` - List current user's suite reservations (**Authentication required**)
- `PATCH /api/bookings/<id>/cancel` - Cancel a suite reservation (**Authentication required**)

---

## 8. Security & Production Deployment

For production deployments:
1. Set `FLASK_ENV=production` and `FLASK_DEBUG=0`.
2. Generate a cryptographically secure random `SECRET_KEY`.
3. Set `SESSION_COOKIE_SECURE=1` to enforce HTTPS cookies.
4. Set `FRONTEND_ORIGIN` to your production frontend URL (e.g. `https://jashotel.com`).
5. Run using a production WSGI server such as `gunicorn` or `waitress`:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
   ```
