import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {RootState} from "./store.ts";
import {AxiosError} from "axios";

export type ErrorState = {
    title: string,
    message: string,
    visible: boolean
}

const initialState: ErrorState = {
    title: "",
    message: "",
    visible: false
}

const errorSlice = createSlice({
    name: 'error',
    initialState: initialState,
    reducers: {
        handleError: (state, action: PayloadAction<unknown>) => {
            state.title = "Error";
            if (action.payload instanceof AxiosError) {
                if (typeof action.payload.response?.data === "string") {
                    state.message = action.payload.response?.data;
                } else if (action.payload.code === "ERR_NETWORK") {
                    state.message = "Network error";
                } else if (action.payload.code === "ERR_BAD_REQUEST") {
                    state.message = "Bad request";
                } else if (action.payload.code === "ERR_BAD_RESPONSE") {
                    state.message = "Bad response";
                } else if (action.payload.code === "ERR_CANCELED") {
                    state.message = "Request canceled";
                } else if (action.payload.code === "ERR_CLIENT_CLOSED_REQUEST") {
                    state.message = "Client closed request";
                } else {
                    state.message = "Unknown error";
                }
            } else if (typeof action.payload === "string") {
                state.message = action.payload;
            } else {
                state.message = "Unknown error";
            }
            state.visible = true;
        },
        hideError: (state) => {
            state.visible = false;
        },
        showError: (state, action: PayloadAction<{ title: string, message: string }>) => {
            state.title = action.payload.title;
            state.message = action.payload.message;
            state.visible = true;
        },
    },
    selectors: {
        selectError: state => state
    }
})

export const {handleError, hideError, showError} = errorSlice.actions

export const {
    selectError
} = errorSlice.getSelectors((rootState: RootState) => rootState.error)

export default errorSlice