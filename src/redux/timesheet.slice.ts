import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {RootState} from "./store.ts";
import moment from "moment";
import type {TimesheetEntry} from "../types/timesheet";

const EMPTY_TIMESHEET_ENTRY: TimesheetEntry = {
    date: moment().format("YYYY-MM-DD"),
    startTime: "09:00",
    endTime: "17:00",
    customerId: "",
    employeeId: "",
    status: "In progress",
    createdAt: moment().valueOf(),
    description: ""
};
export type TimesheetState = {
    timesheetEntries: TimesheetEntry[]
    selectedTimesheetEntry: TimesheetEntry
}

const initialState: TimesheetState = {
    timesheetEntries: [],
    selectedTimesheetEntry: EMPTY_TIMESHEET_ENTRY
}


const timesheetSlice = createSlice({
    name: 'timesheet',
    initialState: initialState,
    reducers: {
        loadTimesheetEntries: (state, action: PayloadAction<TimesheetEntry[]>) => {
            state.timesheetEntries = action.payload
        },
        loadSingleTimesheetEntry: (state, action: PayloadAction<TimesheetEntry>) => {
            state.selectedTimesheetEntry = action.payload
        },
        updateCustomerId: (state, action: PayloadAction<string>) => {
            state.selectedTimesheetEntry.customerId = action.payload
        },
        updateEmployeeId: (state, action: PayloadAction<string>) => {
            state.selectedTimesheetEntry.employeeId = action.payload
        },
        resetSingleTimesheetEntry: (state) => {
            state.selectedTimesheetEntry = EMPTY_TIMESHEET_ENTRY;
        },
    },
    selectors: {
        selectTimesheetEntries: state => state.timesheetEntries,
        selectSelectedTimesheetEntry: state => state.selectedTimesheetEntry,
    }
})

export const {loadTimesheetEntries, loadSingleTimesheetEntry, updateCustomerId, updateEmployeeId, resetSingleTimesheetEntry} = timesheetSlice.actions

export const {
    selectTimesheetEntries,
    selectSelectedTimesheetEntry
} = timesheetSlice.getSelectors((rootState: RootState) => rootState.timesheet)

export default timesheetSlice