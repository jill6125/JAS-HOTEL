# JAS Hotel — Luxury Boutique Hospitality & Fine Dining Frontend

A production-quality, cinematic hotel dining and in-room room service frontend application built for **JAS Hotel**.

Designed with an editorial, high-end hospitality aesthetic inspired by luxury brand showcases, featuring fluid GSAP ScrollTrigger choreography, Lenis smooth scrolling, Motion tactile micro-interactions, and a responsive e-commerce ordering engine.

---

## 🌟 Brand & Visual Direction

- **Editorial Typography**: Cormorant Garamond serif headings paired with clean, modern Plus Jakarta Sans UI and body typography.
- **Curated Palette**: Warm ivory surfaces (`#FAF7F0`, `#FDFCF9`), charcoal and obsidian typography (`#121211`), delicate champagne/gold accents (`#C5A880`, `#886E4B`), and subtle earthy tones.
- **Tactile Micro-interactions**: Fluid Motion spring dynamics for taps, hovers, drawers, and status transitions.
- **Cinematic Choreography**: GSAP and ScrollTrigger hero reveals and scroll-linked depth transitions.
- **Lenis Smooth Scroll**: Decoupled, silky-smooth scrolling synchronized with GSAP tickers, honoring `prefers-reduced-motion`.

---

## 🚀 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19.3** | Component UI library with React Compiler optimization |
| **TypeScript** | Strict, end-to-end typed domain models and API contracts |
| **Vite 8** | High-performance bundler and dev server |
| **React Router 7** | Client-side routing with deep link navigation and auth redirection |
| **Tailwind CSS v4** | Utility-first styling via pure inline classes (no custom UI CSS files) |
| **Motion for React (`motion/react`)** | Fluid UI animations, drawers, modals, item transitions |
| **GSAP + ScrollTrigger** | Hero entrance sequences, parallax, and section triggers |
| **Lenis** | Smooth scrolling engine synchronized with ScrollTrigger |
| **Lucide Icons** | Clean, minimalist luxury iconography |
| **Native Fetch API** | Centralized API client with credentials, query parsing, and error mapping |

---

## 🏛 Architecture & Project Structure

```
src/
├── animations/
│   └── gsapConfig.ts          # GSAP & ScrollTrigger registration and luxury defaults
├── components/
│   ├── account/               # Account & order management components
│   ├── cart/
│   │   └── CartDrawer.tsx     # Global animated sliding cart drawer
│   ├── hero/                  # Landing page hero components
│   ├── layout/
│   │   ├── Navbar.tsx         # Responsive header with scroll transitions & mobile menu
│   │   ├── Footer.tsx         # Editorial footer with concierge & address info
│   │   └── ScrollToTop.tsx    # Smooth scroll position reset on page transition
│   ├── menu/
│   │   └── MenuCard.tsx       # Interactive menu card with quantity & dietary badges
│   └── ui/
│       ├── Badge.tsx          # Status, category, and dietary badges
│       ├── Button.tsx         # Luxury button with motion tap & size variants
│       ├── Card.tsx           # Subtle border cards with elevation hover
│       ├── EmptyState.tsx     # Editorial empty state illustration
│       ├── Input.tsx          # Floating/editorial input with validation & password toggle
│       ├── LoadingState.tsx   # Elegant loading indicator
│       ├── Modal.tsx          # Accessible modal dialog with backdrop blur
│       ├── Skeleton.tsx       # Shimmering loading placeholders
│       └── Tabs.tsx           # Animated layout-pill tab switcher
├── context/
│   ├── AuthContext.tsx        # Session auth, login, signup, logout & redirect memory
│   ├── CartContext.tsx        # Persistent localStorage cart with room service state
│   └── ToastContext.tsx       # Luxury feedback toasts with Motion
├── hooks/
│   ├── useLenis.ts            # Lenis smooth scrolling bound to GSAP ticker
│   └── useReducedMotion.ts    # Accessibility hook for prefers-reduced-motion
├── lib/
│   ├── api/
│   │   ├── client.ts          # Central fetch client handling 401, 403, 404, 409, 422, 500
│   │   ├── auth.ts            # Signup, login, logout, getMe endpoints
│   │   ├── menu.ts            # Menu item retrieval, search & filtering
│   │   ├── orders.ts          # Order creation, order listing, status & cancellation
│   │   ├── rooms.ts           # Room and suite availability, booking creation & history
│   │   └── index.ts           # Central API exports
│   └── utils.ts               # Class merging (cn), currency and date formatting
├── pages/
│   ├── HomePage.tsx           # Cinematic landing page (Hero, Story, Featured, Experience, CTA)
│   ├── RoomsPage.tsx          # Luxury suite browser, amenities, dates selection, & login gate
│   ├── MenuPage.tsx           # Full culinary menu with categories, search, & dietary tags
│   ├── OrderPage.tsx          # Order tray review, room service/pickup, authoritative totals
│   ├── LoginPage.tsx          # Guest login portal with validation & return redirect
│   ├── SignupPage.tsx         # Guest registration with password verification
│   ├── AccountPage.tsx        # Suite reservations & dining orders history with cancellation
│   └── NotFoundPage.tsx       # Luxury 404 page
├── types/
│   └── index.ts               # Domain TypeScript interfaces (User, Room, RoomBooking, MenuItem, Order)
├── App.tsx                    # Route definitions, Suspense code-splitting, global providers
├── index.css                  # Tailwind v4 import & theme tokens (zero UI CSS rules)
└── main.tsx                   # React root entry point
```

---

## 🛠 Getting Started

### 1. Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **bun**

### 2. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Ensure the backend API endpoint points to your Flask server:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Installation

Install all required dependencies:

```bash
npm install
```

### 4. Running the Development Server

Start the local Vite development server:

```bash
npm run dev
```

The application will be live at `http://localhost:5173`.

### 5. Building for Production

Compile TypeScript and build the optimized production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 📡 API Contract Integration

The frontend communicates with the backend via credentials-enabled JSON requests:

### Authentication
- `POST /api/auth/signup` — Register guest account (`name`, `email`, `password`)
- `POST /api/auth/login` — Sign in guest (`email`, `password`)
- `POST /api/auth/logout` — Conclude guest session
- `GET /api/auth/me` — Retrieve active session profile

### Culinary Menu
- `GET /api/menu` — Query parameters: `category`, `search`, `featured`, `available`
- `GET /api/menu/:id` — Retrieve item specifications

### Dining Orders
- `POST /api/orders` — Create room service or pickup order with items & instructions
- `GET /api/orders` — Fetch guest order history
- `GET /api/orders/:id` — Fetch detailed order record
- `PATCH /api/orders/:id/cancel` — Cancel pending room service order

> **Note on Resiliency:** If the separate Flask backend is offline during early development or preview, the API client gracefully falls back to curated sample data and localStorage order simulations so all views remain fully testable without throwing unhandled exceptions.

---

## ♿ Accessibility & Performance

- **Reduced Motion**: All GSAP parallax, hero reveals, and smooth scrolling strictly respect `prefers-reduced-motion: reduce`.
- **Keyboard Navigation**: All interactive elements (drawers, modal dialogs, buttons, inputs) support complete keyboard navigation and `Escape` key handlers.
- **Image Optimization**: Images are loaded with lazy evaluation, responsive bounds, and aspect ratios to prevent layout shifts.
- **Code Splitting**: Dynamic imports (`React.lazy`) partition pages into discrete chunks, delivering an ultra-fast initial load.
