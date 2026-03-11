# Bike Accessories Pitshop Inventory and Billing System

A full-stack premium dashboard for managing bike accessory inventory, customer billing, and performance analytics.

## Tech Stack
- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** React, Vite, Recharts, Lucide-React
- **Auth:** JWT-based Admin Authentication

## Key Features
- **Dashboard:** Revenue trends (last 7 days), low stock alerts, and daily sales summary.
- **Inventory:** Full CRUD for products, automatic stock deduction on sales, and manual stock adjustments.
- **Billing:** Multi-item invoice creation, tax calculation (18% GST), and invoice registry.
- **Customers:** Purchase history tracking and profile management.
- **Reporting:** Monthly revenue reports and top-selling product statistics.

## Setup Instructions

### 1. Database Setup
1. Create a PostgreSQL database named `bike_inventory`.
2. Run the SQL commands in `schema.sql` to initialize tables and sample data.

### 2. Backend Setup
1. Inside the `server` folder, update the `.env` file with your PostgreSQL credentials.
2. Run `npm install`.
3. Start the server: `npm start` or `npm run dev` (if nodemon is installed).
   - Default Port: 5000

### 3. Frontend Setup
1. Inside the `frontend` folder, run `npm install`.
2. Start the development server: `npm run dev`.
   - Default Port: 5173

## Default Credentials
- **Username:** `admin`
- **Password:** `admin123` (Note: Password hash in `schema.sql` is for demonstration; update to real hashed passwords for production.)

## API Endpoints
- `POST /api/auth/login` - Admin Login
- `GET /api/products` - List products (Search & Category filters)
- `POST /api/invoices` - Generate bill and update inventory
- `GET /api/reports/dashboard` - Get dashboard stats
- `GET /api/reports/top-selling` - Pie chart data
- `GET /api/reports/monthly-revenue` - Bar chart data
