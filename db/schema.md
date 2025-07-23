# Part 1: MongoDB Aggregation & Data Modeling

---

## Question 1: Design your collection schemas

**Requirement:**  
Design your collection schemas (briefly, in 5–7 lines) so that:

- You can list each user’s followers (and who they follow) efficiently.
- You can page through posts in reverse-chronological order.

**Solution:**

```js
// Users
{
  _id: ObjectId,
  name: String,
  joined: ISODate
}

// Followers and Following
{
  follower: ObjectId,
  following: ObjectId
}

// Posts
{
  _id: ObjectId,
  author: ObjectId,
  content: String,
  created: ISODate
}
```

✅ This schema allows efficient lookup of followers and followings using the `follows` collection and indexed queries.  
✅ Posts can be paginated in reverse-chronological order by sorting on the `created` field with an index.

---

## Question 2: Aggregation pipeline - 10 most recent posts from followings

**Requirement:**  
Write a single aggregation pipeline that, for a given user ID, returns:

- The 10 most recent posts from that user’s followings
- Sorted newest → oldest
- Each with the post’s `content`, `created`, and the author’s `name`

**Solution:**

```js
db.follows.aggregate([
  { $match: { follower: ObjectId("u1") } },
  {
    $lookup: {
      from: "posts",
      localField: "following",
      foreignField: "author",
      as: "posts",
    },
  },
  { $unwind: "$posts" },
  {
    $lookup: {
      from: "users",
      localField: "posts.author",
      foreignField: "_id",
      as: "authorInfo",
    },
  },
  { $unwind: "$authorInfo" },
  {
    $project: {
      _id: 0,
      content: "$posts.content",
      created: "$posts.created",
      author: "$authorInfo.name",
    },
  },
  { $sort: { created: -1 } },
  { $limit: 10 },
]);
```

---

## Question 3: Indexing Strategy

**Requirement:**  
Explain in 2–3 sentences how you’d index these collections for maximum read performance.

**Solution:**  
To optimize read performance, I would add a "**compound index**" on the `posts` collection: `{ author: 1, created: -1 }`, which supports efficient filtering by author and sorting by creation time in reverse.  
The `follows` collection should have an index on `{ follower: 1 }` to quickly retrieve followings for any user.  
The `users` collection already has a default `_id` index, which enables fast lookups during `$lookup` operations in aggregations.
