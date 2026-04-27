# Tiffin It Up: Home-Chef Marketplace

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

### 5. AI-Powered Intelligence
- **Personalized Customer Recommendations**: Leverages the Groq Cloud API (Llama 3) to analyze a customer's order history, stated allergies, and spice preferences to dynamically recommend highly relevant meals.
- **Chef Business Insights**: Employs native asynchronous background tasks to pre-aggregate sales and subscription data, passing minimal context to the LLM to generate actionable, cached kitchen insights without hitting token limits.

### 6. Admin Control Center
- **System Oversight**: Dedicated `/admin` portal secured by JWT role verification.
- **Data Management**: Real-time dashboards monitoring total platform revenue, active subscriptions, and user health across the entire ecosystem.

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
- **AI Integration**: Groq Cloud SDK (Llama 3)
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
- **Backend**: Configure `GROQ_API_KEY`, `CLOUDINARY_URL`, and `SECRET_KEY` in `.env`.
- **Frontend**: Set `VITE_API_URL=http://localhost:8000` in `.env`.

---


*Built with ❤️ for the global culinary community.*
