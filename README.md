# Z-Station Backend

This project is the backend server for the Z-Station application, handling user authentication, user data, product information, tank balances, and tank activity (fuel transactions).

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) instance (running locally or accessible via URI)

## Installation

1.  Clone the repository (if applicable).
2.  Navigate to the project directory:
    ```bash
    cd L5-Z-Station-Backend
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

## Environment Variables

Create a `.env` file in the root of the project directory and add the following variables:

```dotenv
# MongoDB Connection String
# Replace with your actual MongoDB connection details
# This database will store Users, Products, and Transactions/TankActivity collections
MONGODB_URI=mongodb://127.0.0.1:27017/Products-Z-Station

# Port the server will run on
PORT=3000

# JSON Web Token Secret
# Replace with a strong, unique, random secret key for signing JWTs
JWT_SECRET=your-super-secret-jwt-key-keep-it-safe
```

**Important:** Replace the placeholder values, especially `JWT_SECRET`, with your actual configuration details.

## Running the Application

- **Development Mode (with auto-reload using nodemon):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

The server will start, connect to the MongoDB database specified in `MONGODB_URI`, and listen on the `PORT` defined in the `.env` file (defaulting to 3000 if not set).

## API Endpoints

The server exposes the following main API routes:

- `/api/auth`: Handles user authentication (details depend on `routes/auth.js`).
- `/api/users`: Manages user data (details depend on `routes/user.js`).
- `/api/tanks`: Likely manages user tank balance/capacity (details depend on `routes/tank.js`).
- `/api/transactions`: Manages tank activity (fuel transactions):
  - `POST /`: Creates a new tank activity record.
  - `GET /:phoneNumber`: Retrieves tank activity records for a specific phone number.
- `/api/products`:
  - `GET /`: Retrieves products by category (query param `?category=...`).
  - `GET /:productId`: Retrieves details for a specific product.

Refer to the specific files in the `routes/` directory for detailed request/response structures for each endpoint.
