import {configureStore} from "@reduxjs/toolkit";
import employeeSlice from "./employee.slice.ts";


const store = configureStore({
    reducer: {
        employee: employeeSlice.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    })
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store;