import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {RootState} from "./store.ts";
import moment from "moment";

export type InvoicingMonthState = {
    invoicingMonth?: string
    latestEmployeePayslipMonth?: string
    payslipMonth?: string
}

const initialState: InvoicingMonthState = {}

const invoicingMonthSlice = createSlice({
    name: 'invoicingMonth',
    initialState: initialState,
    reducers: {
        setInvoicingMonth: (state, action: PayloadAction<string>) => {
            state.invoicingMonth = action.payload;
        },
        setLatestEmployeePayslipMonth: (state, action: PayloadAction<string|undefined>) => {
            state.latestEmployeePayslipMonth = action.payload;
        },
        setPayslipMonth: (state, action: PayloadAction<string>) => {
            state.payslipMonth = action.payload;
        }
    },
    selectors: {
        selectInvoicingMonth: state => state.invoicingMonth,
        selectLatestEmployeePayslipMonth: state => state.latestEmployeePayslipMonth,
        selectLatestEmployeePayslipMonthFormatted: state => state.latestEmployeePayslipMonth ? moment(state.latestEmployeePayslipMonth, "YYYY-MM-DD") : undefined,
        selectPayslipMonth: state => state.payslipMonth,
        selectPayslipFormatted: state => state.payslipMonth ? moment(state.payslipMonth, "YYYY-MM-DD") : undefined
    }
})

export const {setInvoicingMonth, setLatestEmployeePayslipMonth, setPayslipMonth} = invoicingMonthSlice.actions

export const {
    selectInvoicingMonth,
    selectLatestEmployeePayslipMonth,
    selectLatestEmployeePayslipMonthFormatted,
    selectPayslipMonth,
    selectPayslipFormatted
} = invoicingMonthSlice.getSelectors((rootState: RootState) => rootState.invoicingMonth)

export default invoicingMonthSlice