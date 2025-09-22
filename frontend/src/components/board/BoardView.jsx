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
  LogOut,
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import { showSuccess, showError } from '../../utils/toast';
import { fetchBoardDetails, clearCurrentBoard, updateBoard } from '../../store/slices/boardSlice';
import { createList, fetchListsByBoard, clearLists, updateList, deleteList, moveCardBetweenLists, reorderLists, reorderList } from '../../store/slices/listSlice';
import { clearCards, updateCard, deleteCard, moveCard, createCard } from '../../store/slices/cardSlice';
import { DeleteConfirmationModal } from '../common';
import MemberManagementModal from './MemberManagementModal';
import CardModal from './CardModal';
import { boardApi } from '../../services/authApi';
import './BoardView.css';

const BoardView = () => {

  const { boardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBoard, loading, error } = useSelector((state) => state.boards);
  const { lists, creating: creatingList } = useSelector((state) => state.lists);
  const { creating: creatingCard } = useSelector((state) => state.cards);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { commentsByCard } = useSelector((state) => state.comments);

  // Helper function to get the most up-to-date comment count
  const getCommentCount = useCallback((card) => {
    const cardId = card?.id || card?._id;
    if (!cardId) return 0;
    
    // Get count from comments store if available, otherwise fall back to card.comments
    const commentsFromStore = commentsByCard[cardId];
    if (commentsFromStore && Array.isArray(commentsFromStore)) {
      return commentsFromStore.length;
    }
    
    // Fall back to card.comments
    return card?.comments?.length || 0;
  }, [commentsByCard]);

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
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Helper function to get current user's role
  const getCurrentUserRole = useCallback(() => {
    if (!currentBoard || !currentUser) return 'viewer';

    const ownerId = currentBoard.owner?.id || currentBoard.owner?._id || currentBoard.owner;
    const isOwner = currentUser.id.toString() === ownerId.toString();

    if (isOwner) return 'owner';

    const currentUserMember = currentBoard.members?.find(m => {
      const mId = m.user?.id || m.user?._id || m.user;
      return mId.toString() === currentUser.id.toString();
    });

    return currentUserMember?.role || 'viewer';
  }, [currentBoard, currentUser]);

  // Permission checks
  const canEditBoard = useCallback(() => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin';
  }, [getCurrentUserRole]);

  const canCreateContent = useCallback(() => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin' || role === 'editor';
  }, [getCurrentUserRole]);

  const canEditContent = useCallback(() => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin' || role === 'editor';
  }, [getCurrentUserRole]);

  // Non-owner members (invited members only) for header display
  const nonOwnerMembers = useMemo(() => {
    if (!currentBoard || !currentBoard.members) return [];
    const ownerId = (currentBoard.owner?.id || currentBoard.owner?._id || currentBoard.owner || '').toString();
    return currentBoard.members.filter(m => {
      const mId = (m.user?.id || m.user?._id || m.user || '').toString();
      return mId && ownerId && mId !== ownerId; // exclude owner
    });
  }, [currentBoard]);

  // Search & filtering logic
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;

  // Determine which lists match (by title or containing matching cards)
  const filteredLists = useMemo(() => {
    if (!isSearching) return lists;
    if (!Array.isArray(lists)) return [];
    return lists.filter(list => {
      const listTitle = (list.title || '').toLowerCase();
      if (listTitle.includes(normalizedSearch)) return true;
      const listCards = list.cards || [];
      return listCards.some(card => (card.title || '').toLowerCase().includes(normalizedSearch));
    });
  }, [lists, isSearching, normalizedSearch]);

  // Helper to get cards to display for a list while searching
  const getVisibleCardsForList = useCallback((list) => {
    if (!isSearching) return (list.cards || [])
      .slice()
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    const listMatches = (list.title || '').toLowerCase().includes(normalizedSearch);
    let cards = list.cards || [];
    if (!listMatches) {
      cards = cards.filter(card => (card.title || '').toLowerCase().includes(normalizedSearch));
    }
    return cards.slice().sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [isSearching, normalizedSearch]);

  // Highlight matched text (simple single-match highlight)
  const highlightText = useCallback((text) => {
    if (!isSearching || !text) return text;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(normalizedSearch);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-yellow-200 text-accent-900 rounded px-0.5">{text.slice(idx, idx + normalizedSearch.length)}</span>
        {text.slice(idx + normalizedSearch.length)}
      </>
    );
  }, [isSearching, normalizedSearch]);

  // Card Modal handlers
  const handleCardClick = useCallback((card, listTitle) => {
    setSelectedCard({ ...card, listTitle });
    setShowCardModal(true);
  }, []);

  const handleCloseCardModal = useCallback(() => {
    setShowCardModal(false);
    setSelectedCard(null);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleStarBoard = useCallback(async () => {
    const newStarredState = !isStarred;
    setIsStarred(newStarredState);

    try {
      const boardId = currentBoard.id || currentBoard._id;

      if (!boardId) {
        setIsStarred(isStarred); // Revert on error
        return;
      }

      await dispatch(updateBoard({
        boardId: boardId,
        boardData: { isStarred: newStarredState }
      })).unwrap();

      showSuccess(newStarredState ? 'Board starred!' : 'Board unstarred!');
    } catch (error) {
      // Revert the optimistic update on error
      setIsStarred(isStarred);
      showError('Failed to update board star status');
    }
  }, [dispatch, isStarred, currentBoard]);

  const handleInviteMembers = useCallback(() => {
    setShowMemberModal(true);
  }, []);

  const handleCloseMemberModal = useCallback(() => {
    setShowMemberModal(false);
  }, []);

  const handleInviteMember = useCallback(async (memberData) => {
    try {
      const boardId = currentBoard.id || currentBoard._id;
      await boardApi.addMember(boardId, memberData);

      // Refresh board data to show new member
      dispatch(fetchBoardDetails(boardId));

      showSuccess(`Invitation sent to ${memberData.email}!`);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to invite member');
    }
  }, [currentBoard, dispatch]);

  const handleRemoveMember = useCallback(async (memberId) => {
    try {
      const boardId = currentBoard.id || currentBoard._id;
      await boardApi.removeMember(boardId, memberId);

      // Refresh board data to show updated members
      dispatch(fetchBoardDetails(boardId));

      showSuccess('Member removed successfully!');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to remove member');
    }
  }, [currentBoard, dispatch]);

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

        showSuccess('Board title updated successfully!');
      } catch (error) {
        // Reset to original title on error
        setEditTitle(currentBoard?.title || '');
        showError('Failed to update board title');
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
      showSuccess('List created successfully!');
    } catch (error) {
      showError('Failed to create list');
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
      showSuccess('List updated successfully!');
    } catch (error) {
      showError('Failed to update list');
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
      showSuccess('List deleted successfully!');
    } catch (error) {
      showError('Failed to delete list');
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
      const listId = showAddCard; // showAddCard holds the current list id
      await dispatch(createCard({
        title: newCardTitle.trim(),
        list: listId,
        board: boardId
      })).unwrap();

      setNewCardTitle('');
      setShowAddCard(null);
      showSuccess('Card created successfully!');
    } catch (error) {
      showError(error || 'Failed to create card');
    }
  }, [dispatch, newCardTitle, showAddCard, boardId]);

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
      showSuccess('Card updated successfully!');
    } catch (error) {
      showError('Failed to update card');
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
      showSuccess('Card deleted successfully!');
    } catch (error) {
      showError('Failed to delete card');
    }
  }, [dispatch, boardId]);

  const handleCancelCardDelete = useCallback(() => {
    setCardToDelete(null);
  }, []);

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

      try {
        // Get the dragged list ID and new position
        const draggedListId = lists[source.index].id || lists[source.index]._id;

        // Persist list order on server using existing reorderList API
        await dispatch(reorderList({
          listId: draggedListId,
          position: destination.index
        })).unwrap();

        // Refetch lists to get updated positions for all lists
        dispatch(fetchListsByBoard(boardId));
        showSuccess('List moved successfully!');
      } catch (error) {
        // Revert the optimistic update by refetching
        dispatch(fetchListsByBoard(boardId));
        showError('Failed to move list');
      }
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
      showError('Failed to move card');
    }
  }, [dispatch, lists, boardId]);

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
        <div className="max-w-7xl mx-auto">
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
                  <div className={`flex items-center space-x-2 group ${canEditBoard() ? 'cursor-pointer' : ''}`} onClick={canEditBoard() ? handleStartEditTitle : undefined}>
                    <h1 className="text-xl font-bold text-white hover:text-yellow-100 transition-colors">
                      {currentBoard.title}
                    </h1>
                    {canEditBoard() && (
                      <button
                        className="p-1 text-white opacity-70 group-hover:opacity-100 hover:text-yellow-400 transition-all"
                        title="Click to edit board title"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
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
              {/* Search Input (desktop) */}
              <div className="hidden md:block w-64">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search lists & cards..."
                    className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-white bg-opacity-20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-opacity-30 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-sm"
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              {/* Other Board Members (non-clickable) */}
              {nonOwnerMembers.length > 0 && (
                <div className="flex items-center space-x-2">
                  {nonOwnerMembers.slice(0, 2).map((member, index) => (
                    <div
                      key={member.user?.id || index}
                      className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-sm font-medium text-accent-900"
                      title={member.user?.name}
                    >
                      {member.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  ))}
                  {nonOwnerMembers.length > 2 && (
                    <div className="h-8 w-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-xs font-medium text-accent-700">
                      +{nonOwnerMembers.length - 2}
                    </div>
                  )}
                </div>
              )}

              {/* Members Button */}
              <button
                onClick={handleInviteMembers}
                className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg hover:bg-opacity-30 transition-colors text-sm"
                title="Manage board members"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Members</span>
              </button>

              {/* User Profile - Only visible to board owner */}
              {currentBoard.owner && currentUser &&
                (currentBoard.owner.id || currentBoard.owner._id || currentBoard.owner).toString() === currentUser.id.toString() && (
                  <div className="relative profile-menu-container">
                    <button
                      onClick={handleProfileMenuClick}
                      className="flex items-center space-x-2 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-sm font-medium text-accent-900">
                        {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-white">{currentUser.name || 'User'}</span>
                      <ChevronDown className="h-4 w-4 text-white" />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-accent-200 py-2 z-[9999]" style={{ backdropFilter: 'none' }}>
                        <div className="px-4 py-2 border-b border-accent-100">
                          <p className="text-sm font-medium text-accent-900">{currentUser.name || 'User'}</p>
                          <p className="text-xs text-accent-600">{currentUser.email || 'user@example.com'}</p>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 mt-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
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

          {/* Lists Container with Drag & Drop (disabled while searching) */}
          <DragDropContext onDragEnd={isSearching ? () => { } : handleDragEnd}>
            <div className="flex flex-wrap gap-4 pb-4 justify-center">
              {/* Add List Section - Only for users who can create content */}
              {canCreateContent() && !isSearching && (
                <div className="flex-shrink-0 w-72 min-w-[18rem] order-first">
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
              )}

              {/* Draggable Lists Container */}
              <Droppable droppableId="lists" type="list" direction="horizontal" isDropDisabled={isSearching}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-wrap gap-4"
                  >
                    {/* Existing Lists (filtered during search) */}
                    {(isSearching ? filteredLists : lists)?.map((list, listIndex) => (
                      <Draggable
                        key={list.id || list._id}
                        draggableId={(list.id || list._id).toString()}
                        index={listIndex}
                        type="list"
                        isDragDisabled={isSearching}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex-shrink-0 w-72 min-w-[18rem] bg-white bg-opacity-95 rounded-xl p-4 shadow-lg border border-white border-opacity-20 h-fit ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                              }`}
                            style={provided.draggableProps.style}
                          >
                            {/* List Header - Drag Handle (only for users who can edit) */}
                            <div {...(canEditContent() ? provided.dragHandleProps : {})} className={`flex items-center justify-between mb-3 ${canEditContent() ? 'cursor-grab active:cursor-grabbing' : ''}`}>
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
                                    {highlightText(list.title)}
                                  </h3>
                                  {canEditContent() && (
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
                                  )}
                                </>
                              )}
                            </div>

                            {/* Cards - Each list is a Droppable containing multiple Draggable cards */}
                            <Droppable droppableId={`list-${(list.id || list._id).toString()}`}>
                              {(provided, snapshot) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className={`space-y-2 mb-3 min-h-[70px] ${snapshot.isDraggingOver
                                    ? 'bg-blue-50 bg-opacity-50 rounded-lg p-1'
                                    : (!list.cards || list.cards.length === 0)
                                      ? 'border-2 border-dashed border-white border-opacity-20 rounded-lg p-2'
                                      : ''
                                    }`}
                                >
                                  {list.cards && list.cards.length > 0 ?
                                    getVisibleCardsForList(list)
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
                                                {...(canEditContent() ? provided.dragHandleProps : {})}
                                                className={`group bg-white rounded-lg p-3 shadow-sm border border-accent-200 hover:shadow-md transition-shadow ${canEditContent() ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
                                                  <div>
                                                    <div className="flex items-start justify-between mb-2">
                                                      <h4 className="font-medium text-accent-900 break-words flex-1" title={card.title}>
                                                        {highlightText(card.title)}
                                                      </h4>
                                                      {canEditContent() && (
                                                        <div className="relative card-menu-container flex-shrink-0 ml-2">
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleCardMenuClick(cardId, e);
                                                            }}
                                                            className="p-1 text-accent-700 bg-accent-50 hover:text-accent-900 hover:bg-accent-100 rounded transition-colors border border-accent-300 shadow-sm"
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
                                                      )}
                                                    </div>

                                                    {/* Comment Icon - positioned below 3-dot menu */}
                                                    <div className="flex justify-end mb-2">
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleCardClick(card, list.title);
                                                        }}
                                                        className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer p-1 rounded hover:bg-gray-100"
                                                        title="View comments"
                                                      >
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span className="text-xs font-medium">{getCommentCount(card)}</span>
                                                      </button>
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
                                                  </div>
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

                            {/* Add Card Button/Form - Only for users who can create content */}
                            {canCreateContent() && !isSearching && showAddCard === (list.id || list._id) ? (
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
                            ) : canCreateContent() && !isSearching ? (
                              <button
                                onClick={() => handleShowAddCard(list.id || list._id)}
                                className="w-full flex items-center gap-2 text-accent-600 hover:text-accent-900 hover:bg-accent-100 p-2 rounded-lg transition-colors text-sm"
                              >
                                <Plus className="h-4 w-4" />
                                Add a card
                              </button>
                            ) : null}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {isSearching && (filteredLists?.length === 0) && (
                      <div className="text-white/80 text-sm font-medium px-4 py-8">
                        No lists or cards match "{searchQuery}".
                      </div>
                    )}
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

        {/* Member Management Modal */}
        {showMemberModal && (
          <MemberManagementModal
            onClose={handleCloseMemberModal}
            onInviteMember={handleInviteMember}
            onRemoveMember={handleRemoveMember}
            board={currentBoard}
            currentUserId={currentUser?.id}
          />
        )}

        {/* Card Modal */}
        {showCardModal && selectedCard && (
          <CardModal
            card={selectedCard}
            listTitle={selectedCard.listTitle}
            onClose={handleCloseCardModal}
            canEdit={canEditContent()}
          />
        )}
      </div>
    </div>
  );
};

export default BoardView;
