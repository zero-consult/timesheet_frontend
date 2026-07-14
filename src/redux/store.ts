import {configureStore} from "@reduxjs/toolkit";
import employeeSlice from "./employee.slice.ts";
import timesheetSlice from "./timesheet.slice.ts";
import customerSlice from "./customer.slice.ts";


const store = configureStore({
    reducer: {
        customer: customerSlice.reducer,
        employee: employeeSlice.reducer,
        timesheet: timesheetSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    })
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store;