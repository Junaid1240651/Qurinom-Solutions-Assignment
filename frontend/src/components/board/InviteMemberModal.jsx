import { useState } from 'react';
import { X, Mail, UserPlus } from 'lucide-react';

const InviteMemberModal = ({ onClose, onSubmit, boardTitle }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'editor'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const roleOptions = [
    { 
      value: 'viewer', 
      label: 'Viewer', 
      description: 'Can view and comment on cards' 
    },
    { 
      value: 'editor', 
      label: 'Editor', 
      description: 'Can create and edit cards and lists' 
    },
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Can manage board settings and members' 
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      // Reset form on success
      setFormData({ email: '', role: 'editor' });
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
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent-200">
          <div>
            <h2 className="text-xl font-semibold text-accent-900">Invite to Board</h2>
            <p className="text-sm text-accent-600 mt-1">{boardTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-accent-400 hover:text-accent-600 hover:bg-accent-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-accent-700">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-accent-300'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-accent-700">
              Role
            </label>
            <div className="space-y-2">
              {roleOptions.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={formData.role === option.value}
                    onChange={handleInputChange}
                    className="mt-1 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-accent-900">{option.label}</div>
                    <div className="text-xs text-accent-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-accent-700 bg-accent-100 hover:bg-accent-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.email.trim()}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;