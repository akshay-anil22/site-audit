# 🔍 Site Audit Dashboard

A full-stack, pixel-perfect frontend implementation of a Site Audit module, inspired by the Ahrefs Site Audit Tool. This application allows users to monitor website health, execute structural crawls, and analyze identified SEO and performance issues through a highly responsive interface.

**[🟢 View Live Demo](https://site-audit-tan.vercel.app/sites)** | **[💻 GitHub Repository](https://github.com/akshay-anil22/site-audit)**

---

## ✨ Core Features

* **Site Management:** Add new web properties to track or delete existing ones from the dashboard.
* **Site Dashboard List:** A comprehensive overview displaying all crawled sites and their high-level health metrics.
* **Crawl Control System:** Interactive controls to manually start, pause, and stop website crawls in real-time.
* **Crawl Details Page:** In-depth statistical cards and visualizations breaking down the results of individual site crawls.
* **Issues Table & Filtering:** A dynamic data table categorizing identified issues by type and severity, complete with advanced dropdown filtering for quick triage.

---

## 🎨 Design & UI Standards

* **Pixel-Perfect Execution:** UI components and layouts strictly adhere to the provided Figma design files.
* **Mobile Responsiveness:** Fluid layouts ensuring a seamless experience across desktop, tablet, and mobile breakpoints.
* **Catalyst UI Kit Integration:** Leveraged the Headless UI-powered Catalyst kit for accessible, unstyled core components, heavily customized with Tailwind CSS.
* **Tailwind-First Styling:** Utility-first CSS approach for maintainable and scalable styling, avoiding custom CSS unless strictly necessary.

---

## 🛠️ Tech Stack

**Frontend Architecture:**
* **React 18 & Vite:** For building a fast, dynamic, and component-driven user interface.
* **React Router DOM:** Handling seamless client-side navigation between the dashboard, site details, and issue pages.

**State Management & Data Fetching:**
* **TanStack Query (React Query):** Managing complex server-state, API data caching, and synchronization with the backend.
* **Zustand:** Providing a lightweight, scalable solution for global client-state management.

**Backend & Deployment:**
* **Backend API:** Node.js, Express.js, CORS
* **Frontend Hosting:** Vercel (Configured with custom rewrites for SPA routing)
* **Backend Hosting:** Render

---

## 🚀 Local Development Setup

To run this project locally, you need to start both the mock backend server and the Vite frontend.

### Prerequisites
* Node.js (v18 or higher)
* Git

### 1. Clone the Repository
Open your terminal and run:

```bash
git clone https://github.com/akshay-anil22/site-audit.git
cd site-audit
```

### 2. Start the Backend Server
Open a terminal inside the cloned repository to start the Node.js API:

```bash
cd site-audit-backend/SiteAudit-backend
npm install
npm run dev
```

### 3. Start the Frontend Application
Open a **new, separate terminal window** (keep the backend running in the first one), and navigate back to the root of the cloned repository:

```bash
cd site-audit-frontend
npm install

# Create environment variables file
echo VITE_API_URL=http://localhost:3000/api > .env

# Start the Vite development server
npm run dev
```

---

## 📸 Project Screenshots

### Main Dashboard (All Sites)
<img width="1886" height="867" alt="Screenshot 2026-03-02 231950" src="https://github.com/user-attachments/assets/d5e10977-9bf1-452e-9a9b-5e3029dd818a" />

### Crawl Details & Issues
<img width="1888" height="867" alt="Screenshot 2026-03-02 232028" src="https://github.com/user-attachments/assets/313bcff6-f22c-4700-973e-97faf8b818c4" />


