import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type RoleField = 'client' | 'coach' | 'admin' | 'staff';

export type UserListItem = {
  id: string;
  displayName: string | null;
  email: string;
  role: RoleField | string | null;
  roles: (RoleField | string)[];
  status: string | null;
  miptAccess: {
    status: string | null;
    invitedAt: string | null;
  };
  createdAt: string | null;
  updatedAt: string | null;
  assignedCoach: {
    id: string;
    displayName: string | null;
    email: string;
  } | null;
};

export type UsersListResponse = {
  items: UserListItem[];
};

export type UsersListState = {
  isLoading: boolean;
  error: string | null;
  items: UserListItem[];
};

const initialState: UsersListState = {
  isLoading: false,
  error: null,
  items: []
};

const usersListSlice = createSlice({
  name: 'usersList',
  initialState,
  reducers: {
    usersListRequested(state) {
      state.isLoading = true;
      state.error = null;
    },
    usersListSucceeded(state, action: PayloadAction<UsersListResponse>) {
      state.isLoading = false;
      state.error = null;
      state.items = action.payload.items;
    },
    usersListFailed(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    usersListCleared(state) {
      state.isLoading = false;
      state.error = null;
      state.items = [];
    }
  }
});

export const {
  usersListRequested,
  usersListSucceeded,
  usersListFailed,
  usersListCleared
} = usersListSlice.actions;

export default usersListSlice.reducer;
