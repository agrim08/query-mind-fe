# 🎨 QueryMind Frontend: The AI Data Interface

A high-performance, premium dashboard designed for effortless data exploration. Built with **Next.js 15** and **Tailwind CSS 4**, it provides a seamless bridge between natural language and database insights.

---

## ✨ Key Features

- **Real-Time Streaming UX**: Experience SQL generation as it happens. Our UI consumes **Server-Sent Events (SSE)** to stream code blocks and progress updates dynamically.
- **Modern Dashboard Design**: A sleek, dark-themed interface crafted with **Tailwind CSS 4** and **Framer Motion** for premium feel and smooth interactions.
- **Dynamic Schema Visualization**: Easily manage multiple database connections, view indexed tables, and track query history in one unified view.
- **Secure Authentication**: Fully integrated with **Clerk** for multi-tenant security and seamless onboarding.
- **Client-Side State Management**: Powered by **Zustand** for a lightweight, performant, and predictable state layer.

---

## 🛠 Technical Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Zero-runtime CSS with modern variables)
- **State**: [Zustand](https://github.com/pmndrs/zustand) (Store isolation and persistence)
- **Icons**: [Lucide React](https://lucide.dev/) (Clean, consistent iconography)
- **Auth**: [Clerk](https://clerk.com/) (Modern auth and user management)

---

## 🏗 Key Components

- **`AppShell`**: The core layout orchestrating navigation and global state synchronization.
- **`SQLPlayground`**: A real-time interface for asking questions, streaming SQL, and viewing data tables.
- **`ConnectionManager`**: CRUD interface for adding and indexing PostgreSQL databases.
- **`HistoryView`**: A chronological record of past natural language queries and their SQL counterparts.

---

## ⚡ Deployment

This frontend is optimized for **Vercel**.

1. Push to GitHub.
2. Link project to Vercel.
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From your Clerk dashboard.
   - `CLERK_SECRET_KEY`: From your Clerk dashboard.

---

## 🚀 Development

```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000` to start exploring.
