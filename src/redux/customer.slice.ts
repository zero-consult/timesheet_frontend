import moment from "moment/moment";
import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {RootState} from "./store.ts";
import type {Customer} from "../types/people";

const EMPTY_CUST: Customer = {
    city: "", companyName: "",contactPersonFirstName: "", contactPersonLastName: "", sector: "Tech",
    email: "", phone: "", startDate: moment().valueOf(), status: "Prospect",
};
export type CustomerState = {
    customers: Customer[]
    selectedCustomer: Customer
}

const initialState: CustomerState = {
    customers: [],
    selectedCustomer: EMPTY_CUST
}


const customerSlice = createSlice({
    name: 'account',
    initialState: initialState,
    reducers: {
        loadCustomers: (state, action: PayloadAction<Customer[]>) => {
            state.customers = action.payload
        },
        loadSingleCustomer: (state, action: PayloadAction<Customer>) => {
            state.selectedCustomer = action.payload
        },
        resetSingleCustomer: (state)=> {
            state.selectedCustomer = EMPTY_CUST;
        },
    },
    selectors: {
        selectCustomers: state => state.customers,
        selectSelectedCustomer: state => state.selectedCustomer,
    }
})

export const {loadCustomers, loadSingleCustomer, resetSingleCustomer} = customerSlice.actions

export const {
    selectCustomers,
    selectSelectedCustomer
} = customerSlice.getSelectors((rootState: RootState) => rootState.customer)

export default customerSlice