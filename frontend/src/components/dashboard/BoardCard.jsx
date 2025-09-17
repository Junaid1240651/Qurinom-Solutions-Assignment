import { useState, useEffect, useRef } from 'react';
import {
  Star,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Share,
  Clock,
  List,
  CheckSquare,
  Copy
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BoardCard = ({ board, onClick, onDelete, onEdit, onStar, onShare, onCopy, viewMode = 'grid', compact = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isStarred, setIsStarred] = useState(board.isStarred || false);
  const cardRef = useRef(null);

  // Sync local state with board prop when it changes
  useEffect(() => {
    setIsStarred(board.isStarred || false);
  }, [board.isStarred]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const handleCardClick = () => {
    const boardId = board.id || board._id;
    if (onClick && boardId) {
      onClick(boardId);
    }
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    setIsStarred(!isStarred);
    if (onStar) {
      onStar(board.id || board._id, !isStarred);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(board.id || board._id);
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onShare) {
      onShare(board.id || board._id);
    }
  };

  const handleCopyClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onCopy) {
      onCopy(board.id || board._id);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) {
      onEdit(board.id || board._id);
    }
  };

  const getBackgroundStyle = () => {
    if (board.background) {
      if (board.background.startsWith('#')) {
        return { backgroundColor: board.background };
      } else if (board.background.startsWith('http')) {
        return {
          backgroundImage: `url(${board.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
    }
    return { backgroundColor: '#0079bf' };
  };

  const memberCount = board.members?.length || 0;
  const listCount = board.lists?.length || 0;
  const cardCount = board.lists?.reduce((total, list) => total + (list.cards?.length || 0), 0) || 0;

  if (viewMode === 'list') {
    return (
      <div
        ref={cardRef}
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-sm border border-accent-200 hover:shadow-md transition-all duration-200 cursor-pointer p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Board Preview */}
            <div
              className="w-12 h-8 rounded-md flex-shrink-0"
              style={getBackgroundStyle()}
            />

            {/* Board Info */}
            <div className="flex-1 min-w-0">
              <div className="flex  items-center space-x-2">
                <h3 className="text-lg font-semibold text-accent-900 truncate">
                  {board.title}
                </h3>
                {isStarred && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                )}
              </div>
              {board.description && (
                <p className="text-sm text-accent-600 truncate mt-1">
                  {board.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center space-x-6 text-sm text-accent-600">
              <div className="flex items-center space-x-1">
                <List className="h-4 w-4" />
                <span>{listCount} lists</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckSquare className="h-4 w-4" />
                <span>{cardCount} cards</span>
              </div>
              {memberCount > 1 && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{memberCount} members</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStarClick}
              className={`p-1 rounded-md transition-colors ${isStarred
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-accent-400 hover:text-yellow-500'
                }`}
            >
              <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="p-1 text-accent-400 hover:text-accent-600 rounded-md transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-accent-200 py-2 z-50">
                  <button
                    onClick={handleShareClick}
                    className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2"
                  >
                    <Share className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={handleEditClick}
                    className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleCopyClick}
                    className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view - matching stats card styling
  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl shadow-sm border border-accent-100 hover:shadow-md transition-all duration-200 cursor-pointer p-6 pb-4"
    >
      {/* Header with Menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div
            className="p-2 bg-gray-100 rounded-lg mr-4 flex-shrink-0"
          >
            <div
              className="w-6 h-6 rounded relative overflow-hidden"
            >
              <div
                className="absolute inset-0 w-full h-1/2"
                style={getBackgroundStyle()}
              />
              <div className="absolute bottom-0 w-full h-1/2 bg-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-accent-900 truncate text-sm">
              {board.title}
            </h3>
            <p className="text-xs text-accent-600 mt-1">
              {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleStarClick}
            className={`p-1 rounded-md transition-colors ${isStarred
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-accent-400 hover:text-yellow-500'
              }`}
          >
            <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-1 text-accent-400 hover:text-accent-600 rounded-md transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-accent-200 py-2 z-50">
                <button
                  onClick={handleShareClick}
                  className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2"
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleEditClick}
                  className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleCopyClick}
                  className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section - matching the dashboard stats cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-accent-600">
              <List className="h-4 w-4" />
              <span>{listCount}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-accent-600">
              <CheckSquare className="h-4 w-4" />
              <span>{cardCount}</span>
            </div>
          </div>
          {memberCount > 1 && (
            <div className="flex items-center space-x-1 text-sm text-accent-600">
              <Users className="h-4 w-4" />
              <span>{memberCount}</span>
            </div>
          )}
        </div>

        {/* Description if available and not compact */}
        {!compact && board.description && (
          <p className="text-xs text-accent-500 line-clamp-2">
            {board.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default BoardCard;