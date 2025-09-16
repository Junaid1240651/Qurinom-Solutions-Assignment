import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cardApi } from '../../services/authApi';

// Async thunks
export const fetchCardsByList = createAsyncThunk(
  'cards/fetchByList',
  async (listId, { rejectWithValue }) => {
    try {
      const data = await cardApi.getCardsByList(listId);
      return { listId, cards: data.cards }; // Extract cards from response data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cards'
      );
    }
  }
);

export const createCard = createAsyncThunk(
  'cards/create',
  async (cardData, { rejectWithValue }) => {
    try {
      const data = await cardApi.createCard(cardData);
      
      // Check if we have the nested structure: data.data.card
      let card;
      if (data && data.data && data.data.card) {
        card = data.data.card;
      } else if (data && data.card) {
        card = data.card;
      } else {
        return rejectWithValue('Invalid response from server');
      }
      
      return card;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create card'
      );
    }
  }
);

export const updateCard = createAsyncThunk(
  'cards/update',
  async ({ cardId, cardData }, { rejectWithValue }) => {
    try {
      const data = await cardApi.updateCard(cardId, cardData);
      // Handle nested response structure
      let card;
      if (data && data.data && data.data.card) {
        card = data.data.card;
      } else if (data && data.card) {
        card = data.card;
      } else {
        return rejectWithValue('Invalid response from server');
      }
      return card;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update card'
      );
    }
  }
);

export const deleteCard = createAsyncThunk(
  'cards/delete',
  async (cardId, { rejectWithValue }) => {
    try {
      await cardApi.deleteCard(cardId);
      return cardId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete card'
      );
    }
  }
);

export const moveCard = createAsyncThunk(
  'cards/move',
  async ({ cardId, moveData }, { rejectWithValue }) => {
    try {
      const data = await cardApi.moveCard(cardId, moveData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to move card'
      );
    }
  }
);

const initialState = {
  cards: {}, // Store cards by list ID: { listId: [cards] }
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearCards: (state) => {
      state.cards = {};
      state.loading = false;
      state.creating = false;
      state.updating = false;
      state.deleting = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for card movement
    moveCardOptimistic: (state, action) => {
      const { cardId, sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload;
      
      // Find the card in the source list
      const sourceList = state.cards[sourceListId] || [];
      const cardIndex = sourceList.findIndex(card => (card.id || card._id) === cardId);
      
      if (cardIndex === -1) return; // Card not found
      
      const card = sourceList[cardIndex];
      
      // Remove card from source list
      state.cards[sourceListId] = sourceList.filter((_, index) => index !== cardIndex);
      
      // Add card to destination list at the correct position
      if (!state.cards[destinationListId]) {
        state.cards[destinationListId] = [];
      }
      
      // Update card's list reference
      const updatedCard = { ...card, list: destinationListId };
      
      // Insert at the correct position
      state.cards[destinationListId].splice(destinationIndex, 0, updatedCard);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cards by list
      .addCase(fetchCardsByList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardsByList.fulfilled, (state, action) => {
        state.loading = false;
        const { listId, cards } = action.payload;
        state.cards[listId] = cards;
      })
      .addCase(fetchCardsByList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create card
      .addCase(createCard.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.creating = false;
        const newCard = action.payload;
        const listId = newCard.list;
        
        if (!state.cards[listId]) {
          state.cards[listId] = [];
        }
        state.cards[listId].push(newCard);
      })
      .addCase(createCard.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Update card
      .addCase(updateCard.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.updating = false;
        const updatedCard = action.payload;
        const cardId = updatedCard.id || updatedCard._id;
        
        // Find and update the card in all lists
        Object.keys(state.cards).forEach(listId => {
          const cardIndex = state.cards[listId].findIndex(
            card => (card.id || card._id) === cardId
          );
          if (cardIndex !== -1) {
            state.cards[listId][cardIndex] = updatedCard;
          }
        });
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // Delete card
      .addCase(deleteCard.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.deleting = false;
        const cardId = action.payload;
        
        // Remove card from all lists
        Object.keys(state.cards).forEach(listId => {
          state.cards[listId] = state.cards[listId].filter(
            card => (card.id || card._id) !== cardId
          );
        });
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // Move card
      .addCase(moveCard.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(moveCard.fulfilled, (state, action) => {
        state.updating = false;
        const movedCard = action.payload;
        const cardId = movedCard.id || movedCard._id;
        const newListId = movedCard.list;
        
        // Remove card from old list
        Object.keys(state.cards).forEach(listId => {
          state.cards[listId] = state.cards[listId].filter(
            card => (card.id || card._id) !== cardId
          );
        });
        
        // Add card to new list
        if (!state.cards[newListId]) {
          state.cards[newListId] = [];
        }
        state.cards[newListId].push(movedCard);
      })
      .addCase(moveCard.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { clearCards, clearError, moveCardOptimistic } = cardSlice.actions;
export default cardSlice.reducer;