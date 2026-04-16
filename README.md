# Tiffin-It-Up: Scalable Tiffin Service System

Tiffin-It-Up is a comprehensive meal delivery platform connecting dedicated chefs/cooks with everyday customers. It employs a modern microservices-influenced architecture, asynchronous task handling, and smart AI/ML predictions to create a seamless end-to-end food subscription experience.

## Tech Stack Overview

The platform uses a robust, scalable architecture separated into distinct layers:

### Backend Architecture
- **Framework**: Python / FastAPI (High-performance API framework)
- **Database**: MySQL (currently configured with SQLite `tiffin_db.sqlite` for seamless local Phase 1 testing)
- **ORM**: SQLAlchemy (Database modeling)
- **Task Queue**: Celery + Redis (Offloading background tasks like notifications and payment processing) 
- **Security**: JWT tokens using native `bcrypt` for authentication.

### Frontend Architecture
- **Framework**: React.js mapped via Vite
- **Styling**: Tailwind CSS v4 (Custom UI design system)
- **Routing**: React Router DOM

### DevOps & Infrastructure (Upcoming)
- **Containerization**: Docker & Docker Compose

## User Roles & Permissions

The system operates across three core role-based access control (RBAC) layers:

### 1. The Admin
The overarching supervisor of the platform.
*   **Analytics Dashboard**: Visualizes the total number of registered chefs, active customers, order volumes, etc.
*   **Moderation**: Ability to permanently block or suspend disruptive customers or underperforming chefs.

### 2. The Chef / Cook
The backbone of the food service.
*   **Menu Management**: Chefs upload visibility for the food they serve.
*   **Subscription Models**: Chefs list distinct prices based on a daily, weekly, or monthly subscription model.
*   **Order Workflows**: Can dynamically Accept or Reject incoming customer orders.
*   **Delivery Configurations**: Can dictate delivery ranges and apply custom post-delivery pricing factors.

### 3. The Customer
The consumer accessing daily home-cooked foods.
*   **Ordering Module**: Browse available chefs, select meal plans, and securely process payments.
*   **Reviews & Trust**: Leave comments and ratings on received meals.
*   **Notifications**: Recipient of real-time multi-channel notifications matching their order states from chefs.

## Future Smart Features (AI/ML) & Scaling
As the platform broadens, these data-driven modules will be introduced:
1. **Meal Recommendations**: A filtering engine tailored to suggest new cooks/meals based on a customer's prior taste history.
2. **Demand Scaling & Pricing**: AI-powered dashboard components suggesting optimal dish prices to chefs based on local neighborhood demand.
3. **Multi-Address Support**: Enabling work and home delivery address toggles dynamically.
4. **Cancellation System & Live Chat**: Realtime websocket chatting directly bridging Chef ↔ Customer.

## Local Setup Instructions

### 1. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt # (or manually install dependencies in setup)
python init_db.py # Generates SQLite database for testing
uvicorn main:app --reload
```
You can view the Swagger UI endpoints at: `http://127.0.0.1:8000/docs`

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
You can view the Vite landing app at: `http://localhost:5173/`

---
*Built incrementally across phased project tracking.*
