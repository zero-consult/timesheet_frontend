import type {Customer, Employee} from "../types/people";
import moment from "moment";
import type {TimesheetEntry} from "../types/timesheet";

export const TS_ENTRY_1: TimesheetEntry = {
    id: "1",
    date: moment().format("YYYY-MM-DD"),
    startTime: "09:00",
    endTime: "17:00",
    customerId: "1",
    employeeId: "1",
    status: "In progress",
    createdAt: moment().valueOf(),
    description: "description"
}

export const EMP_1: Employee = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    functionTitle: "Software Engineer",
    department: "Engineering",
    email: "",
    phone: "1234567890",
    startDate: moment("2026-07-20", "YYYY-MM-DD").valueOf(),
    status: "Active",
    manager: undefined,
    hasTimesheetEntries: false
}

export const CUST_1: Customer = {
    id: "1",
    companyName: "Company X",
    contactPersonFirstName: "Jane",
    contactPersonLastName: "Doe",
    email: "",
    phone: "0987654321",
    startDate: moment("2026-07-20", "YYYY-MM-DD").valueOf(),
    status: "Active",
    sector: "Tech",
    city: "Amsterdam",
}