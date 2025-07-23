import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/useAuth";

export const useInfiniteScroll = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_LIMIT = 10;

  const loadPosts = useCallback(
    async (pageNum = 0, reset = false) => {
      if (loading || (!hasMore && !reset)) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/feed?skip=${
            pageNum * PAGE_LIMIT
          }&limit=10`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to load posts");
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newPosts = await response.json();

        if (reset) {
          setPosts(newPosts);
          if (newPosts.length > 0) {
            toast.success("Feed refreshed");
          }
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setHasMore(newPosts.length === 10);
        setPage(pageNum);
      } catch (err) {
        setError(err.message);
        if (!reset) {
          toast.error("Failed to load more posts");
        }
      } finally {
        setLoading(false);
      }
    },
    [token, loading, hasMore]
  );

  const loadMore = useCallback(() => {
    loadPosts(page + 1);
  }, [loadPosts, page]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    loadPosts(0, true);
  }, [loadPosts]);

  const deletePost = useCallback(
    async (postId) => {
      const loadingToast = toast.loading("Deleting post...");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setPosts((prev) => prev.filter((post) => post._id !== postId));
          toast.dismiss(loadingToast);
          toast.success("Post deleted successfully");
          return { success: true };
        } else {
          toast.dismiss(loadingToast);
          toast.error("Failed to delete post");
          return { success: false, error: "Delete failed" };
        }
      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("Failed to delete post");
        return { success: false, error: err.message };
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      loadPosts(0, true);
    }
  }, [token]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    deletePost,
  };
};
