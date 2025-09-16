import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardApi } from '../../services/authApi';
import { handleApiError } from '../../utils/apiHelpers';

// Get all boards
export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await boardApi.getBoards();
      if (response.success) {
        return response.data.boards;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch boards');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Create new board
export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await boardApi.createBoard(boardData);
      if (response.success) {
        return response.data.board;
      } else {
        return rejectWithValue(response.message || 'Failed to create board');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Update board
export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ boardId, boardData }, { rejectWithValue }) => {
    try {
      const response = await boardApi.updateBoard(boardId, boardData);
      if (response.success) {
        return response.data.board;
      } else {
        return rejectWithValue(response.message || 'Failed to update board');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Delete board
export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await boardApi.deleteBoard(boardId);
      if (response.success) {
        return boardId;
      } else {
        return rejectWithValue(response.message || 'Failed to delete board');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Star/Unstar board
export const toggleBoardStar = createAsyncThunk(
  'boards/toggleBoardStar',
  async ({ boardId, isStarred }, { rejectWithValue }) => {
    try {
      const response = await boardApi.updateBoard(boardId, { isStarred });
      if (response.success) {
        return { boardId, isStarred };
      } else {
        return rejectWithValue(response.message || 'Failed to update board');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Get single board with details
export const fetchBoardDetails = createAsyncThunk(
  'boards/fetchBoardDetails',
  async (boardId, { rejectWithValue, getState }) => {
    try {
      // Check if we already have this board and it's the same one
      const state = getState();
      const currentBoard = state.boards.currentBoard;
      
      if (currentBoard && currentBoard.id === boardId) {
        return currentBoard;
      }

      const response = await boardApi.getBoard(boardId);
      if (response.success) {
        return response.data.board;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch board details');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  },
  {
    condition: (boardId, { getState }) => {
      const state = getState();
      const { loading, currentBoard } = state.boards;
      
      // Don't fetch if already loading or if we already have this board
      if (loading || (currentBoard && currentBoard.id === boardId)) {
        return false;
      }
      return true;
    }
  }
);

const boardSlice = createSlice({
  name: 'boards',
  initialState: {
    boards: [],
    currentBoard: null,
    loading: false,
    creating: false,
    error: null,
    searchQuery: '',
    filterBy: 'all', // all, recent, starred
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterBy: (state, action) => {
      state.filterBy = action.payload;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch boards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create board
      .addCase(createBoard.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.creating = false;
        state.boards.unshift(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Update board
      .addCase(updateBoard.fulfilled, (state, action) => {
        const payloadId = action.payload.id || action.payload._id;
        const index = state.boards.findIndex(board => (board.id || board._id) === payloadId);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard && (state.currentBoard.id || state.currentBoard._id) === payloadId) {
          state.currentBoard = action.payload;
        }
      })
      // Delete board
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter(board => (board.id || board._id) !== action.payload);
        if (state.currentBoard && (state.currentBoard.id || state.currentBoard._id) === action.payload) {
          state.currentBoard = null;
        }
      })
      // Toggle board star
      .addCase(toggleBoardStar.pending, (state, action) => {
        // Optimistic update - update UI immediately
        const { boardId, isStarred } = action.meta.arg;
        const boardIndex = state.boards.findIndex(board => (board.id || board._id) === boardId);
        if (boardIndex !== -1) {
          state.boards[boardIndex].isStarred = isStarred;
        }
        if (state.currentBoard && (state.currentBoard.id || state.currentBoard._id) === boardId) {
          state.currentBoard.isStarred = isStarred;
        }
      })
      .addCase(toggleBoardStar.fulfilled, (state, action) => {
        // Confirm the update with server response
        const { boardId, isStarred } = action.payload;
        const boardIndex = state.boards.findIndex(board => (board.id || board._id) === boardId);
        if (boardIndex !== -1) {
          state.boards[boardIndex].isStarred = isStarred;
        }
        if (state.currentBoard && (state.currentBoard.id || state.currentBoard._id) === boardId) {
          state.currentBoard.isStarred = isStarred;
        }
      })
      .addCase(toggleBoardStar.rejected, (state, action) => {
        // Revert optimistic update on error
        const { boardId, isStarred } = action.meta.arg;
        const boardIndex = state.boards.findIndex(board => (board.id || board._id) === boardId);
        if (boardIndex !== -1) {
          state.boards[boardIndex].isStarred = !isStarred; // Revert to opposite
        }
        if (state.currentBoard && (state.currentBoard.id || state.currentBoard._id) === boardId) {
          state.currentBoard.isStarred = !isStarred; // Revert to opposite
        }
      })
      // Fetch board details
      .addCase(fetchBoardDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSearchQuery, setFilterBy, clearCurrentBoard } = boardSlice.actions;
export default boardSlice.reducer;