import {configureStore} from "@reduxjs/toolkit";
import employeeSlice from "./employee.slice.ts";
import timesheetSlice from "./timesheet.slice.ts";
import customerSlice from "./customer.slice.ts";
import errorSlice from "./error.slice.ts";
import invoicingMonthSlice from "./invoicingMonth.slice.ts";
import { persistStore, persistReducer } from 'redux-persist'
import storage from "redux-persist/lib/storage";
import accountSlice from "./account.slice.ts";

const accountPersistConfig = {
    key: 'account',
    storage: storage,
}

const persistedAccountReducer = persistReducer(accountPersistConfig, accountSlice.reducer)


const store = configureStore({
    reducer: {
        account: persistedAccountReducer,
        customer: customerSlice.reducer,
        employee: employeeSlice.reducer,
        error: errorSlice.reducer,
        invoicingMonth: invoicingMonthSlice.reducer,
        timesheet: timesheetSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    })
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

const persistor = persistStore(store)

export default { store, persistor }