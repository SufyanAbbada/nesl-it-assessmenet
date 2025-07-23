import { memo } from 'react';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import './PostItem.css';

const PostItem = memo(({ post, onDelete }) => {
  const { user } = useAuth();

  const canDelete = user && (user.role === 'admin');

  const handleDelete = async () => {
    toast((t) => (
      <div className="toast-confirmation">
        <div className="toast-message">
          <strong>Delete Post?</strong>
          <p>This action cannot be undone.</p>
        </div>
        <div className="toast-actions">
          <button
            className="toast-button toast-button-cancel"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="toast-button toast-button-confirm"
            onClick={async () => {
              toast.dismiss(t.id);
              await onDelete(post._id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: 'white',
        color: '#1f2937',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <article className="post-item">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.author.charAt(0).toUpperCase()}
          </div>
          <div className="author-info">
            <span className="author-name">{post.author}</span>
            <span className="post-date">{formatDate(post.created)}</span>
          </div>
        </div>
        {canDelete && (
          <button
            className="delete-button"
            onClick={handleDelete}
            title={user?.role === 'admin' ? 'Delete post (Admin)' : 'Delete your post'}
          >
            ×
          </button>
        )}
      </div>

      <div className="post-content">
        {post.content}
      </div>
    </article>
  );
});

PostItem.displayName = 'PostItem';

export default PostItem;

PostItem.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    created: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};