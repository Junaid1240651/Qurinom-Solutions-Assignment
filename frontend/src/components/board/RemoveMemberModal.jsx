import { X, UserMinus, AlertTriangle } from 'lucide-react';

const RemoveMemberModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  memberName, 
  memberEmail,
  loading = false 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-accent-900">Remove Member</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-accent-400 hover:text-accent-600 hover:bg-accent-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            {/* Member Avatar */}
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-semibold text-red-600">
                {memberName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            
            {/* Confirmation Message */}
            <h3 className="text-lg font-semibold text-accent-900 mb-2">
              Are you sure you want to remove {memberName} from this board?
            </h3>
            
            <p className="text-sm text-accent-600 mb-4">
              {memberEmail}
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-red-900 mb-2">This action will:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Remove their access to this board immediately</li>
                <li>• Remove them from any assigned cards</li>
                <li>• They won't be able to view or edit this board</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-accent-700 bg-accent-100 hover:bg-accent-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserMinus className="h-4 w-4" />
                  Remove Member
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveMemberModal;