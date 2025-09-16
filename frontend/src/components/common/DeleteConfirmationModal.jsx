import { X, Trash2, AlertTriangle } from 'lucide-react';

/**
 * Reusable delete confirmation modal component
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to call when closing the modal
 * @param {function} onConfirm - Function to call when confirming deletion
 * @param {string} title - Modal title (e.g., "Delete Board", "Delete List")
 * @param {string} itemName - Name of the item being deleted
 * @param {string} itemType - Type of item being deleted ("board", "list", etc.)
 * @param {string} warningText - Custom warning text (optional)
 * @param {string} confirmButtonText - Custom confirm button text (optional)
 */
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Item",
  itemName,
  itemType = "item",
  warningText,
  confirmButtonText
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Default warning text based on item type
  const getDefaultWarningText = () => {
    switch (itemType) {
      case 'board':
        return 'This will permanently delete the board, all its lists, cards, and associated data.';
      case 'list':
        return 'This will permanently delete the list and all cards within it.';
      default:
        return 'This action will permanently delete this item and cannot be undone.';
    }
  };

  // Default confirm button text based on item type
  const getDefaultConfirmText = () => {
    switch (itemType) {
      case 'board':
        return 'Delete Board';
      case 'list':
        return 'Delete List';
      default:
        return 'Delete';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-accent-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-accent-400 hover:text-accent-600 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-accent-700 mb-4">
            Are you sure you want to delete {itemName ? (
              <span className="font-semibold">"{itemName}"</span>
            ) : (
              `this ${itemType}`
            )}?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">This action cannot be undone</p>
                <p className="text-sm text-red-700">
                  {warningText || getDefaultWarningText()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-accent-50 border-t border-accent-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-accent-700 bg-white border border-accent-300 rounded-lg hover:bg-accent-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>{confirmButtonText || getDefaultConfirmText()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;