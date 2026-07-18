import type {Employee} from "../types/people";
import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {RootState} from "./store.ts";
import moment from "moment";

const EMPTY_EMP: Employee = {
    firstName: "", lastName: "", functionTitle: "", department: "Engineering",
    email: "", phone: "", startDate: moment().valueOf(), status: "Active", manager: undefined,
};
export type EmployeeState = {
    employees: Employee[]
    selectedEmployee: Employee
}

const initialState: EmployeeState = {
    employees: [],
    selectedEmployee: EMPTY_EMP
}


const employeeSlice = createSlice({
    name: 'employee',
    initialState: initialState,
    reducers: {
        loadEmployees: (state, action: PayloadAction<Employee[]>) => {
            state.employees = action.payload
        },
        loadSingleEmployee: (state, action: PayloadAction<Employee>) => {
            state.selectedEmployee = action.payload
        },
        resetSingleEmployee: (state) => {
            state.selectedEmployee = EMPTY_EMP;
        },
    },
    selectors: {
        selectEmployees: state => state.employees,
        selectSelectedEmployee: state => state.selectedEmployee,
    }
})

export const {loadEmployees, loadSingleEmployee, resetSingleEmployee} = employeeSlice.actions

export const {
    selectEmployees,
    selectSelectedEmployee
} = employeeSlice.getSelectors((rootState: RootState) => rootState.employee)

export default employeeSlice