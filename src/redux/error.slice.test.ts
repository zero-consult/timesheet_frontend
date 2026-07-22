import {describe, expect} from "vitest";
import {test} from "@vitest/runner";
import errorSlice, {type ErrorState, handleError, hideError, showError} from "./error.slice.ts";
import {AxiosError, type AxiosResponseHeaders} from "axios";

const initialState: ErrorState = {
    title: '',
    message: '',
    visible: false
}

describe('Error slice', () => {
    test('Initial state', async () => {
        const errorSliceInit = errorSlice.reducer(initialState, {type: 'unknown'})
        expect(errorSliceInit).toBe(initialState)
    })
    test('showError', async () => {
        const errorSliceState = errorSlice.reducer(initialState, showError({title: "test", message: "test message"}))
        expect(errorSliceState).toEqual({title: "test", message: "test message", visible: true})
    })
    test('hideError', async () => {
        const errorSliceState = errorSlice.reducer({...initialState, visible: true}, hideError())
        expect(errorSliceState.visible).toBeFalsy();
    })
    describe('handleError', () => {
        test('custom error', async () => {
            const errorSliceState = errorSlice.reducer(initialState, handleError(new AxiosError("test", "ERR", undefined, undefined, {
                data: "Custom error",
                status: 500,
                statusText: '',
                headers: {},
                config: {
                    headers: {} as AxiosResponseHeaders,
                },
                request: undefined
            })))
            expect(errorSliceState.message).toEqual("Custom error")
        })
        test('customer error 2', async () => {
            const errorSliceState = errorSlice.reducer(initialState, handleError("Custom error 2"))
            expect(errorSliceState.message).toEqual("Custom error 2")
        })
        test('network error', async () => {
            const errorSliceState = errorSlice.reducer(initialState, handleError(new AxiosError("test", "ERR_NETWORK")))
            expect(errorSliceState.message).toEqual("Network error")
        })
        test('bad request', async () => {
            const errorSliceState = errorSlice.reducer(initialState, handleError(new AxiosError("test", "ERR_BAD_REQUEST")))
            expect(errorSliceState.message).toEqual("Bad request")
        })
        test('bad response', async () => {
            const errorSliceState = errorSlice.reducer(initialState, handleError(new AxiosError("test", "ERR_BAD_RESPONSE")))
            expect(errorSliceState.message).toEqual("Bad response")
        })
        test('cancelled error', async () => {
            const errorSliceState = errorSlice.reducer(initialState, handleError(new AxiosError("test", "ERR_CANCELED")))
            expect(errorSliceState.message).toEqual("Request canceled")
        })
        test('client closed request error', async () => {
            const errorSliceState = errorSlice.reducer(initialState, handleError(new AxiosError("test", "ERR_CLIENT_CLOSED_REQUEST")))
            expect(errorSliceState.message).toEqual("Client closed request")
        })
        test('unknown error', async () => {
            const errorSliceState = errorSlice.reducer(initialState, handleError(new AxiosError("test", "ERR_UNKNOWN")))
            expect(errorSliceState.message).toEqual("Unknown error")
        })
        test('unknown error 2', async () => {
            const errorSliceState = errorSlice.reducer(initialState, handleError(initialState))
            expect(errorSliceState.message).toEqual("Unknown error")
        })
    })

})

