# Part 4: Debugging & Code Review

## 1. Identified Problems

### 🟥 Showstopper 1: Hanging Requests

- **Cause:** Unhandled exceptions in `getSortedPosts()` cause the server to hang without sending a response.
- **Impact:** Client-side requests may time out or freeze, consuming resources indefinitely.

### 🟥 Showstopper 2: Duplicate Posts in Response

- **Cause:**
  - No deduplication in fetch logic.
  - Database may contain multiple posts with the same `slug`, `title`, or `content` due to lack of schema constraints.
- **Impact:** Users see repeated posts; breaks pagination and disrupts the user experience.

### 🟧 Problem 3: Inefficient Sorting

- **Cause:** Sorting is done in JavaScript (`.sort(...)`) after fetching all documents and comparing via `b.created - a.created`.
- **Impact:** High memory and CPU usage on large datasets, leading to performance bottlenecks and improper date comparisons, can cause performance issues and incorrect results.

### 🟨 Problem 4: Missing Pagination or Limits

- **Cause:** `.find()` fetches all documents without limits.
- **Impact:** Poor performance, potential crashes when fetching large datasets.

---

## 2. Corrective Actions & Optimizations

### ✅ Fix 1: Add Error Handling to Prevent Hanging

```js
router.get("/posts", async (req, res) => {
  try {
    await getSortedPosts(req, res);
    console.log("Done.");
  } catch (error) {
    console.error("Error in getSortedPosts:", error);
    res
      .status(400)
      .json({ message: "An Error occurred while fetching posts." });
  }
});
```

- **Explanation:** This ensures that even if an error occurs in `getSortedPosts()`, the client receives an appropriate error message instead of the server hanging.

### ✅ Fix 2: Fetch Unique, Sorted Posts via Aggregation

If "duplicate" means the same `slug` (or other field):

```js
const posts = await Posts.aggregate([
  { $sort: { title: 1 } },
  {
    $group: {
      _id: "$title",
    },
  },
  { $limit: 10 },
]);
```

- **Explanation:** This aggregation pipeline ensures only the most recent post per unique `slug` is returned, avoiding duplicate posts in the response.

### ✅ Fix 3: Schema-Level Deduplication

Update the schema to enforce uniqueness at the database level:

```js
const postSchema = new mongoose.Schema({
  title: String,
  slug: {
    type: String,
    required: true,
    unique: true, // Prevent duplicates at DB level
  },
  created: {
    type: Date,
    default: Date.now,
  },
});
await Post.init(); // Ensure unique index is created
```

- **Explanation:** Enforcing uniqueness in the database ensures no duplicate posts are inserted in the future, making the application more resilient.

### ✅ Fix 4 (Optional): Code-Side Deduplication (Fallback)

If you can't rely on aggregation or schema constraints yet:

```js
const posts = await Posts.find().sort({ created: -1 }).limit(100).lean();
const uniquePosts = Array.from(new Map(posts.map((p) => [p.slug, p])).values());
```

- **Explanation:** This ensures that any duplicates in the fetched posts (based on `slug`) are removed on the application side before returning the data.

### ✅ Fix 5: Improve Performance (Limit & Lean)

```js
const posts = await Posts.find().sort({ created: -1 }).limit(100).lean();
```

- **Explanation:** Using `.lean()` reduces memory consumption by returning plain JavaScript objects instead of full Mongoose documents, while `.limit(100)` ensures only a manageable number of posts are returned.

---

## 3. Plain-English Summary

### Why are there duplicates?

- The database allows posts with the same content (e.g., same `slug` or `title`) because there are no constraints to enforce uniqueness.

### Why does it hang sometimes?

- If any part of the operation fails (e.g., database connectivity issues), the server doesn't respond. A proper try/catch block ensures the client always gets a response.

### What fixes it?

- **Error handling:** Catch exceptions to avoid server hangs.
- **Deduplication:** Use MongoDB aggregation to ensure only unique posts are returned.
- **Schema-level prevention:** Add unique constraints to fields like `slug` to prevent future duplicates.
- **Sorting:** Always sort data inside the database, not in memory, for better performance.
- **Pagination/limits:** Fetch only a subset of posts to optimize performance and prevent crashes.

---

## ✅ Recommended Final Version of `getSortedPosts()`

```js
async function getSortedPosts(req, res) {
  const posts = await Posts.aggregate([
    { $sort: { created: -1 } }, // Sort by creation date, most recent first
    {
      $group: {
        _id: "$slug", // Deduplicate by slug
        doc: { $first: "$$ROOT" }, // Keep only the most recent post
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
    { $limit: 10 }, // Limit to 10 posts for performance
  ]);
  res.json(posts);
}
```

- **Explanation:** This version ensures efficient sorting, deduplication, and performance optimization, along with proper error handling.
