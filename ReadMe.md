# Part 1: MongoDB Aggregation & Data Modeling – Summary Notes

## Question 1: Schema Design

- We designed three collections: `users`, `follows`, and `posts`.
- The `users` collection contains basic user info with `joined` date.
- The `follows` collection represents follower-following relationships.
- The `posts` collection includes post content and timestamp.
- This setup supports efficient retrieval of followers and reverse-chronological post listing.

## Question 2: Aggregation Pipeline

- An aggregation pipeline was created to:
  - Get the list of users someone is following.
  - Fetch the 10 most recent posts from those users.
  - Include post content, creation time, and author name.
  - Sort the posts by creation date in descending order.

## Question 3: Indexing Strategy

- Added a compound index on `posts` → `{ author: 1, created: -1 }` for optimized filtering and sorting.
- Indexed `follows` → `{ follower: 1 }` to improve lookup of followings.
- Leveraged MongoDB’s default `_id` index on `users` for fast lookup during joins.

# Part 2: Node.js API & Middleware

## 🧩 Overview

This backend API powers a simple social feed app with login, feed retrieval, post deletion (admin-only), and robust security middleware like CORS, Helmet, and rate-limiting. JWT-based role authentication is implemented, and tests ensure correctness and access control.

## 🚀 Instructions to Run the API

Once cloned:

1. Move into the project directory:

   ```bash
   cd api
   ```

2. Install all dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

   The server will be running at `http://localhost:3000`.

   - You can login using:
     - User: `u1`
     - Admin: `u2`

## ✅ Running Tests

To verify functionality and role-based access control, run:

```bash
npm run test
```

This will execute test cases covering:

- ✅ Admin can delete posts
- ✅ Normal users are forbidden from deletion
- ✅ Invalid or missing tokens are handled securely

## 💬 Final Notes

This backend is designed with correctness, security, and test coverage in mind. All APIs are protected, concise, and ready to integrate with the frontend feed client.

# Part 3: React Frontend & Custom Hook - Feed App

## Overview

This is a lightweight **React Single Page Application** built using **Vite** (no CRA), designed to interact with a JWT-protected backend API and display a user's feed with infinite scroll. It demonstrates clean component structure, API abstraction using a custom hook, and token-based session control.

## Features

- ✅ **Login page** — authenticates via `/login` and stores JWT in memory using React Context
- ✅ **Feed page** — displays posts using `/feed` endpoint with infinite scroll
- ✅ **Custom hook (`useApi`)** — handles fetching, JSON parsing, loading states, error handling, and result caching to prevent unnecessary re-fetches
- ✅ **Smooth infinite scroll** — loads 10 more posts as the user scrolls down
- ✅ Clean state and component logic with optimized rendering

## How to Run the React App

1. Ensure the backend server is running at `http://localhost:3000`
2. Clone this repository
3. Navigate to the `web/` directory
4. Run the following commands:

```bash
npm install
npm start
```

## Development Server

This will start the development server at [http://localhost:5173](http://localhost:5173) (default Vite port).
You can then access the app in your browser.

---

## Page Flow

### 🔐 Login

- User provides `userId` (e.g., `u1`, `u2`)
- Calls `/login` on the backend
- JWT is stored in a React Context
- User is redirected to `/feed`

---

### 📰 Feed

- Automatically fetches from `/feed`
- Infinite scroll loads the next 10 posts when scrolling down
- Each post shows:
  - `content`
  - `author name`
  - `created date`

## Notes

- ⚙️ This project was built from scratch using **Vite**, not Create React App.
- 💅 No UI libraries were used — built with pure JSX and custom CSS.
- 🧩 The app is modular, clean, and suitable for building scalable feed-based interfaces.

# Part 4: Debugging & Code Review

## Overview

In this part, we reviewed a backend endpoint responsible for returning sorted posts and identified several issues affecting performance, reliability, and user experience.

### Key Actions Taken:

- **Analyzed hanging requests** due to missing error handling, and wrapped the route in a try/catch block to ensure graceful error responses.
- **Diagnosed duplication** of posts caused by missing schema constraints and resolved it using MongoDB aggregation and schema-level uniqueness.
- **Replaced inefficient JavaScript sorting** with database-level sorting for optimized performance and accurate results.
- **Introduced pagination and lean queries** to improve memory usage and reduce the load on the application during large fetch operations.
- **Summarized the root causes and fixes** in plain English to make the logic approachable and maintainable for future developers.

✅ The result is a reliable, efficient, and clean backend implementation that adheres to good practices and avoids future regressions.
