import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, Calendar, User } from 'lucide-react';
import { fetchCommentsForCard } from '../../store/slices/commentSlice';
import CommentSection from './CommentSection';

const CardModal = ({ card, listTitle, onClose, canEdit }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch comments when modal opens
    if (card._id) {
      dispatch(fetchCommentsForCard(card._id));
    }
  }, [dispatch, card._id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
            <p className="text-sm text-gray-500 mt-1">in list "{listTitle}"</p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Card Details */}
        <div className="p-6 space-y-6">
          {/* Card Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>Created: {formatDate(card.createdAt)}</span>
            </div>
            {card.updatedAt !== card.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>Updated: {formatDate(card.updatedAt)}</span>
              </div>
            )}
            {card.createdBy && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span>Created by: {card.createdBy.name || card.createdBy.username || 'Unknown'}</span>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">💬</span>
              </div>
              <h3 className="font-medium text-gray-900">Comments</h3>
            </div>
            <CommentSection cardId={card._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;