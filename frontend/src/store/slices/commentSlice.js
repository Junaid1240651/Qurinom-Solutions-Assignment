import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cardApi } from '../../services/authApi';
import { handleApiError } from '../../utils/apiHelpers';

// Add comment to card
export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ cardId, text }, { rejectWithValue }) => {
    try {
      const response = await cardApi.addComment(cardId, { text });
      
      if (response.success) {
        return { cardId, comment: response.data.comment };
      } else {
        return rejectWithValue(response.message || 'Failed to add comment');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Fetch comments for a card
export const fetchCommentsForCard = createAsyncThunk(
  'comments/fetchCommentsForCard',
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await cardApi.getComments(cardId);
      
      if (response.success) {
        return { cardId, comments: response.data.comments || [] };
      } else {
        return rejectWithValue(response.message || 'Failed to fetch comments');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    commentsByCard: {}, // { cardId: [comments] }
    loading: false,
    error: null,
  },
  reducers: {
    clearComments: (state) => {
      state.commentsByCard = {};
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCommentsForCard: (state, action) => {
      const { cardId, comments } = action.payload;
      state.commentsByCard[cardId] = comments;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add comment cases
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        const { cardId, comment } = action.payload;
        
        if (!state.commentsByCard[cardId]) {
          state.commentsByCard[cardId] = [];
        }
        state.commentsByCard[cardId].push(comment);
        state.error = null;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch comments cases
      .addCase(fetchCommentsForCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsForCard.fulfilled, (state, action) => {
        state.loading = false;
        const { cardId, comments } = action.payload;
        state.commentsByCard[cardId] = comments;
        state.error = null;
      })
      .addCase(fetchCommentsForCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearComments, clearError, setCommentsForCard } = commentSlice.actions;
export default commentSlice.reducer;