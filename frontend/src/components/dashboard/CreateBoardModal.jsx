import { useState } from 'react';
import { X } from 'lucide-react';

const CreateBoardModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background: '#0079bf',
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const backgroundOptions = [
    { type: 'color', value: '#0079bf', name: 'Blue' },
    { type: 'color', value: '#d29034', name: 'Orange' },
    { type: 'color', value: '#519839', name: 'Green' },
    { type: 'color', value: '#b04632', name: 'Red' },
    { type: 'color', value: '#89609e', name: 'Purple' },
    { type: 'color', value: '#cd5a91', name: 'Pink' },
    { type: 'color', value: '#4bbf6b', name: 'Lime' },
    { type: 'color', value: '#00aecc', name: 'Sky' },
    { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Purple Gradient' },
    { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Pink Gradient' },
    { type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Blue Gradient' },
    { type: 'gradient', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Green Gradient' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBackgroundSelect = (background) => {
    setFormData(prev => ({ ...prev, background }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Board title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-accent-900">Create Board</h2>
          <button
            onClick={onClose}
            className="p-2 text-accent-400 hover:text-accent-600 hover:bg-accent-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Board Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-accent-700">
              Board Preview
            </label>
            <div
              className="w-full h-24 rounded-lg flex items-center justify-center text-white font-medium shadow-sm"
              style={{ 
                background: formData.background.startsWith('linear-gradient') 
                  ? formData.background 
                  : formData.background 
              }}
            >
              {formData.title || 'Board Title'}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-accent-700">
              Board Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Website Redesign Project"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-accent-300'
              }`}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
            <p className="text-xs text-accent-500">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-accent-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What's this board about?"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-300' : 'border-accent-300'
              }`}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-accent-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Background Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-accent-700">
              Background
            </label>
            <div className="grid grid-cols-4 gap-2">
              {backgroundOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleBackgroundSelect(option.value)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    formData.background === option.value
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-accent-200 hover:border-accent-300'
                  }`}
                  style={{ 
                    background: option.value.startsWith('linear-gradient') 
                      ? option.value 
                      : option.value 
                  }}
                  title={option.name}
                />
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-accent-700">
              Privacy
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="isPrivate"
                  value={false}
                  checked={!formData.isPrivate}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: false }))}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="text-sm font-medium text-accent-900">Team</div>
                  <div className="text-xs text-accent-600">
                    Anyone in your workspace can see and edit this board
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="isPrivate"
                  value={true}
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: true }))}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="text-sm font-medium text-accent-900">Private</div>
                  <div className="text-xs text-accent-600">
                    Only you and invited members can see this board
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-accent-700 bg-accent-100 hover:bg-accent-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              ) : (
                'Create Board'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;