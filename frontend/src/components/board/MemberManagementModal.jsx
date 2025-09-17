import { useState } from 'react';
import { X, Users, Crown, Shield, Eye, UserMinus, Mail, UserPlus } from 'lucide-react';
import RemoveMemberModal from './RemoveMemberModal';

const MemberManagementModal = ({ 
  onClose, 
  onRemoveMember, 
  onInviteMember, 
  board, 
  currentUserId 
}) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'editor' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);

  const roleIcons = {
    admin: <Shield className="h-4 w-4 text-blue-600" />,
    editor: <Eye className="h-4 w-4 text-green-600" />,
    viewer: <Eye className="h-4 w-4 text-gray-600" />
  };

  const roleLabels = {
    admin: 'Admin',
    editor: 'Editor', 
    viewer: 'Viewer'
  };

  const handleInviteInputChange = (e) => {
    const { name, value } = e.target;
    setInviteData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateInviteForm = () => {
    const newErrors = {};
    
    if (!inviteData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInviteForm()) return;
    
    setLoading(true);
    try {
      await onInviteMember(inviteData);
      setInviteData({ email: '', role: 'editor' });
      setShowInviteForm(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMemberClick = (member) => {
    const user = member.user;
    const userId = user?.id || user?._id || user;
    const userName = user?.name || 'Unknown User';
    const userEmail = user?.email || 'No email';
    
    setMemberToRemove({
      id: userId,
      name: userName,
      email: userEmail
    });
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    setRemovingMember(true);
    try {
      await onRemoveMember(memberToRemove.id);
      setMemberToRemove(null);
    } catch (error) {
      // Error handled by parent
    } finally {
      setRemovingMember(false);
    }
  };

  const handleCancelRemoveMember = () => {
    setMemberToRemove(null);
  };

  const isOwner = (member) => {
    const memberId = member.user?.id || member.user?._id || member.user;
    const ownerId = board.owner?.id || board.owner?._id || board.owner;
    return memberId.toString() === ownerId.toString();
  };

  const getCurrentUserRole = () => {
    const ownerId = board.owner?.id || board.owner?._id || board.owner;
    const isOwner = currentUserId.toString() === ownerId.toString();
    
    if (isOwner) return 'owner';
    
    const currentUserMember = board.members?.find(m => {
      const mId = m.user?.id || m.user?._id || m.user;
      return mId.toString() === currentUserId.toString();
    });
    
    return currentUserMember?.role || 'viewer';
  };

  const canInviteMembers = () => {
    const userRole = getCurrentUserRole();
    return userRole === 'owner' || userRole === 'admin';
  };

  const canRemoveMember = (member) => {
    const memberId = member.user?.id || member.user?._id || member.user;
    const ownerId = board.owner?.id || board.owner?._id || board.owner;
    
    // Can't remove owner
    if (memberId.toString() === ownerId.toString()) return false;
    
    // Can't remove yourself if you're not the owner
    if (memberId.toString() === currentUserId.toString() && currentUserId.toString() !== ownerId.toString()) return false;
    
    // Only owner and admins can remove members
    const userRole = getCurrentUserRole();
    return userRole === 'owner' || userRole === 'admin';
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
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent-200">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-accent-900">Board Members</h2>
              <p className="text-sm text-accent-600">{board.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-accent-400 hover:text-accent-600 hover:bg-accent-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Invite New Member Section - Only for Admins and Owners */}
          {canInviteMembers() ? (
            <div className="mb-6">
              {!showInviteForm ? (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </button>
              ) : (
              <div className="bg-accent-50 rounded-lg p-4 border border-accent-200">
                <h3 className="text-sm font-medium text-accent-900 mb-3">Invite New Member</h3>
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent-400" />
                      <input
                        type="email"
                        name="email"
                        value={inviteData.email}
                        onChange={handleInviteInputChange}
                        placeholder="Enter email address"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.email ? 'border-red-300' : 'border-accent-300'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <select
                      name="role"
                      value={inviteData.role}
                      onChange={handleInviteInputChange}
                      className="w-full px-3 py-2 border border-accent-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="viewer">Viewer - Can view and comment</option>
                      <option value="editor">Editor - Can create and edit</option>
                      <option value="admin">Admin - Can manage board</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Sending...' : 'Send Invite'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteData({ email: '', role: 'editor' });
                        setErrors({});
                      }}
                      className="px-4 py-2 text-accent-600 hover:bg-accent-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-accent-50 border border-accent-200 rounded-lg">
              <div className="flex items-center gap-2 text-accent-600">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Only board admins and owners can invite new members
                </span>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-accent-900 mb-3">
              Members ({board.members?.length || 0})
            </h3>
            
            {board.members?.map((member, index) => {
              const user = member.user;
              const userId = user?.id || user?._id || user;
              const userName = user?.name || 'Unknown User';
              const userEmail = user?.email || 'No email';
              const memberRole = member.role || 'editor';
              
              return (
                <div key={userId || index} className="flex items-center justify-between p-4 bg-accent-50 rounded-lg border border-accent-200">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-accent-900">{userName}</span>
                        {isOwner(member) && (
                          <Crown className="h-4 w-4 text-yellow-500" title="Board Owner" />
                        )}
                      </div>
                      <p className="text-sm text-accent-600">{userEmail}</p>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-accent-200">
                      {roleIcons[memberRole]}
                      <span className="text-sm font-medium text-accent-700">
                        {roleLabels[memberRole]}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {canRemoveMember(member) && (
                      <button
                        onClick={() => handleRemoveMemberClick(member)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {(!board.members || board.members.length === 0) && (
              <div className="text-center py-8 text-accent-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No members found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Member Confirmation Modal */}
      <RemoveMemberModal
        isOpen={!!memberToRemove}
        onClose={handleCancelRemoveMember}
        onConfirm={handleConfirmRemoveMember}
        memberName={memberToRemove?.name}
        memberEmail={memberToRemove?.email}
        loading={removingMember}
      />
    </div>
  );
};

export default MemberManagementModal;