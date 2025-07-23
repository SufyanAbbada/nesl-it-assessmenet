import PostItem from "./PostItem";
import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { Toaster } from "react-hot-toast";
import "./Feed.css";

const Feed = () => {
  const { user, logout } = useAuth();
  const { posts, loading, error, hasMore, loadMore, refresh, deletePost } =
    useInfiniteScroll();
  const observerRef = useRef();
  const loadingRef = useRef();

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="feed-container">
        <Toaster position="top-right" />
        <div className="error-state">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={refresh} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <Toaster position="top-right" />
      <header className="feed-header">
        <div className="header-content">
          <h1>Feed</h1>
          <div className="header-actions">
            <span className="welcome-text">
              Welcome, {user?.id}
              {user?.role === "admin" && (
                <span className="role-badge">Admin</span>
              )}
            </span>
            <button
              onClick={refresh}
              disabled={loading}
              className="refresh-button"
            >
              {loading ? "Refreshing" : "Refresh"}
            </button>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="feed-content">
        {posts.length === 0 && !loading ? (
          <div className="empty-state">
            <h2>No posts yet</h2>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post, index) => (
              <div
                key={post._id}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
              >
                <PostItem post={post} onDelete={deletePost} />
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="loading-indicator" ref={loadingRef}>
            <div className="loading-spinner"></div>
            <span>Loading posts...</span>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="end-message">
            <p>You&apos;ve reached the end of the feed.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
