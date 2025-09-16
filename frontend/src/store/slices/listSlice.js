import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listApi } from '../../services/authApi';
import { handleApiError } from '../../utils/apiHelpers';
import { createCard } from './cardSlice';

// Get lists for a board
export const fetchListsByBoard = createAsyncThunk(
  'lists/fetchListsByBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await listApi.getListsByBoard(boardId);
      if (response.success) {
        return response.data.lists;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch lists');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Create new list
export const createList = createAsyncThunk(
  'lists/createList',
  async (listData, { rejectWithValue }) => {
    try {
      const response = await listApi.createList(listData);
      if (response.success) {
        return response.data.list;
      } else {
        return rejectWithValue(response.message || 'Failed to create list');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Update list
export const updateList = createAsyncThunk(
  'lists/updateList',
  async ({ listId, listData }, { rejectWithValue }) => {
    try {
      const response = await listApi.updateList(listId, listData);
      if (response.success) {
        return response.data.list;
      } else {
        return rejectWithValue(response.message || 'Failed to update list');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Delete list
export const deleteList = createAsyncThunk(
  'lists/deleteList',
  async (listId, { rejectWithValue }) => {
    try {
      const response = await listApi.deleteList(listId);
      if (response.success) {
        return listId;
      } else {
        return rejectWithValue(response.message || 'Failed to delete list');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Reorder list
export const reorderList = createAsyncThunk(
  'lists/reorderList',
  async ({ listId, position }, { rejectWithValue }) => {
    try {
      const response = await listApi.reorderList(listId, position);
      if (response.success) {
        return { listId, position };
      } else {
        return rejectWithValue(response.message || 'Failed to reorder list');
      }
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const listSlice = createSlice({
  name: 'lists',
  initialState: {
    lists: [],
    loading: false,
    creating: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLists: (state) => {
      state.lists = [];
    },
    // Add a reducer to handle card creation from outside
    addCardToList: (state, action) => {
      const { listId, card } = action.payload;
      const listIndex = state.lists.findIndex(list => 
        (list.id || list._id) === listId
      );
      if (listIndex !== -1) {
        if (!state.lists[listIndex].cards) {
          state.lists[listIndex].cards = [];
        }
        state.lists[listIndex].cards.push(card);
      }
    },
    // Optimistic update for card movement within lists
    moveCardBetweenLists: (state, action) => {
      const { cardId, sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload;
      
      // Find source and destination lists
      const sourceListIndex = state.lists.findIndex(list => 
        (list.id || list._id).toString() === sourceListId.toString()
      );
      const destinationListIndex = state.lists.findIndex(list => 
        (list.id || list._id).toString() === destinationListId.toString()
      );
      
      if (sourceListIndex === -1 || destinationListIndex === -1) {
        return;
      }
      
      // Ensure cards arrays exist
      if (!state.lists[sourceListIndex].cards) state.lists[sourceListIndex].cards = [];
      if (!state.lists[destinationListIndex].cards) state.lists[destinationListIndex].cards = [];
      
      // Sort cards by position first to ensure consistent order
      state.lists[sourceListIndex].cards.sort((a, b) => (a.position || 0) - (b.position || 0));
      if (sourceListIndex !== destinationListIndex) {
        state.lists[destinationListIndex].cards.sort((a, b) => (a.position || 0) - (b.position || 0));
      }
      
      // Find and remove card from source list
      const sourceCards = state.lists[sourceListIndex].cards;
      const cardIndex = sourceCards.findIndex(card => {
        const currentCardId = (card.id || card._id).toString();
        return currentCardId === cardId.toString();
      });
      
      if (cardIndex === -1) {
        return; // Card not found
      }
      
      const [card] = sourceCards.splice(cardIndex, 1);
      
      // Update positions of remaining cards in source list
      sourceCards.forEach((c, idx) => {
        c.position = idx;
      });
      
      // Update card's list reference and position
      card.list = destinationListId;
      card.position = destinationIndex;
      
      // Insert card into destination list at the correct position
      const destinationCards = state.lists[destinationListIndex].cards;
      
      // Shift positions of cards that will be after the inserted card
      destinationCards.forEach(c => {
        if (c.position >= destinationIndex) {
          c.position += 1;
        }
      });
      
      // Insert the card
      destinationCards.push(card);
      
      // Sort destination list to ensure proper order
      destinationCards.sort((a, b) => (a.position || 0) - (b.position || 0));
    },
    // Optimistic update for list reordering
    reorderLists: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      
      // Remove list from source position
      const [movedList] = state.lists.splice(sourceIndex, 1);
      
      // Insert list at destination position
      state.lists.splice(destinationIndex, 0, movedList);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch lists by board
      .addCase(fetchListsByBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListsByBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
      })
      .addCase(fetchListsByBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create list
      .addCase(createList.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.creating = false;
        state.lists.unshift(action.payload);
      })
      .addCase(createList.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Update list
      .addCase(updateList.fulfilled, (state, action) => {
        const index = state.lists.findIndex(list => 
          (list.id || list._id) === (action.payload.id || action.payload._id)
        );
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
      })
      // Delete list
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter(list => 
          (list.id || list._id) !== action.payload
        );
      })
      // Reorder list
      .addCase(reorderList.fulfilled, (state, action) => {
        const { listId, position } = action.payload;
        const list = state.lists.find(list => 
          (list.id || list._id) === listId
        );
        if (list) {
          list.position = position;
        }
        // Re-sort lists by position
        state.lists.sort((a, b) => a.position - b.position);
      })
      // Handle card creation (from cardSlice) - using proper action reference
      .addCase(createCard.fulfilled, (state, action) => {
        const newCard = action.payload;
        
        if (!newCard) {
          return;
        }
        
        const listId = newCard.list;
        if (!listId) {
          return;
        }
        
        const listIndex = state.lists.findIndex(list => 
          (list.id || list._id) === listId
        );
        if (listIndex !== -1) {
          if (!state.lists[listIndex].cards) {
            state.lists[listIndex].cards = [];
          }
          state.lists[listIndex].cards.push(newCard);
        }
      })
      // Handle card creation failure
      .addCase(createCard.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { clearError, clearLists, addCardToList, moveCardBetweenLists, reorderLists } = listSlice.actions;
export default listSlice.reducer;