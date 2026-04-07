# Dynamic Product Management System

This is the assignment for the Full Stack Developer role. It implements a complete product management system where the product attributes, search filters, and detail pages adapt dynamically to the category. It uses React on the frontend, Node.js + Express on the backend, MongoDB for database, and Elasticsearch for search functionalities.

## Features implemented
- Fully dynamic form in React for adding products based on chosen category.
- Backend APIs for handling categories, products, and search.
- MongoDB schema designed to be highly scalable using flexible maps.
- Elasticsearch integration for full-text search and dynamic aggregations/filters (it gracefully falls back to MongoDB if ES is not directly accessible).
- Beautiful, responsive UI using vanilla CSS.

## Requirements

- Node.js (v16 or higher)
- MongoDB running locally
- Elasticsearch running on https://localhost:9200 (optional but recommended for full search capability)

## How to run

### Backend
1. Go to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Setup the `.env` file with your config:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/dynamic-products
   ELASTICSEARCH_URL=https://localhost:9200
   ELASTICSEARCH_USERNAME=elastic
   ELASTICSEARCH_PASSWORD=yourpassword
   NODE_ENV=development
   ```
4. Run the seed script to create initial categories (Mobiles and Bangles) and sample products:
   `npm run seed`
5. Start the server: `npm run dev`

### Frontend
1. Open a new terminal and go to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. The React app will run on `http://localhost:5173`. 

## How it works (Bonus)
The system is built to support adding new categories without *any* frontend changes. 
When an admin creates a new category from the UI, they define the custom attributes (like RAM, weight, material, etc.) along with their types (text, multiselect, boolean, etc.). 
The frontend dynamically fetches this schema from the `/api/categories` endpoint and auto-generates the input fields using the `DynamicForm` component. Similarly, the `DynamicFilters` component builds the right sidebar filters based on the attributes marked as `filterable` from the backend aggregations. This ensures zero hardcoding.
