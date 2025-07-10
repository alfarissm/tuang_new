# Tuang - Digital Canteen Application

Welcome to **Tuang**, a modern digital canteen application designed to revolutionize ordering and management in canteen environments. This app provides three main portals: one for customers, one for vendors, and one for administrators—all seamlessly integrated for an efficient experience.

## Main Features

### 1. Customer Portal (`/`)
- **Intuitive Menu Browsing:** Customers can easily browse menus from various vendors, filtered by category.
- **Shopping Cart System:** Add items to the cart, adjust quantities, and see the order total in real-time.
- **Easy Checkout Process:** Enter your name and table number, then choose a payment method (QRIS or Cash).
- **Order Status Tracking:** After ordering, customers receive a dedicated status page to visually track their order progress from "Ordered" to "Ready for Pickup."
- **Rating System:** Customers can give star ratings after their order is completed.

### 2. Vendor Dashboard (`/vendor`)
- **Secure Login:** Each vendor has their own account with hashed passwords for security.
- **Order Management:** View incoming orders in real time, specific to their stall.
- **Item Status Updates:** Vendors can update the status of each item in an order (e.g., from "Processing" to "Completed").
- **Menu Management:** Easily add, edit, and delete menu items, including uploading product images.
- **Revenue Reports:** View daily revenue charts to track sales performance.

### 3. Admin Dashboard (`/admin`)
- **Admin Login:** Access the central dashboard with admin credentials.
- **Overview Dashboard:** See key statistics such as total revenue, number of orders, total vendors, and total menu items.
- **Centralized Management:**
    - **Manage Vendors:** Add, edit, or delete vendor data.
    - **Manage Menus:** Manage all menu items from all vendors in one place.
    - **Manage Categories:** Organize available menu categories across the application.
- **Comprehensive Financial Reports:** Analyze monthly revenue across the entire platform.
- **Activity Logs:** Monitor all important activities taking place in the system.

## Technology Stack

- **Framework:** Next.js 14+ (with App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **State Management:** React Context (Hooks `useContext` and `useState`)
- **Backend & Database:** Supabase
  - **Database:** PostgreSQL

> Note: This README is adapted from the source file in the repo [alfarissm/tuang_new](https://github.com/alfarissm/tuang_new/blob/master/README.md). For the most complete and up-to-date information, please check the repository directly.