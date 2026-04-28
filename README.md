<p align="center">
  <img src="image/logo.png" alt="Veloura Rugs Logo" width="120" />
</p>

<h1 align="center">Veloura Rugs</h1>
<h3 align="center">✦ Artistry & History in Every Knot ✦</h3>

<p align="center">
  A premium, fully responsive e-commerce storefront for handcrafted heritage rugs — built with vanilla HTML, CSS & JavaScript.
</p>

<p align="center">
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

**Veloura Rugs** is a luxury e-commerce web application designed for selling hand-knotted, heritage rugs sourced from Persia, Turkey, Afghanistan, and Morocco. The site features a boutique-grade UI with rich animations, mega-menu navigation, advanced product filtering, and a complete shopping experience — all powered by pure client-side JavaScript with `localStorage` persistence.

> **Note:** This is a front-end-only project. No back-end server or database is required. All data (cart, wishlist, user accounts) is stored in the browser's `localStorage`.

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

### 🔐 Authentication System
- **User Registration** — Sign up with name, email, and password
- **User Login** — Login with email/password with "Remember Me" option
- **Live Validation** — Real-time field validation with error/success indicators
- **Password Strength Meter** — Visual strength indicator (Weak → Very Strong)
- **Show/Hide Password** — Toggle password visibility with eye icon
- **Session Management** — Logged-in users see their name in the header with logout option

### 🎨 Design & UX
- **Fully Responsive** — Optimized for desktop, tablet, and mobile (480px – 1440px+)
- **Premium Typography** — Cormorant Garamond (display) + Jost (body) from Google Fonts
- **Animated Hero Section** — Zoom-out parallax effect with staggered fade-up animations
- **Mega Menu Navigation** — Multi-column dropdown with size, style, and color categories
- **Scrolling Marquee Bar** — Promotional offers ticker at the top and bottom
- **Trust Bar** — Five trust indicators (shipping, returns, authenticity, delivery, consultation)
- **Toast Notifications** — Elegant slide-in notifications for cart, wishlist, and form actions
- **Smooth Hover Effects** — Image zoom on product cards and collection cards
- **Newsletter Subscription** — Email capture form on every page

### 💳 Checkout
- **Order Summary** — Itemized cart review with subtotal, tax, and total calculation
- **Shipping Form** — Complete form with first/last name, email, address, city, state, ZIP, phone
- **Order Confirmation** — Success toast with automatic redirect to homepage

---

## 🛠️ Tech Stack

| Technology | Purpose |
|:---|:---|
| **HTML5** | Semantic structure and page layout |
| **CSS3** | Styling, animations, responsive design (CSS custom properties) |
| **Vanilla JavaScript** | All interactivity, state management, DOM manipulation |
| **Google Fonts** | Cormorant Garamond & Jost typography |
| **Pexels** | Product and hero imagery |
| **localStorage** | Client-side data persistence (cart, wishlist, auth) |

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
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools, package managers, or servers required

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/veloura-rugs.git
   ```

2. **Navigate to the project folder:**
   ```bash
   cd veloura-rugs
   ```

3. **Open in browser:**
   - Simply double-click `index.html`, **or**
   - Use a live server extension (e.g., VS Code Live Server):
     ```bash
     # If using VS Code
     code . 
     # Then right-click index.html → "Open with Live Server"
     ```

> **Tip:** Using a local server avoids potential CORS issues with image loading.

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
