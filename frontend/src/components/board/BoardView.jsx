import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  ArrowLeft,
  Star,
  Users,
  Plus,
  MoreHorizontal,
  Edit2,
  Check,
  X,
  Edit,
  Trash2,
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { fetchBoardDetails, clearCurrentBoard, updateBoard } from '../../store/slices/boardSlice';
import { createList, fetchListsByBoard, clearLists, updateList, deleteList, moveCardBetweenLists, reorderLists } from '../../store/slices/listSlice';
import { createCard, clearCards, updateCard, deleteCard, moveCard } from '../../store/slices/cardSlice';
import { DeleteConfirmationModal } from '../common';
import './BoardView.css';

const BoardView = () => {

  const { boardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBoard, loading, error } = useSelector((state) => state.boards);
  const { lists, creating: creatingList } = useSelector((state) => state.lists);
  const { creating: creatingCard } = useSelector((state) => state.cards);

  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editListTitle, setEditListTitle] = useState('');
  const [showListMenu, setShowListMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddCard, setShowAddCard] = useState(null); // Store list ID for which card is being added
  const [newCardTitle, setNewCardTitle] = useState('');
  const [editingCardId, setEditingCardId] = useState(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [showCardMenu, setShowCardMenu] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fetchedBoardId = useRef(null);
  const titleInputRef = useRef(null);
  const addListInputRef = useRef(null);
  const editListInputRef = useRef(null);
  const addCardInputRef = useRef(null);
  const editCardInputRef = useRef(null);

  useEffect(() => {
    // Check if boardId exists and is valid
    if (!boardId || boardId === 'undefined') {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Only fetch if we haven't already fetched this board
    if (fetchedBoardId.current !== boardId) {
      fetchedBoardId.current = boardId;
      dispatch(fetchBoardDetails(boardId));
    }

    // Cleanup when component unmounts
    return () => {
      dispatch(clearCurrentBoard());
      dispatch(clearLists());
      dispatch(clearCards());
      fetchedBoardId.current = null;
    };
  }, [boardId, dispatch, navigate]);

  // Fetch lists when board changes
  useEffect(() => {
    if (currentBoard && boardId) {
      dispatch(fetchListsByBoard(boardId));
    }
  }, [currentBoard, boardId, dispatch]);

  useEffect(() => {
    if (currentBoard) {
      setIsStarred(currentBoard.isStarred || false);
      setEditTitle(currentBoard.title || '');
    }
  }, [currentBoard]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Focus add list input when it opens
  useEffect(() => {
    if (showAddList && addListInputRef.current) {
      addListInputRef.current.focus();
    }
  }, [showAddList]);

  // Focus edit list input when editing starts
  useEffect(() => {
    if (editingListId && editListInputRef.current) {
      editListInputRef.current.focus();
      editListInputRef.current.select();
    }
  }, [editingListId]);

  // Focus add card input when it opens
  useEffect(() => {
    if (showAddCard && addCardInputRef.current) {
      addCardInputRef.current.focus();
    }
  }, [showAddCard]);

  // Focus edit card input when editing starts
  useEffect(() => {
    if (editingCardId && editCardInputRef.current) {
      editCardInputRef.current.focus();
      editCardInputRef.current.select();
    }
  }, [editingCardId]);

  // Close list menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showListMenu && !event.target.closest('.list-menu-container')) {
        setShowListMenu(null);
      }
    };

    if (showListMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showListMenu]);

  // Close card menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCardMenu && !event.target.closest('.card-menu-container')) {
        setShowCardMenu(null);
      }
    };

    if (showCardMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCardMenu]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showProfileMenu]);

  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleStarBoard = useCallback(() => {
    setIsStarred(!isStarred);
    // TODO: Implement star/unstar API call
  }, [isStarred]);

  const handleInviteMembers = useCallback(() => {
    // TODO: Implement invite members modal
  }, []);

  const handleBoardSettings = useCallback(() => {
    // TODO: Implement board settings modal
  }, []);

  const handleStartEditTitle = useCallback(() => {
    setIsEditingTitle(true);
    setEditTitle(currentBoard?.title || '');
  }, [currentBoard?.title]);

  const handleSaveTitle = useCallback(async () => {
    if (editTitle.trim() && editTitle.trim() !== currentBoard?.title) {
      try {
        const boardId = currentBoard.id || currentBoard._id;

        if (!boardId) {
          setIsEditingTitle(false);
          return;
        }

        await dispatch(updateBoard({
          boardId: boardId,
          boardData: { title: editTitle.trim() }
        })).unwrap();
      } catch (error) {
        // Reset to original title on error
        setEditTitle(currentBoard?.title || '');
      }
    }
    setIsEditingTitle(false);
  }, [dispatch, editTitle, currentBoard]);

  const handleCancelEditTitle = useCallback(() => {
    setIsEditingTitle(false);
    setEditTitle(currentBoard?.title || '');
  }, [currentBoard?.title]);

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEditTitle();
    }
  }, [handleSaveTitle, handleCancelEditTitle]);

  // Add List handlers
  const handleShowAddList = useCallback(() => {
    setShowAddList(true);
    setNewListTitle('');
  }, []);

  const handleHideAddList = useCallback(() => {
    setShowAddList(false);
    setNewListTitle('');
  }, []);

  const handleCreateList = useCallback(async () => {
    if (!newListTitle.trim() || !boardId) return;

    try {
      await dispatch(createList({
        title: newListTitle.trim(),
        board: boardId
      })).unwrap();
      setNewListTitle('');
      setShowAddList(false);
    } catch (error) {
      // Error is handled by Redux state
    }
  }, [dispatch, newListTitle, boardId]);

  const handleAddListKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleCreateList();
    } else if (e.key === 'Escape') {
      handleHideAddList();
    }
  }, [handleCreateList, handleHideAddList]);

  // List menu handlers
  const handleListMenuClick = useCallback((listId, e) => {
    e.stopPropagation();
    setShowListMenu(showListMenu === listId ? null : listId);
  }, [showListMenu]);

  const handleStartEditList = useCallback((list) => {
    setEditingListId(list.id || list._id);
    setEditListTitle(list.title);
    setShowListMenu(null);
  }, []);

  const handleSaveListEdit = useCallback(async () => {
    if (!editListTitle.trim() || !editingListId) return;

    try {
      await dispatch(updateList({
        listId: editingListId,
        listData: { title: editListTitle.trim() }
      })).unwrap();
      setEditingListId(null);
      setEditListTitle('');
    } catch (error) {
      // Error is handled by Redux state
    }
  }, [dispatch, editListTitle, editingListId]);

  const handleCancelListEdit = useCallback(() => {
    setEditingListId(null);
    setEditListTitle('');
  }, []);

  const handleEditListKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSaveListEdit();
    } else if (e.key === 'Escape') {
      handleCancelListEdit();
    }
  }, [handleSaveListEdit, handleCancelListEdit]);

  const handleShowDeleteConfirm = useCallback((listId) => {
    setShowDeleteConfirm(listId);
    setShowListMenu(null);
  }, []);

  const handleDeleteList = useCallback(async (listId) => {
    try {
      await dispatch(deleteList(listId)).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      // Error is handled by Redux state
    }
  }, [dispatch]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(null);
  }, []);

  // Card handlers
  const handleShowAddCard = useCallback((listId) => {
    setShowAddCard(listId);
    setNewCardTitle('');
  }, []);

  const handleHideAddCard = useCallback(() => {
    setShowAddCard(null);
    setNewCardTitle('');
  }, []);

  const handleCreateCard = useCallback(async () => {
    if (!newCardTitle.trim() || !showAddCard) return;

    try {
      const result = await dispatch(createCard({
        title: newCardTitle.trim(),
        list: showAddCard
      })).unwrap();

      setNewCardTitle('');
      setShowAddCard(null);
    } catch (error) {
      // Error is handled by Redux state
    }
  }, [dispatch, newCardTitle, showAddCard]);

  const handleAddCardKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleCreateCard();
    } else if (e.key === 'Escape') {
      handleHideAddCard();
    }
  }, [handleCreateCard, handleHideAddCard]);

  // Card menu handlers
  const handleCardMenuClick = useCallback((cardId, e) => {
    e.stopPropagation();
    setShowCardMenu(showCardMenu === cardId ? null : cardId);
  }, [showCardMenu]);

  const handleStartEditCard = useCallback((card) => {
    setEditingCardId(card.id || card._id);
    setEditCardTitle(card.title);
    setShowCardMenu(null);
  }, []);

  const handleSaveCardEdit = useCallback(async () => {
    if (!editCardTitle.trim() || !editingCardId) return;

    try {
      await dispatch(updateCard({
        cardId: editingCardId,
        cardData: { title: editCardTitle.trim() }
      })).unwrap();
      setEditingCardId(null);
      setEditCardTitle('');
      // Refetch lists to get updated card data
      dispatch(fetchListsByBoard(boardId));
    } catch (error) {
      // Error is handled by Redux state
    }
  }, [dispatch, editCardTitle, editingCardId, boardId]);

  const handleCancelCardEdit = useCallback(() => {
    setEditingCardId(null);
    setEditCardTitle('');
  }, []);

  const handleEditCardKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSaveCardEdit();
    } else if (e.key === 'Escape') {
      handleCancelCardEdit();
    }
  }, [handleSaveCardEdit, handleCancelCardEdit]);

  const handleShowCardDeleteConfirm = useCallback((card) => {
    setCardToDelete(card);
    setShowCardMenu(null);
  }, []);

  const handleDeleteCard = useCallback(async (cardId) => {
    try {
      await dispatch(deleteCard(cardId)).unwrap();
      setCardToDelete(null);
      // Refetch lists to get updated card data
      dispatch(fetchListsByBoard(boardId));
    } catch (error) {
      // Error is handled by Redux state
    }
  }, [dispatch, boardId]);

  const handleCancelCardDelete = useCallback(() => {
    setCardToDelete(null);
  }, []);

  // Profile menu handlers
  const handleProfileMenuClick = useCallback(() => {
    setShowProfileMenu(!showProfileMenu);
  }, [showProfileMenu]);

  const handleLogout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Navigate to login page
    navigate('/login');
  }, [navigate]);

  // Drag and drop handler
  const handleDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId, type } = result;

    // If no destination (dropped outside any droppable area), do nothing - item will snap back
    if (!destination) {
      return;
    }

    // If dropped in same position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Handle list reordering
    if (type === 'list') {

      // Optimistically reorder lists in Redux
      dispatch(reorderLists({
        sourceIndex: source.index,
        destinationIndex: destination.index
      }));

      // TODO: Add API call to persist list order on server
      return;
    }

    // Handle card movement (existing logic)
    const sourceListId = source.droppableId.replace('list-', '');
    const destinationListId = destination.droppableId.replace('list-', '');

    // Optimistically update the UI immediately
    
    dispatch(moveCardBetweenLists({
      cardId: draggableId,
      sourceListId,
      destinationListId,
      sourceIndex: source.index,
      destinationIndex: destination.index
    }));

    try {
      // Sync with server in the background
      await dispatch(moveCard({
        cardId: draggableId,
        moveData: {
          listId: destinationListId,
          position: destination.index
        }
      })).unwrap();
    } catch (error) {
      // Revert the optimistic update by refetching
      dispatch(fetchListsByBoard(boardId));
      // Could add a toast notification here for better UX
    }
  }, [dispatch, boardId]);

  // Calculate background style (must be before early returns)
  const backgroundStyle = useMemo(() => {
    if (currentBoard?.background) {
      if (currentBoard.background.startsWith('#')) {
        return { backgroundColor: currentBoard.background };
      } else if (currentBoard.background.startsWith('linear-gradient')) {
        return { background: currentBoard.background };
      } else if (currentBoard.background.startsWith('http')) {
        return {
          backgroundImage: `url(${currentBoard.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
    }
    return { backgroundColor: '#0079bf' };
  }, [currentBoard?.background]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-accent-600">Loading board...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-accent-900 mb-2">Board Not Found</h2>
          <p className="text-accent-600 mb-6">{error}</p>
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // No board data
  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-accent-600">No board data available</p>
          <button
            onClick={handleBackToDashboard}
            className="mt-4 inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      {/* Board Header */}
      <div className="bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-3">
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2">
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      onBlur={handleSaveTitle}
                      className="text-xl font-bold bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                      placeholder="Board title..."
                      maxLength={100}
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-1 text-white hover:text-green-400 transition-colors"
                      title="Save title"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEditTitle}
                      className="p-1 text-white hover:text-red-400 transition-colors"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 group cursor-pointer" onClick={handleStartEditTitle}>
                    <h1 className="text-xl font-bold text-white hover:text-yellow-100 transition-colors">
                      {currentBoard.title}
                    </h1>
                    <button
                      className="p-1 text-white opacity-70 group-hover:opacity-100 hover:text-yellow-400 transition-all"
                      title="Click to edit board title"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleStarBoard}
                  className={`p-1 rounded-md transition-colors ${isStarred
                      ? 'text-yellow-400 hover:text-yellow-300'
                      : 'text-white hover:text-yellow-400'
                    }`}
                >
                  <Star className={`h-5 w-5 ${isStarred ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Other Board Members (non-clickable) */}
              <div className="flex items-center space-x-2">
                {currentBoard.members?.slice(1, 3).map((member, index) => (
                  <div
                    key={member.user?.id || index}
                    className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-sm font-medium text-accent-900"
                    title={member.user?.name}
                  >
                    {member.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                ))}
                {currentBoard.members?.length > 3 && (
                  <div className="h-8 w-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-xs font-medium text-accent-700">
                    +{currentBoard.members.length - 3}
                  </div>
                )}
              </div>

              {/* Invite Button */}
              <button
                onClick={handleInviteMembers}
                className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg hover:bg-opacity-30 transition-colors text-sm"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Invite</span>
              </button>

              {/* User Profile */}
              {currentBoard.members?.slice(0, 1).map((member, index) => (
                <div key={member.user?.id || index} className="relative profile-menu-container">
                  <button
                    onClick={handleProfileMenuClick}
                    className="flex items-center space-x-2 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-sm font-medium text-accent-900">
                      {member.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-white">{member.user?.name || 'User'}</span>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-accent-200 py-2 z-[9999]" style={{ backdropFilter: 'none' }}>
                      <div className="px-4 py-2 border-b border-accent-100">
                        <p className="text-sm font-medium text-accent-900">{member.user?.name || 'User'}</p>
                        <p className="text-xs text-accent-600">{member.user?.email || 'user@example.com'}</p>
                      </div>
                      
                      <button className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      
                      <button className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      
                      <div className="border-t border-accent-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Board Description */}
          {currentBoard.description && currentBoard.description.trim() && currentBoard.description !== '2' && (
            <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4 border border-white border-opacity-20">
              <p className="text-white text-sm leading-relaxed">{currentBoard.description}</p>
            </div>
          )}

          {/* Lists Container with Drag & Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-wrap gap-4 pb-4">
              {/* Add List Section - Always First (Non-draggable) */}
              <div className="flex-shrink-0 w-72 min-w-[18rem]">
                {showAddList ? (
                  <div className="bg-white bg-opacity-95 rounded-xl p-4 shadow-lg border border-white border-opacity-20">
                    <input
                      ref={addListInputRef}
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onKeyDown={handleAddListKeyDown}
                      placeholder="Enter list title..."
                      className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-accent-900 font-semibold mb-3"
                      maxLength={100}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCreateList}
                        disabled={!newListTitle.trim() || creatingList}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {creatingList ? 'Adding...' : 'Add List'}
                      </button>
                      <button
                        onClick={handleHideAddList}
                        className="px-4 py-2 text-accent-600 hover:text-accent-800 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleShowAddList}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl p-4 transition-all duration-200 border-2 border-dashed border-white border-opacity-30 hover:border-opacity-50"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Add a list</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Draggable Lists Container */}
              <Droppable droppableId="lists" type="list" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-wrap gap-4"
                  >
                    {/* Existing Lists */}
                    {lists?.map((list, listIndex) => (
                      <Draggable
                        key={list.id || list._id}
                        draggableId={(list.id || list._id).toString()}
                        index={listIndex}
                        type="list"
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex-shrink-0 w-72 min-w-[18rem] bg-white bg-opacity-95 rounded-xl p-4 shadow-lg border border-white border-opacity-20 h-fit ${
                              snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                            }`}
                            style={provided.draggableProps.style}
                          >
                            {/* List Header - Drag Handle */}
                            <div {...provided.dragHandleProps} className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing">
                    {editingListId === (list.id || list._id) ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          ref={editListInputRef}
                          type="text"
                          value={editListTitle}
                          onChange={(e) => setEditListTitle(e.target.value)}
                          onKeyDown={handleEditListKeyDown}
                          onBlur={handleSaveListEdit}
                          className="flex-1 px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-accent-900 font-semibold"
                          maxLength={100}
                        />
                        <button
                          onClick={handleSaveListEdit}
                          className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelListEdit}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-accent-900 truncate flex-1 min-w-0" title={list.title}>
                          {list.title}
                        </h3>
                        <div className="relative list-menu-container flex-shrink-0">
                          <button
                            onClick={(e) => handleListMenuClick(list.id || list._id, e)}
                            className="p-1 text-accent-400 hover:text-accent-600 rounded"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {showListMenu === (list.id || list._id) && (
                            <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-accent-200 py-2 z-50">
                              <button
                                onClick={() => handleStartEditList(list)}
                                className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Rename List</span>
                              </button>
                              <button
                                onClick={() => handleShowDeleteConfirm(list.id || list._id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete List</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                            </div>

                  {/* Cards - Each list is a Droppable containing multiple Draggable cards */}
                  <Droppable droppableId={`list-${(list.id || list._id).toString()}`}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-2 mb-3 min-h-[70px] ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-50 bg-opacity-50 rounded-lg p-1' 
                            : (!list.cards || list.cards.length === 0) 
                              ? 'border-2 border-dashed border-white border-opacity-20 rounded-lg p-2' 
                              : ''
                        }`}
                      >
                        {list.cards && list.cards.length > 0 ?
                          [...list.cards]
                            .sort((a, b) => (a.position || 0) - (b.position || 0))
                            .map((card, index) => {
                              const cardId = card?.id || card?._id;

                              // Skip cards without valid IDs
                              if (!cardId) return null;

                              return (
                                <Draggable
                                  key={cardId.toString()}
                                  draggableId={cardId.toString()}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="group bg-white rounded-lg p-3 shadow-sm border border-accent-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                      style={provided.draggableProps.style}
                                    >
                                      {editingCardId === cardId ? (
                                        // Edit card form
                                        <div className="space-y-2">
                                          <input
                                            ref={editCardInputRef}
                                            type="text"
                                            value={editCardTitle}
                                            onChange={(e) => setEditCardTitle(e.target.value)}
                                            onKeyDown={handleEditCardKeyDown}
                                            onBlur={handleSaveCardEdit}
                                            className="w-full px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-accent-900 font-medium"
                                            maxLength={500}
                                          />
                                          <div className="flex space-x-2">
                                            <button
                                              onClick={handleSaveCardEdit}
                                              className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                              title="Save"
                                            >
                                              <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={handleCancelCardEdit}
                                              className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                              title="Cancel"
                                            >
                                              <X className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        // Display card
                                        <>
                                          <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-medium text-accent-900 break-words flex-1" title={card.title}>
                                              {card.title}
                                            </h4>
                                            <div className="relative card-menu-container flex-shrink-0 ml-2">
                                              <button
                                                onClick={(e) => handleCardMenuClick(cardId, e)}
                                                className="p-1 text-accent-400 hover:text-accent-600 rounded transition-colors"
                                              >
                                                <MoreHorizontal className="h-4 w-4" />
                                              </button>

                                              {showCardMenu === cardId && (
                                                <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-accent-200 py-2 z-50">
                                                  <button
                                                    onClick={() => handleStartEditCard(card)}
                                                    className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2"
                                                  >
                                                    <Edit className="h-4 w-4" />
                                                    <span>Edit Card</span>
                                                  </button>
                                                  <button
                                                    onClick={() => handleShowCardDeleteConfirm(card)}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Delete Card</span>
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {card?.description && card.description.trim() && (
                                            <p className="text-sm text-accent-600 mb-2 line-clamp-2">
                                              {card.description}
                                            </p>
                                          )}

                                          {/* Card Meta */}
                                          <div className="flex items-center justify-between text-xs text-accent-500">
                                            {card?.dueDate && (
                                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                Due {new Date(card.dueDate).toLocaleDateString()}
                                              </span>
                                            )}
                                            {card?.members?.length > 0 && (
                                              <div className="flex -space-x-1">
                                                {card.members.slice(0, 3).map((member, index) => (
                                                  <div
                                                    key={member?.id || member?._id || index}
                                                    className="h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                                                    title={member?.name || 'Unknown User'}
                                                  >
                                                    {member?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })
                          : (
                            // Empty list placeholder
                            <div className="flex items-center justify-center h-16 text-accent-500 text-sm font-medium">
                              Drop cards here
                            </div>
                          )
                        }
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Add Card Button/Form */}
                  {showAddCard === (list.id || list._id) ? (
                    <div className="space-y-2">
                      <textarea
                        ref={addCardInputRef}
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={handleAddCardKeyDown}
                        placeholder="Enter a title for this card..."
                        className="w-full px-3 py-2 border border-accent-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-accent-900 resize-none"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCreateCard}
                          disabled={!newCardTitle.trim() || creatingCard}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          {creatingCard ? 'Adding...' : 'Add Card'}
                        </button>
                        <button
                          onClick={handleHideAddCard}
                          className="px-3 py-2 text-accent-600 hover:text-accent-900 hover:bg-accent-100 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleShowAddCard(list.id || list._id)}
                      className="w-full flex items-center gap-2 text-accent-600 hover:text-accent-900 hover:bg-accent-100 p-2 rounded-lg transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add a card
                    </button>
                  )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </div>

        {/* Delete List Confirmation Modal */}
        {showDeleteConfirm && (
          <DeleteConfirmationModal
            isOpen={!!showDeleteConfirm}
            onClose={handleCancelDelete}
            onConfirm={() => handleDeleteList(showDeleteConfirm)}
            title="Delete List"
            itemName={lists?.find(list => (list.id || list._id) === showDeleteConfirm)?.title}
            itemType="list"
          />
        )}

        {/* Delete Card Confirmation Modal */}
        {cardToDelete && (
          <DeleteConfirmationModal
            isOpen={!!cardToDelete}
            onClose={handleCancelCardDelete}
            onConfirm={() => handleDeleteCard(cardToDelete.id || cardToDelete._id)}
            title="Delete Card"
            itemName={cardToDelete.title}
            itemType="card"
          />
        )}
      </div>
    </div>
  );
};

export default BoardView;
