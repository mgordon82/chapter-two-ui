/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type RoleField = 'client' | 'coach' | 'admin' | 'staff';

export type ManageUserRolesRequest = {
  userId: string;
  roles: RoleField[];
};

export type ManageUserRolesResponse = {
  ok: true;
  user: {
    id: string;
    role: RoleField | null;
    roles: RoleField[];
  };
};

export type ManageUserRolesState = {
  isSaving: boolean;
  error: string | null;
};

const initialState: ManageUserRolesState = {
  isSaving: false,
  error: null
};

const manageUserRolesSlice = createSlice({
  name: 'manageUserRoles',
  initialState,
  reducers: {
    manageUserRolesRequested(
      state,
      _action: PayloadAction<ManageUserRolesRequest>
    ) {
      state.isSaving = true;
      state.error = null;
    },
    manageUserRolesSucceeded(
      state,
      _action: PayloadAction<ManageUserRolesResponse>
    ) {
      state.isSaving = false;
      state.error = null;
    },
    manageUserRolesFailed(state, action: PayloadAction<string>) {
      state.isSaving = false;
      state.error = action.payload;
    },
    manageUserRolesCleared(state) {
      state.isSaving = false;
      state.error = null;
    }
  }
});

export const {
  manageUserRolesRequested,
  manageUserRolesSucceeded,
  manageUserRolesFailed,
  manageUserRolesCleared
} = manageUserRolesSlice.actions;

export default manageUserRolesSlice.reducer;
