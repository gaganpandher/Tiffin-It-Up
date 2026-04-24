# Tiffin It Up: Professional Home-Chef Marketplace & Management

Tiffin It Up is a high-performance, full-stack marketplace connecting authentic home chefs with health-conscious customers. Built with a focus on **Culinary Transparency**, **Fulfillment Reliability**, and **Comprehensive Analytics**, it provides a premium experience for both kitchen management and customer ordering.

---

## 🚀 Key Technological Pillars

### 1. Advanced Revenue & Analytics
The Chef Dashboard provides a unified financial view, aggregating income from two distinct streams:
- **Individual Meal Orders**: Revenue from one-off marketplace transactions.
- **Active Subscription Plans**: Recurring revenue from weekly and monthly pricing plans.
- **Real-time Metrics**: Instant visibility into active subscribers, pending orders, and total earnings.

### 2. Fulfillment & Logistics Mastery
- **Smart Delivery Toggles**: When a chef disables delivery in their profile, the marketplace automatically removes delivery badges and restricts fulfillment to Pickup.
- **Automated Pickup Guidance**: Customers choosing pickup are instantly provided with the chef's specific pickup address in the cart and order history.
- **Global Time Slots**: A simplified arrival window system that notifies chefs of the customer's preferred delivery/pickup time without requiring complex slot management.

### 3. Health & Culinary Safety
- **Health & Preferences Tracking**: Subscribers can specify allergies (nuts, gluten, etc.) and custom dietary notes, which are surfaced to the chef with high-visibility warnings.
- **Mandatory Documentation**: Enforced descriptions for all meals and plans ensure customers always know exactly what they are ordering.

### 4. Enterprise-Grade Stability
- **Asynchronous Notifications**: Order confirmations use FastAPI `BackgroundTasks` to prevent "Fail to Fetch" errors and ensure the UI remains responsive during chef alerts.
- **Robust Serialization**: Multi-table data hydration ensures deep order details (items, prices, combo labels) are accurately preserved in the order history.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18+ (Vite)
- **Styling**: Vanilla CSS (Premium Glassmorphism & High-Contrast Design)
- **State Management**: Context API (Cart & Auth)
- **Visuals**: Lucide Icons & Cloudinary CDN Integration

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLAlchemy (SQLite for Dev / PostgreSQL for Prod)
- **Security**: JWT Role-Based Access Control & Bcrypt Hashing
- **Notifications**: Real-time WebSocket support for order alerts

---

## 📁 Project Structure

```text
Tiffin-It-Up/
├── backend/            # FastAPI Application
│   ├── routers/        # Modular API Endpoints (Chef, Orders, Marketplace, etc.)
│   ├── core/           # Security, Dependencies, and Media Config
│   ├── models.py       # SQLAlchemy Schema
│   └── main.py         # App Entry Point & Middleware
└── frontend/           # React Application (Vite)
    ├── src/
    │   ├── pages/      # Chef/Customer Dashboards & Marketplace
    │   ├── context/    # Cart & Theme State
    │   └── services/   # API Communication Layer
```

---

## ⚙️ Local Development

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables
- **Backend**: Configure `CLOUDINARY_URL` and `SECRET_KEY` in `.env`.
- **Frontend**: Set `VITE_API_URL=http://localhost:8000` in `.env`.

---

## 🎯 Our Mission
To professionalize home-cooked meal services by providing chefs with the same operational tools used by large restaurants, while maintaining the personal touch and authenticity of home cooking.

*Built with ❤️ for the global culinary community.*
