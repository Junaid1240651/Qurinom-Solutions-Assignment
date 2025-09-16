import api from './api';

/**
 * Authentication API service
 */
export const authApi = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};

/**
 * Board API service
 */
export const boardApi = {
  // Get all boards
  getBoards: async () => {
    const response = await api.get('/boards');
    return response.data;
  },

  // Get single board
  getBoard: async (boardId) => {
    try {
      const response = await api.get(`/boards/${boardId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create board
  createBoard: async (boardData) => {
    const response = await api.post('/boards', boardData);
    return response.data;
  },

  // Update board
  updateBoard: async (boardId, boardData) => {
    const response = await api.put(`/boards/${boardId}`, boardData);
    return response.data;
  },

  // Delete board
  deleteBoard: async (boardId) => {
    const response = await api.delete(`/boards/${boardId}`);
    return response.data;
  },

  // Add member to board
  addMember: async (boardId, memberData) => {
    const response = await api.post(`/boards/${boardId}/members`, memberData);
    return response.data;
  },

  // Remove member from board
  removeMember: async (boardId, memberId) => {
    const response = await api.delete(`/boards/${boardId}/members/${memberId}`);
    return response.data;
  }
};

/**
 * List API service
 */
export const listApi = {
  // Get lists for board
  getListsByBoard: async (boardId) => {
    const response = await api.get(`/lists/board/${boardId}`);
    return response.data;
  },

  // Create list
  createList: async (listData) => {
    const response = await api.post('/lists', listData);
    return response.data;
  },

  // Update list
  updateList: async (listId, listData) => {
    const response = await api.put(`/lists/${listId}`, listData);
    return response.data;
  },

  // Reorder list
  reorderList: async (listId, position) => {
    const response = await api.put(`/lists/${listId}/reorder`, { position });
    return response.data;
  },

  // Delete list
  deleteList: async (listId) => {
    const response = await api.delete(`/lists/${listId}`);
    return response.data;
  }
};

/**
 * Card API service
 */
export const cardApi = {
  // Get cards for list
  getCardsByList: async (listId) => {
    const response = await api.get(`/cards/list/${listId}`);
    return response.data;
  },

  // Search cards
  searchCards: async (searchParams) => {
    const response = await api.get('/cards/search', { params: searchParams });
    return response.data;
  },

  // Create card
  createCard: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },

  // Update card
  updateCard: async (cardId, cardData) => {
    const response = await api.put(`/cards/${cardId}`, cardData);
    return response.data;
  },

  // Move card
  moveCard: async (cardId, moveData) => {
    const response = await api.put(`/cards/${cardId}/move`, moveData);
    return response.data;
  },

  // Delete card
  deleteCard: async (cardId) => {
    const response = await api.delete(`/cards/${cardId}`);
    return response.data;
  },

  // Add comment to card
  addComment: async (cardId, commentData) => {
    const response = await api.post(`/cards/${cardId}/comments`, commentData);
    return response.data;
  }
};

/**
 * User API service
 */
export const userApi = {
  // Search users
  searchUsers: async (email) => {
    const response = await api.get('/users/search', { params: { email } });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get user stats
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  // Delete user account
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  }
};