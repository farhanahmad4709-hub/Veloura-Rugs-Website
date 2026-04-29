<p align="center">
  <img src="image/logo.png" alt="Veloura Rugs Logo" width="120" />
</p>

<h1 align="center">Veloura Rugs</h1>
<h3 align="center">✦ Artistry & History in Every Knot ✦</h3>

<p align="center">
  A premium, fully responsive full-stack e-commerce storefront for handcrafted heritage rugs — built with Node.js, Express, MySQL, HTML, CSS & JavaScript.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Pages Overview](#-pages-overview)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🏷️ About

**Veloura Rugs** is a luxury e-commerce web application designed for selling hand-knotted, heritage rugs sourced from Persia, Turkey, Afghanistan, and Morocco. The site features a boutique-grade UI with rich animations, mega-menu navigation, advanced product filtering, and a complete shopping experience.

> **Note:** The project operates on a robust Node.js/Express backend connected to a TiDB MySQL Database. It features secure JWT authentication, a fully customized Admin Dashboard for inventory management, and database auto-healing logic for easy deployments.

---

## ✨ Features

### 🛍️ Shopping Experience
- **30+ Product Catalog** — Handcrafted rugs across 9 sizes, 9 styles, and 9 colors
- **Advanced Filtering** — Filter by size, style, color, and price range with active filter tags
- **Sorting Options** — Sort by featured, price (low/high), name (A–Z), or biggest discount
- **Real-time Search** — Global search bar with instant filtering on the shop page
- **Quick View Modal** — Preview product details without leaving the page
- **Product Detail Pages** — Full product information with image gallery and metadata

### 🛒 Cart System
- **Persistent Cart** — Cart items saved to `localStorage` and persist across sessions
- **Slide-out Cart Sidebar** — View and manage cart without leaving the current page
- **Quantity Controls** — Increment/decrement quantity with live price updates
- **Dynamic Badge Counter** — Cart count badge updates in real-time across all pages

### ❤️ Wishlist
- **Toggle Wishlist** — Add/remove products with heart icon toggle
- **Persistent Wishlist** — Saved to `localStorage` for cross-session persistence
- **Dedicated Wishlist Page** — View and manage all wishlisted items
- **Move to Cart** — Seamlessly move items from wishlist to cart

### 🔐 Secure Authentication System
- **JWT Sessions** — Encrypted token-based authentication protecting admin routes and user checkout
- **Password Hashing** — Secure bcryptjs hashing for all user accounts in the database
- **User Registration & Login** — Sign up with name, email, and password
- **Live Validation** — Real-time field validation with error/success indicators and duplicate email blocking
- **Password Strength Meter** — Visual strength indicator (Weak → Very Strong)

### 📊 Admin Dashboard (New!)
- **Secure Portal** — Dedicated `/admin` route strictly protected by JWT admin claims
- **Data Visualization** — Real-time Chart.js graphs displaying revenue over time and order statuses
- **Inventory Control** — Admins can view low-stock alerts, edit product pricing, and update inventory counts
- **Order Management** — Track all customer orders, process shipping statuses, and export CSV reports

### 🤖 Database Auto-Healing
- **Dynamic Schema Upgrades** — Built-in startup script intelligently verifies and repairs database structures
- **Zero-Touch Setup** — Automatically creates tables and seeds the initial 30 products on first boot
- **Force Init Diagnostics** — Special API endpoints to forcefully heal missing columns on live cloud environments

### 🎨 Design & UX
- **Fully Responsive** — Optimized for desktop, tablet, and mobile (480px – 1440px+)
- **Premium Typography** — Cormorant Garamond (display) + Jost (body) from Google Fonts
- **Animated Hero Section** — Zoom-out parallax effect with staggered fade-up animations
- **Mega Menu Navigation** — Multi-column dropdown with size, style, and color categories

### 💳 Checkout & Database Orders
- **Order Summary** — Itemized cart review with subtotal, tax, and total calculation
- **Database Processing** — Orders are securely inserted into MySQL, associating products and calculating totals
- **Stock Validation** — Real-time database checks prevent purchasing items that are out of stock
- **Order Confirmation** — Success toast with automatic redirect to homepage

---

## 🛠️ Tech Stack

| Technology | Purpose |
|:---|:---|
| **Node.js & Express** | Backend server, REST API routing, and request handling |
| **MySQL (TiDB)** | Relational database storing products, users, and orders |
| **JWT & bcryptjs** | Secure token-based authentication and password hashing |
| **Vercel Serverless** | Cloud hosting platform with automated static and API routing |
| **HTML5 & CSS3** | Semantic structure, styling, animations, responsive design |
| **Vanilla JavaScript** | Front-end interactivity, DOM manipulation, and API integration |
| **Chart.js** | Dynamic data visualization on the Admin Dashboard |

---

## 📁 Project Structure

```
veloura-rugs/
├── css/
│   ├── style.css          # Global styles, layout, components, responsive rules
│   └── auth.css           # Login & signup page styles
├── js/
│   ├── products.js        # Product catalog data (30 products) & helper functions
│   ├── cart.js            # Cart system (add, remove, update, render, persist)
│   ├── wishlist.js        # Wishlist system (toggle, persist, UI sync)
│   ├── auth.js            # Authentication (register, login, logout, validation)
│   └── app.js             # Shared utilities (toast, Quick View, card renderer, nav)
├── image/
│   └── logo.png           # Brand logo
├── index.html             # Homepage (hero, collections, about, featured, newsletter)
├── shop.html              # Shop page (filters sidebar, product grid, search, sort)
├── product.html           # Individual product detail page
├── cart.html               # Full cart page
├── wishlist.html           # Wishlist page
├── checkout.html           # Checkout with shipping form & order summary
├── about.html              # About Us page (story, mission, stats)
├── contact.html            # Contact page (showroom info, contact details)
├── login.html              # User login form
├── signup.html             # User registration form
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL compatible database (TiDB, MySQL 5.7+, MariaDB)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/veloura-rugs.git
   cd veloura-rugs
   ```

2. **Install Server Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add:
   ```env
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   DB_PORT=4000
   JWT_SECRET=your_super_secret_jwt_key
   PORT=3000
   ```

4. **Run the Server:**
   ```bash
   npm run dev
   # The built-in auto-healing script will automatically create your database tables and seed 30 products!
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:3000`

---

## 📄 Pages Overview

| Page | File | Description |
|:---|:---|:---|
| **Home** | `index.html` | Hero banner, collections, about preview, shop-by-style, featured products |
| **Shop** | `shop.html` | Full product catalog with sidebar filters, search bar, and sorting |
| **Product Detail** | `product.html` | Individual product page with image, price, description, and metadata |
| **Cart** | `cart.html` | Full-page cart view with quantity controls and checkout link |
| **Wishlist** | `wishlist.html` | Saved items with move-to-cart and remove options |
| **Checkout** | `checkout.html` | Shipping form + order summary with tax calculation |
| **About** | `about.html` | Brand story, mission statement, heritage stats |
| **Contact** | `contact.html` | Showroom address, hours, phone, email |
| **Login** | `login.html` | Email/password login with "Remember Me" |
| **Sign Up** | `signup.html` | Registration with live validation and password strength |

---

## 📸 Screenshots

> _Add screenshots of the site here for a better visual overview._
> 
> ```
> ![Homepage](screenshots/homepage.png)
> ![Shop Page](screenshots/shop.png)
> ![Product Detail](screenshots/product.png)
> ![Cart Sidebar](screenshots/cart.png)
> ```

---

## 📞 Contact

- **Phone:** +1 415 565 1579
- **Email:** velourarugs@email.com
- **Address:** 4731 Pell Dr, Ste 5, Sacramento, CA 95838

---

## 📝 License

This project is for educational and portfolio purposes. All product images are sourced from [Pexels](https://www.pexels.com) (free to use).

---

<p align="center">
  Made with ❤️ by <strong>Veloura Rugs</strong><br/>
  © 2026 Veloura Rugs. All rights reserved.
</p>
