# Dynamic Product Management System

This repository contains the Full Stack Developer assignment implementation. It features a complete, highly-scalable product management architecture where product attributes, search filters, and detail pages adapt dynamically to their associated categories. 

The stack relies on **React (Vite)** on the frontend, **Node.js + Express** on the backend, **MongoDB** for flexible document schema handling, and **Elasticsearch** for high-performance, dynamic querying.

---

## 🚀 Key Features

- **Dynamic Category & Product Schema:** Instead of hardcoding product forms, administrators define categories with custom attributes (e.g., RAM for Laptops, Material for Jewelry). The React frontend dynamically renders these forms based directly on the API specifications.
- **Elasticsearch-Powered Engine:** High-performance, full-text search backend. Complex filter queries, strict brand matching, and range queries (like price restrictions) are completely delegated to Elasticsearch to remove load from MongoDB reads.
- **Dynamic Aggregation Filters:** Search sidebar filters are dynamically aggregated and generated purely based on the attributes defined as `filterable` within the Category schema. No frontend hardcoding involved!
- **Robust Soft Deletion Architecture:** Both products and categories implement a `deleteStatus` soft-delete system. Deleting a record hides it immediately across all fetching hooks and API routes, removes it from the active Elasticsearch indices, but cleverly preserves relational data inside MongoDB.
- **Modern React (v19) Architecture:** Highly optimized state batching, multi-param API querying via unified trigger references, custom Modals, and intuitive Toast integrations.
- **Vanilla CSS UI:** Hand-crafted, fully responsive layout system without leaning on heavy utility libraries.

---

## 🛠️ Required Prerequisites

Ensure you have the following installed before proceeding with deployment:
- **Node.js** (v16.x or higher)
- **MongoDB** running locally on default port `27017` or via connection URI.
- **Elasticsearch** (v8.x recommended) running on `https://localhost:9200`.

---

## 💻 Getting Started

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with your database and cluster configuration:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dynamic-products
ELASTICSEARCH_URL=https://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_elastic_password
NODE_ENV=development
```

*(Optional)* Run the seed script to automatically generate initial dynamic categories and sample products:
```bash
npm run seed
```

Start the Express development server:
```bash
npm run dev
```

### 2. Frontend Setup

Open a new terminal session and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser to view the dashboard!

---

## 🏗️ Architecture Design (Under the Hood)

### 1. Extensible Form Rendering
The system is built to support creating completely new domains in seconds without modifying any React or backend code. When an admin adds a new category from the UI (e.g. "Smartphones"), they define custom fields (Screen Size, Battery Capacity, 5G Status). When creating a product under that category, the `/api/categories` endpoint ships the schema definitions straight to the `DynamicForm.jsx` component which securely maps them into corresponding inputs, multiselects, or toggles.

### 2. Optimized Pipeline Updates
The Search UI is designed to monitor varying URL query params, text searches, and dynamically selected attributes. To negate duplicate React 18 fires and dependency chain race conditions, API requests are batched through a single unified `searchTrigger` execution pipeline.

### 3. Two-Tier Data Isolation
- **Primary Database:** MongoDB manages standard mutations, scalable `Map` structures for product specifications, constraint validation, and soft-delete states.
- **Aggregated Search Engine:** Elasticsearch acts as an isolated query resolver. Products sync to a single unified ES index, meaning dynamic filter aggregations analyze dataset hits with lightning speed, preventing expensive multi-collection joins in Mongo during intense searches.
