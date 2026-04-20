# Tiffin-It-Up: Modern Home-Cooked Meal Marketplace

Tiffin-It-Up is a premium meal delivery platform connecting talented home chefs with customers seeking authentic, home-cooked food. The platform is designed with a high-end "Glassmorphism" aesthetic and robust production-ready architecture.

---

## 🚀 Live Production
- **Frontend**: [tiffin-it-up.vercel.app](https://tiffin-it-up.vercel.app)
- **Backend API**: [tiffin-it-up.onrender.com/docs](https://tiffin-it-up.onrender.com/docs)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 18+ (Vite)
- **Styling**: Vanilla CSS (Premium Glassmorphism & Micro-animations)
- **Routing**: React Router DOM v6
- **Auth**: JWT (JSON Web Tokens) & Google OAuth Provider

### Backend
- **Framework**: FastAPI (High-performance Python)
- **Database**: PostgreSQL (Production) / SQLite (Local Development)
- **ORM**: SQLAlchemy
- **Media Hosting**: **Cloudinary CDN** (Scalable image storage for meal & profile assets)
- **Security**: Native `bcrypt` hashing & JWT role-based access control (RBAC)

---

## ✨ Key Features & "Current Scenario"

### 👨‍🍳 Chef Command Center
- **Interactive Profile Architecture**: Hover-based management for Cover Banners and Avatars using Cloudinary integration.
- **Dynamic Menu Catalog**: Create/Edit/Delete meals with granular attributes:
  - 🌶️ Spice Levels (1-5)
  - 🥦 Veg / 🥩 Non-Veg classifications
  - 🍱 Combo Deal toggles
  - 🟢 Live availability toggles (Instant state change without reload)
- **Live Kitchen Orders**: Real-time order monitoring with internal state transitions: **Pending → Accepted → Delivered**.
- **Real-time Analytics**: Live tracking of Revenue, Active Meals, and Order volume.
- **Service Mastery**: Master "Kitchen ON/OFF" switch to control storefront visibility.

### 📱 Responsive Design
- **Mobile-First Layout**: Sliding sidebars and hamburger menus designed for busy chefs on the go.
- **Micro-animations**: Smooth transitions, hover overlays, and glassmorphic layers for a premium feel.

---

## ⚙️ Environment Configuration

### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:pass@host/db  # Use SQLite locally
SECRET_KEY=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend (`.env`)
```env
VITE_API_URL=https://tiffin-it-up.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_id
```

---

## 🛠️ Local Development

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python init_db.py  # Warning: This drops and recreates tables for schema sync
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🚢 Deployment Logic
- **Frontend**: CI/CD via Vercel (automatically handles SPA routing via `vercel.json`).
- **Backend**: Hosted on Render. Uses `render.yaml` for Blueprint orchestration and automated database migrations during deployments.

---
*Built with ❤️ for home-cooks and food lovers.*
