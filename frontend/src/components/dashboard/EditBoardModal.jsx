import { useState, useEffect } from 'react';
import { X, Edit2, Palette } from 'lucide-react';

const EditBoardModal = ({ isOpen, onClose, onSubmit, board }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState('#0079bf');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined background options
  const backgroundOptions = [
    '#0079bf', // Blue
    '#d29034', // Orange
    '#519839', // Green
    '#b04632', // Red
    '#89609e', // Purple
    '#cd5a91', // Pink
    '#4bbf6b', // Light Green
    '#00aecc', // Cyan
    '#838c91', // Gray
  ];

  useEffect(() => {
    if (board) {
      setTitle(board.title || '');
      setDescription(board.description || '');
      setBackground(board.background || '#0079bf');
    }
  }, [board]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        background
      });
      onClose();
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Edit2 className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-accent-900">Edit Board</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-accent-400 hover:text-accent-600 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Board Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-accent-700 mb-2">
              Board Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-accent-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter board title..."
              maxLength={100}
              required
              autoFocus
            />
          </div>

          {/* Board Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-accent-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-accent-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Enter board description..."
              maxLength={500}
            />
          </div>

          {/* Background Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-accent-700 mb-3">
              <Palette className="h-4 w-4 inline mr-1" />
              Background Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {backgroundOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBackground(color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    background === color 
                      ? 'border-accent-900 scale-110' 
                      : 'border-accent-200 hover:border-accent-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-accent-700 bg-white border border-accent-300 rounded-lg hover:bg-accent-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  <span>Update Board</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBoardModal;