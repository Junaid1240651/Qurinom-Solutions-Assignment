import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment, fetchCommentsForCard } from '../../store/slices/commentSlice';
import { showSuccess, showError } from '../../utils/toast';

const CommentSection = ({ cardId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { commentsByCard, isLoading } = useSelector((state) => state.comments);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comments = commentsByCard[cardId] || [];

  // Fetch comments when component mounts or cardId changes
  useEffect(() => {
    if (cardId && (!comments.length || comments.length === 0)) {
      dispatch(fetchCommentsForCard(cardId));
    }
  }, [dispatch, cardId, comments.length]);

  // Fetch comments when component mounts or cardId changes
  useEffect(() => {
    if (cardId) {
      dispatch(fetchCommentsForCard(cardId));
    }
  }, [dispatch, cardId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      showError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(addComment({
        cardId,
        text: newComment.trim()
      })).unwrap();
      
      setNewComment('');
      showSuccess('Comment added successfully');
    } catch (error) {
      showError(error.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              disabled={isSubmitting}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {comment.author?.name?.charAt(0)?.toUpperCase() || 
                 comment.author?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {comment.author?.name || comment.author?.username || 'Unknown User'}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;