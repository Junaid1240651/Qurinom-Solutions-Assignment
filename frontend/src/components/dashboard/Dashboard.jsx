import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  Users,
  Settings,
  LogOut,
  MoreHorizontal
} from 'lucide-react';
import {
  fetchBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  toggleBoardStar,
  setSearchQuery,
  setFilterBy,
  clearError
} from '../../store/slices/boardSlice';
import { logoutUser } from '../../store/slices/authSlice';
import BoardCard from './BoardCard';
import CreateBoardModal from './CreateBoardModal';
import { DeleteConfirmationModal } from '../common';
import EditBoardModal from './EditBoardModal';
import Header from './Header';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { boards, loading, error, searchQuery, filterBy } = useSelector((state) => state.boards);

  const [viewMode, setViewMode] = useState('list'); // list or grid
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState(null);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleCreateBoard = async (boardData) => {
    try {
      await dispatch(createBoard(boardData)).unwrap();
      setShowCreateModal(false);
    } catch (error) {
      // Error is handled by Redux state
    }
  };

  const handleDeleteBoard = (boardId) => {
    const board = boards.find(b => (b.id || b._id) === boardId);
    setBoardToDelete(board);
    setShowDeleteModal(true);
  };

  const confirmDeleteBoard = async () => {
    if (boardToDelete) {
      try {
        await dispatch(deleteBoard(boardToDelete.id || boardToDelete._id)).unwrap();
        setShowDeleteModal(false);
        setBoardToDelete(null);
      } catch (error) {
        alert('Failed to delete board. Please try again.');
      }
    }
  };

  const cancelDeleteBoard = () => {
    setShowDeleteModal(false);
    setBoardToDelete(null);
  };

  const handleEditBoard = (boardId) => {
    const board = boards.find(b => (b.id || b._id) === boardId);
    setBoardToEdit(board);
    setShowEditModal(true);
  };

  const handleUpdateBoard = async (boardData) => {
    if (boardToEdit) {
      try {
        await dispatch(updateBoard({
          boardId: boardToEdit.id || boardToEdit._id,
          boardData
        })).unwrap();
        setShowEditModal(false);
        setBoardToEdit(null);
      } catch (error) {
        throw error; // Re-throw to let the modal handle the error
      }
    }
  };

  const cancelEditBoard = () => {
    setShowEditModal(false);
    setBoardToEdit(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      // Error is handled by auth state
    }
  };

  const handleBoardClick = (boardId) => {
    if (boardId) {
      navigate(`/board/${boardId}`);
    }
  };

  const handleSearch = (query) => {
    dispatch(setSearchQuery(query));
  };

  const handleFilterChange = (filter) => {
    dispatch(setFilterBy(filter));
  };

  const handleStarBoard = async (boardId, isStarred) => {
    try {
      await dispatch(toggleBoardStar({ boardId, isStarred })).unwrap();
    } catch (error) {
      // Error is handled by Redux state
    }
  };

  const handleShareBoard = (boardId) => {
    // Create shareable link
    const shareUrl = `${window.location.origin}/board/${boardId}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Check out this board',
        text: 'I wanted to share this board with you',
        url: shareUrl,
      }).catch((error) => {
        // Fallback to clipboard
        copyToClipboard(shareUrl);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Board link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Board link copied to clipboard!');
    }
  };

  const handleCopyBoard = (boardId) => {
    // Create board link URL
    const boardUrl = `${window.location.origin}/board/${boardId}`;
    
    // Copy the board link to clipboard
    copyToClipboard(boardUrl);
  };

  // Filter boards based on search query and filter
  const filteredBoards = boards.filter(board => {
    const matchesSearch = board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchQuery.toLowerCase());

    switch (filterBy) {
      case 'recent':
        // Show boards updated in last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesSearch && new Date(board.updatedAt) > weekAgo;
      case 'starred':
        return matchesSearch && board.isStarred;
      default:
        return matchesSearch;
    }
  });

  const recentBoards = boards
    .filter(board => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(board.updatedAt) > weekAgo;
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-accent-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-accent-600">
            Manage your projects and stay organized with your task boards.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-accent-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Grid className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-accent-600">Total Boards</p>
                <p className="text-2xl font-bold text-accent-900">{boards.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-accent-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-accent-600">Recent Activity</p>
                <p className="text-2xl font-bold text-accent-900">{recentBoards.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-accent-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-accent-600">Starred</p>
                <p className="text-2xl font-bold text-accent-900">
                  {boards.filter(board => board.isStarred).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-accent-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-accent-600">Collaborating</p>
                <p className="text-2xl font-bold text-accent-900">
                  {boards.filter(board => board.members && board.members.length > 1).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-accent-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent-400" />
                <input
                  type="text"
                  placeholder="Search boards..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={filterBy}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="appearance-none bg-white border border-accent-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Boards</option>
                  <option value="recent">Recent</option>
                  <option value="starred">Starred</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-accent-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-accent-600 hover:text-accent-900'
                    }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-accent-600 hover:text-accent-900'
                    }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>

              {/* Create Board Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Board</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Recent Boards Section */}
        {recentBoards.length > 0 && filterBy === 'all' && !searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-accent-900 mb-4">Recently Active</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentBoards.map((board) => (
                <BoardCard
                  key={board.id || board._id}
                  board={board}
                  onClick={handleBoardClick}
                  onDelete={handleDeleteBoard}
                  onEdit={handleEditBoard}
                  onStar={handleStarBoard}
                  onShare={handleShareBoard}
                  onCopy={handleCopyBoard}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Boards Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-accent-900">
              {searchQuery ? `Search Results (${filteredBoards.length})` :
                filterBy === 'all' ? 'All Boards' :
                  filterBy === 'recent' ? 'Recent Boards' : 'Starred Boards'}
            </h2>
            {filteredBoards.length > 0 && (
              <p className="text-sm text-accent-600">
                {filteredBoards.length} board{filteredBoards.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredBoards.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-accent-100 rounded-full flex items-center justify-center mb-4">
                <Grid className="h-12 w-12 text-accent-400" />
              </div>
              <h3 className="text-lg font-medium text-accent-900 mb-2">
                {searchQuery ? 'No boards found' : 'No boards yet'}
              </h3>
              <p className="text-accent-600 mb-6">
                {searchQuery
                  ? 'Try adjusting your search terms or filters'
                  : 'Create your first board to get started with organizing your tasks'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Board
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredBoards.map((board) => (
                <BoardCard
                  key={board.id || board._id}
                  board={board}
                  onClick={handleBoardClick}
                  onDelete={handleDeleteBoard}
                  onEdit={handleEditBoard}
                  onStar={handleStarBoard}
                  onShare={handleShareBoard}
                  onCopy={handleCopyBoard}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBoard}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && boardToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={cancelDeleteBoard}
          onConfirm={confirmDeleteBoard}
          title="Delete Board"
          itemName={boardToDelete.title}
          itemType="board"
        />
      )}

      {/* Edit Board Modal */}
      {showEditModal && boardToEdit && (
        <EditBoardModal
          isOpen={showEditModal}
          onClose={cancelEditBoard}
          onSubmit={handleUpdateBoard}
          board={boardToEdit}
        />
      )}
    </div>
  );
};

export default Dashboard;
