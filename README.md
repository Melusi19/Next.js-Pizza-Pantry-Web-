# 🍕 Pizza Pantry – Inventory Management Web App

A modern, full-stack **inventory management system** for a pizza shop.  
Built with **Next.js 15 (App Router)**, **TypeScript**, and **MongoDB**, this app allows authenticated users to efficiently manage pizza ingredients and supplies — from tracking stock levels to adding, editing, or removing inventory items.

---

## 🚀 Features

### 👤 Authentication
- Secure sign-up and login using **Clerk**
- Protects routes and pages (only logged-in users can access inventory)
- User-based item creation tracking (`createdBy` field)

### 📦 Inventory Management
- **View inventory list** with search, filter, and sort options
- **Add new items** (with validation)
- **Edit items** (name, category, unit, reorder threshold, and cost)
- **Adjust stock levels**
  - Add stock
  - Remove stock (records delta and timestamp)
- **Delete items** with confirmation
- **Empty/loading/error states** for clean UX

### 🧠 Validation
- **Client-side and server-side validation** using **Zod**
- Prevents invalid data entry (e.g., negative quantities, missing fields)

### 💅 UI/UX
- Clean, responsive, and accessible interface (TailwindCSS or ShadCN)
- Consistent design system
- Optimized for both desktop and mobile

---

## 🏗️ Tech Stack

| Layer | Technology |
|--------|-------------|
| Framework | [Next.js 15 (App Router)](https://nextjs.org/docs/app) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Authentication | [Clerk](https://clerk.dev/) |
| Database | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) |
| Validation | [Zod](https://zod.dev/) |
| UI Components | [TailwindCSS](https://tailwindcss.com/) / [ShadCN](https://ui.shadcn.com/) |
| Deployment | [Vercel](https://vercel.com/) (recommended) |

---

## 🧩 Data Model

```ts
Item {
  _id: ObjectId,
  name: string,
  category: string,
  unit: string,
  quantity: number,
  reorderThreshold: number,
  costPrice: number,
  updatedAt: Date,
  createdAt: Date,
  createdBy: string, // Clerk user ID
}

⚙️ Installation & Setup
1. Clone the repository

git clone https://github.com/yourusername/pizza-pantry.git
cd pizza-pantry

2. Install dependencies
npm install

3. Create .env.local file

Create a .env.local file in the project root and add:

# MongoDB connection
MONGODB_URI=your_mongodb_connection_string

# Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

4. Run the development server
npm run dev

Then visit 👉 http://localhost:3000

🧮 Folder Structure
pizza-pantry/
├── app/
│   ├── (auth)/              # Authentication routes (login, register)
│   ├── dashboard/           # Protected inventory management routes
│   │   ├── page.tsx         # Inventory list page
│   │   ├── new/             # Add new item page
│   │   └── [id]/edit/       # Edit item page
│   └── layout.tsx           # Global layout
├── components/              # Reusable UI components
├── lib/
│   ├── db.ts                # MongoDB connection
│   ├── validations.ts       # Zod schemas
│   └── utils.ts             # Helper functions
├── models/
│   └── Item.ts              # Mongoose schema and model
├── public/                  # Static assets
├── styles/                  # Global styles
└── package.json

🔒 Validation Rules (Zod Example)
import { z } from "zod";

export const ItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().nonnegative("Quantity cannot be negative"),
  reorderThreshold: z.number().nonnegative("Reorder threshold cannot be negative"),
  costPrice: z.number().nonnegative("Cost must be positive"),
});

🧪 Future Enhancements

📊 Analytics dashboard (stock trends, cost reports)

🔔 Low-stock notifications

📱 PWA support for offline use

🧾 Export inventory reports (CSV / PDF)

🍕 "Stay saucy. Track your toppings efficiently!" 😄

---

Would you like me to include **example API endpoints** (for CRUD actions) in the README too? That would make it ready for submission as a complete technical assessment.
