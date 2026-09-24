# 🚗 Rent Rides

Rent Rides is a full-stack car rental management platform built with React, Tailwind CSS, and Supabase.

The platform provides separate experiences for customers and administrators, allowing customers to browse and book vehicles while administrators manage the fleet, bookings, customers, contacts, and business analytics.

## ✨ Features

### Customer
- Browse available cars
- View detailed car information
- Check date-based availability
- Book a car
- View and manage bookings
- Cancel eligible bookings
- Manage customer profile
- Email/password authentication

### Admin
- Separate admin login
- Secure role-based authorization
- Admin dashboard
- Booking management
- Fleet/car management
- Car image uploads through Supabase Storage
- Customer management
- Contact/support management
- Business analytics
- Booking and fleet statistics

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Styling:** Tailwind CSS
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Deployment:** Netlify
- **Language:** JavaScript

## 🔐 Authentication

Rent Rides uses Supabase Authentication with separate customer and admin portals.

```text
Customer Login
/login
    ↓
Homepage
/

Admin Login
/admin/login
    ↓
Admin Dashboard
/admin/dashboard
```

Admin authorization is controlled by the `role` field in `public.profiles`.

```text
customer
admin
```

## 📁 Project Structure

```text
src/
├── assets/
│   └── assets.js
├── components/
├── context/
├── layouts/
├── pages/
│   ├── customer/
│   └── admin/
├── services/
└── App.jsx
```

## ⚙️ Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never expose or commit the Supabase service-role key.

## 🚀 Getting Started

Clone the repository:

```bash
git clone <your-repository-url>
cd rent-rides
```

Install dependencies:

```bash
npm install
```

Create `.env.local` with your Supabase credentials.

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## 🌐 Deployment

The application is designed for deployment on Netlify.

Build command:

```text
npm run build
```

Publish directory:

```text
dist
```

The project includes a Netlify SPA redirect configuration so React routes can be accessed directly.

## 🗄️ Supabase

Supabase provides:

- Authentication
- PostgreSQL database
- Row Level Security (RLS)
- Car image storage
- Booking availability validation
- Role-based access control

Bookings use database-level protection to prevent overlapping active reservations for the same vehicle.

## 📌 Current Authentication

Rent Rides currently uses **email/password authentication only**.

Google OAuth has been removed from the project.

## 📄 License

This project is currently intended for educational and development purposes.