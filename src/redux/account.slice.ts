import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {RootState} from "./store.ts";
import type {Employee, UserWithToken} from "../types/people";

export type AccountState = {
    user?: Employee
    admin: boolean
    token?: string
}

const initialState: AccountState = {
    admin: false
}


const accountSlice = createSlice({
    name: 'account',
    initialState: initialState,
    reducers: {
        login: (state, action: PayloadAction<UserWithToken>) => {
            state.user = action.payload.user;
            state.admin = action.payload.admin;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.user = undefined;
            state.admin = false;
            state.token = undefined;
        },
    },
    selectors: {
        selectUser: state => state.user,
        selectAdmin: state => state.admin,
        selectToken: state => state.token,
    }
})

export const {login, logout} = accountSlice.actions

export const {
    selectUser,
    selectAdmin,
    selectToken
} = accountSlice.getSelectors((rootState: RootState) => rootState.account)

export default accountSlice