# Frontend Documentation

A React + Redux Toolkit frontend for a Trello-like board management UI. This app provides authentication, boards listing, board view with lists and drag-and-drop cards, comment threads, member management, and in-board search.

## Stack
- React 19
- React Router DOM 7
- Redux Toolkit + React Redux
- @hello-pangea/dnd for drag and drop
- Tailwind CSS for styling
- Axios for API calls
- react-hot-toast for notifications
- lucide-react icons

## Quick Start
1. Install dependencies
	 - From the `frontend` folder:
		 - `npm install`
2. Environment variables
	 - If needed for non-default API URL, create `.env` in `frontend/` and set:
		 - `REACT_APP_API_BASE_URL=http://localhost:3000/api`
3. Run the app
	 - `npm start` (opens at http://localhost:3000)

## Project Structure
```
frontend/
	src/
		App.jsx                # Routes and layout
		index.jsx              # Entrypoint
		components/
			ProtectedRoute.jsx
			auth/
				LoginForm.jsx
				RegisterForm.jsx
			dashboard/
				Header.jsx
				Dashboard.jsx
				BoardCard.jsx
				CreateBoardModal.jsx
				EditBoardModal.jsx
			board/
				BoardView.jsx      # Core board screen (lists, cards, DnD, comments)
				MemberManagementModal.jsx
				InviteMemberModal.jsx
				RemoveMemberModal.jsx
				CardModal.jsx
				CommentSection.jsx
			common/
				DeleteConfirmationModal.jsx
				index.js
		services/
			api.js               # Axios instance with auth header
			authApi.js           # API wrappers for auth/boards/users
		store/
			index.js             # Redux store setup
			slices/
				authSlice.js
				boardSlice.js
				listSlice.js
				cardSlice.js
				commentSlice.js
		utils/
			apiHelpers.js
			toast.js
	public/
		index.html
```

## Routing
- `/login`, `/register`: Auth screens
- `/dashboard`: User boards list
- `/board/:boardId`: Board view with lists and cards
	- Protected routes enforced by `ProtectedRoute`

## State Management
Redux Slices:
- `authSlice`: user and token (localStorage), login/register/logout
- `boardSlice`: current board details, fetch/update board
- `listSlice`: lists for current board, reorder, create/update/delete
- `cardSlice`: cards under lists, move, create/update/delete
- `commentSlice`: comments by card, add/fetch

Key Patterns:
- Async thunks for API interactions
- Normalized updates on create/move
- Toast notifications on success/error

## Board View UX
- Drag-and-drop lists and cards
- Add/edit list titles; add cards into lists
- Comment icon per card to open comments
- Search bar in header filters lists and cards
	- Highlights matched text
	- Disables drag/add while searching
	- Shows empty-state when no results
- Member management (invite/remove) for owner/admin
- Owner avatar hidden from thumbnail stack; only invited members shown

## Services
- `api.js`: Axios instance injects `Authorization` token from localStorage
- `authApi.js`: wrappers for auth, boards, users (add/remove members, etc.)

## Environment & Config
- Default API base: `http://localhost:5000/api` or as configured within `api.js`
- Override with `REACT_APP_API_BASE_URL`

## Scripts
- `npm start` — local dev server
- `npm run build` — production build
- `npm test` — tests via CRA setup

## Common Flows
- Login/Register → navigate to dashboard → create board → open board → create lists/cards
- Click comment icon on a card to view/add comments
- Use search to quickly locate lists/cards

## Notes
- Match roles with backend permissions (owner/admin/editor/viewer)
- Ensure token is stored in `localStorage` (`token`) to authenticate API calls

If you want, I can add API shape examples, a component tree diagram, or a small troubleshooting section.
