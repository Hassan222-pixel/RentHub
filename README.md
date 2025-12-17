# RentHub – Dormitory Booking & Management Platform

![Home Page](https://i.imgur.com/9kddrFL.png)

RentHub is a **location-based dormitory booking and management platform** built to connect **students, employees, and renters across Lebanon**.  
It provides a complete solution for discovering, booking, and managing dormitory accommodations with **real-time availability**, **secure payments**, and **role-based dashboards**.

---

## 📌 Overview

RentHub centralizes student housing by offering:
- Verified dorm listings
- University-based search and filtering
- Accurate availability & conflict-free booking
- Flexible payment options (full payment or deposit)
- Dedicated dashboards for **Clients**, **Renters**, and **Admins**

---

## 🧱 Tech Stack

- **Frontend:** TypeScript , React, Bootstrap
- **Backend:** Next.js (API Routes)
- **Database:** MongoDB
- **Authentication:** JWT (HTTP-only cookies)
- **Maps & Location:** Google Maps API
- **Payments:** Credit / Debit Cards, Whish
- **Notifications:** Email & System Notifications
- **Design:** Fully responsive (Web & Mobile-ready)

---

## 🌐 Core Features

### 🏠 Home Page

![Home Page](https://i.imgur.com/9kddrFL.png)

- Modern landing page
- Featured dorms
- Easy navigation
- Entry point to universities and dorm listings

---

## 🗺️ University & Dorms Map Location

![University Map 1](https://i.imgur.com/dubpeMH.png)
![University Map 2](https://i.imgur.com/v9lVIny.png)
![University Map 3](https://i.imgur.com/iYPSXe6.png)
![University Map 4](https://i.imgur.com/h0P8dDU.png)

### How it Works
- Users select a university from a list
- Each university has stored latitude & longitude
- Dorms also have their own geographic coordinates
- The system calculates distances and displays nearby dorms

### Map Features
- Visual map showing:
  - University location
  - Dorm location
  - Distance line between them
- Direct **Google Maps directions**
- Directions from:
  - University
  - User’s current location

This feature helps users quickly decide which dorm suits them best.

---

## ℹ️ About Us

![About Us](https://i.imgur.com/XSevtku.png)

- Explains the platform’s mission
- Focus on students and housing accessibility
- Highlights trust, transparency, and community

---

## 🏘️ Rooms & Booking System

![Room 1](https://i.imgur.com/4jY0CZx.jpeg)
![Room 2](https://i.imgur.com/rPU2mDu.png)
![Room 3](https://i.imgur.com/pkFRSkt.png)
![Room 4](https://i.imgur.com/0PQi7h1.png)
![Room 5](https://i.imgur.com/aRbbRpM.png)

### Booking Flow
1. Students filter rooms by:
   - Room type
   - Area
   - University
   - Booking dates  
   *(Areas and universities are admin-managed and clickable)*

2. Available rooms are displayed with:
   - Price
   - Capacity
   - Specifications

3. User fills personal information and selects payment:
   - **Full payment**
   - **Deposit payment** (value defined by renter)

4. Room is reserved immediately after payment.

### Deposit Rules
- Daily reminders are sent via cron job
- If remaining balance is not paid before booking start date:
  - Reservation is canceled
  - Deposit is **non-refundable**

### Conflict Prevention
- Booked dates are automatically disabled
- Overlapping bookings are blocked instantly
- Warning message appears if conflict exists

### Room Capacity Logic
- **Private Room:** One student per date range
- **Shared Room:** Multiple students allowed (based on capacity)
  - Once capacity is full, dates are blocked automatically

---

## 📰 News & Updates

![News](https://i.imgur.com/KbfSkFs.jpeg)

- Platform announcements
- University-related news
- Promotions and updates
- Fully managed by admin

---

## 👤 Dashboards

### 👑 Super Admin Dashboard

![Admin Dashboard](https://i.imgur.com/6MF0TZe.png)
![Admin Management](https://i.imgur.com/4KYuy20.png)
![Admin Users](https://i.imgur.com/kakKssm.png)
![Admin Notifications](https://i.imgur.com/Evb8l2O.png)

**Admin Capabilities**
- Full control over users, listings, and bookings
- Role-Based Access Control (RBAC)
- Create and manage admins
- Feature listings and universities
- Monitor chats (moderation)
- Manage feedback and reviews
- Oversee payments and disputes
- Content management (FAQs, policies, pages)

---

### 🧑‍🎓 Client (Renter) Dashboard

![Renter Dashboard](https://i.imgur.com/6gU8PL3.png)

**Client Features**
- Browse and book dorms
- Manage bookings & payments
- Post dorm requests
- Post roommate / house-sharing ads
- Chat with renters
- Leave reviews and ratings

---

## 🔐 Authentication & Security

- JWT authentication
- HTTP-only cookies
- Role-based route protection
- Secure payment handling

---

## 🌍 Additional Features

- Email & system notifications
- English & Arabic support
- Fully responsive UI
- Optional 3D room tours
- Reviews & ratings system
- Ready for future mobile app

---

## 💎 Unique Value Proposition

- University-integrated housing discovery
- Location-based dorm comparison
- Conflict-free booking system
- Flexible deposit payments
- Hybrid marketplace + student community
- Built specifically for Lebanon’s student housing ecosystem

---

## 📦 Installation

```bash
npm install
