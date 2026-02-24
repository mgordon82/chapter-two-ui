import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type RoleField = 'client' | 'coach' | 'admin' | 'staff';

export type InviteUserRequest = {
  email: string;
  role: RoleField; // make required since the UI always picks one
  displayName?: string;
};

export type InviteUserResponse = {
  id: string | null;
  email: string;
  role: RoleField | string; // keep flexible if backend returns broader values
  status: string;
  cognitoSub: string;
};

export type InviteUserState = {
  isInviting: boolean;
  hasInvited: boolean;
  error: string | null;
  lastResult: InviteUserResponse | null;
};

const initialState: InviteUserState = {
  isInviting: false,
  hasInvited: false,
  error: null,
  lastResult: null
};

const inviteUserSlice = createSlice({
  name: 'inviteUser',
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inviteUserRequested(state, _action: PayloadAction<InviteUserRequest>) {
      state.error = null;
      state.isInviting = true;
      state.hasInvited = false;
      state.lastResult = null;
    },
    inviteUserSucceeded(state, action: PayloadAction<InviteUserResponse>) {
      state.isInviting = false;
      state.hasInvited = true;
      state.error = null;
      state.lastResult = action.payload;
    },
    inviteUserFailed(state, action: PayloadAction<string>) {
      state.isInviting = false;
      state.error = action.payload;
    },
    inviteUserCleared(state) {
      state.isInviting = false;
      state.hasInvited = false;
      state.error = null;
      state.lastResult = null;
    }
  }
});

export const {
  inviteUserRequested,
  inviteUserSucceeded,
  inviteUserFailed,
  inviteUserCleared
} = inviteUserSlice.actions;

export default inviteUserSlice.reducer;
