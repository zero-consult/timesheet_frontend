import {Configuration, CustomerApiFp, EmployeeApiFp} from "../types/people";
import {PEOPLE_BACKEND_HOST, TIMESHEET_BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import {loadEmployees, selectEmployees} from "../redux/employee.slice.ts";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router";
import {TimesheetApiFp} from "../types/timesheet";
import {
    loadSingleTimesheetEntry,
    resetSingleTimesheetEntry,
    selectSelectedTimesheetEntry,
    updateCustomerId,
    updateEmployeeId
} from "../redux/timesheet.slice.ts";
import {Clock, Info, Save} from "lucide-react";
import {calcHours, formatHours} from "../utils/timeUtils.ts";
import {loadCustomers, selectCustomers} from "../redux/customer.slice.ts";
import moment from "moment";

function SingleTimesheetEntry() {
    const dispatch = useDispatch();
    const {timesheetEntryId} = useParams();
    const customers = useSelector(selectCustomers);
    const employees = useSelector(selectEmployees);
    const timesheetEntry = useSelector(selectSelectedTimesheetEntry);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [weekOffset, setWeekOffset] = useState(0);
    const isAccepted = timesheetEntry.status === "Approved";
    const endTimeAfterStartTime = timesheetEntry.endTime > timesheetEntry.startTime;

    function toggleDate(dateStr: string) {
        const exists = selectedDates.includes(dateStr);
        setSelectedDates(exists ? selectedDates.filter((d) => d !== dateStr) : [...selectedDates, dateStr]);
    }

    async function fetchEmployees() {
        const employeeList = await EmployeeApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).employeesList();
        const employeeListResponse = await employeeList(axios);
        dispatch(loadEmployees(employeeListResponse.data));
        if (employeeListResponse.data.length > 0) {
            dispatch(updateEmployeeId(employeeListResponse.data[0].id || ""));
        }
    }

    async function fetchCustomers() {
        const customerList = await CustomerApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).customersList();
        const customerListResponse = await customerList(axios);
        dispatch(loadCustomers(customerListResponse.data));
        if (customerListResponse.data.length > 0) {
            dispatch(updateCustomerId(customerListResponse.data[0].id || ""));
        }
    }

    useEffect(() => {
        fetchEmployees();
        fetchCustomers();
    }, []);

    async function fetchTimesheetEntry(timesheetEntryId: string) {
        const timesheetEntryFetch = await TimesheetApiFp(new Configuration({basePath: TIMESHEET_BACKEND_HOST})).getTimesheetEntry(timesheetEntryId);
        const timesheetEntryFetchResponse = await timesheetEntryFetch(axios);
        dispatch(loadSingleTimesheetEntry(timesheetEntryFetchResponse.data));
    }

    useEffect(() => {
        if (typeof timesheetEntryId !== "undefined") {
            fetchTimesheetEntry(timesheetEntryId);
        } else {
            dispatch(resetSingleTimesheetEntry())
        }
    }, [timesheetEntryId]);


    async function saveTimesheetEntries() {
        if (typeof timesheetEntryId !== "undefined") {
            const timesheetEntryUpdate = await TimesheetApiFp(new Configuration({basePath: TIMESHEET_BACKEND_HOST})).updateTimesheetEntry(timesheetEntryId, timesheetEntry);
            const timesheetEntryUpdateResponse = await timesheetEntryUpdate(axios);
            if (timesheetEntryUpdateResponse.status === 200) {
                window.location.href = "/timesheets";
            } // else {
            // TODO
            //}
        } else {
            for (const date of selectedDates) {
                const timesheetEntryToCreate = {...timesheetEntry, date: date};
                const addTimesheetEntry = await TimesheetApiFp(new Configuration({basePath: TIMESHEET_BACKEND_HOST})).addTimesheetEntry(timesheetEntryToCreate);
                await addTimesheetEntry(axios);
                // TODO handle errors
            }
            window.location.href = "/timesheets";
        }
    }

    return <>
        <div className="grid grid-cols-2 gap-4 p-5">
            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Employee</label>
                <select disabled={isAccepted}
                        className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                        value={timesheetEntry.employeeId} onChange={(e) => dispatch(updateEmployeeId(e.target.value))}>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName + " " + e.lastName}</option>)}
                </select>
            </div>

            <div className="col-span-2">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {typeof timesheetEntryId !== "undefined" ? "Date" : `Day(s) selected${selectedDates.length > 1 ? ` · ${selectedDates.length} selected` : ""}`}
                    </label>
                    {typeof timesheetEntryId === "undefined" && (() => {
                        const mwStart = moment();
                        const mwDow = parseInt(moment(mwStart).format("d"));
                        mwStart.subtract(mwDow - 1, "days").add(weekOffset * 7, "days");
                        const mwEnd = moment(mwStart).add(6, "days");
                        const label = `${mwStart.format("DD MMM")} – ${mwEnd.format("DD MMM")}`;
                        return (
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground mr-1"
                                      style={{fontFamily: "'DM Mono', monospace"}}>{label}</span>
                                <button type="button" onClick={() => setWeekOffset((w) => w - 1)}
                                        className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm">‹
                                </button>
                                <button type="button" onClick={() => setWeekOffset(0)}
                                        className="px-1.5 py-0.5 rounded text-xs hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                        style={{fontFamily: "'DM Mono', monospace"}}>Now
                                </button>
                                <button type="button" onClick={() => setWeekOffset((w) => w + 1)}
                                        className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm">›
                                </button>
                            </div>
                        );
                    })()}
                </div>
                {typeof timesheetEntryId !== "undefined" ? (
                    <input type="date" disabled={isAccepted}
                           className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                           value={timesheetEntry.date} onChange={(e) => dispatch(loadSingleTimesheetEntry({
                        ...timesheetEntry,
                        date: e.target.value
                    }))}/>
                ) : (() => {
                    const mwStart = moment();
                    const mwDow = parseInt(moment(mwStart).format("d"));
                    mwStart.subtract(mwDow - 1, "days").add(weekOffset * 7, "days");
                    const days = Array.from({length: 7}, (_, i) => {
                        const d = moment(mwStart);
                        d.add(i + weekOffset * 7, "days");
                        return d;
                    });
                    const todayStr = moment().format("YYYY-MM-DD");
                    return (
                        <div className="grid grid-cols-7 gap-1.5">
                            {days.map((d, i) => {
                                const ds = d.format("YYYY-MM-DD");
                                const selected = selectedDates.includes(ds);
                                const isToday = ds === todayStr;
                                const isWeekend = i >= 5;
                                return (
                                    <button
                                        key={ds}
                                        type="button"
                                        onClick={() => toggleDate(ds)}
                                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-all ${
                                            selected
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : isWeekend
                                                    ? "border-border bg-muted/30 text-muted-foreground/50 hover:bg-muted/60"
                                                    : "border-border bg-input-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                                        }`}
                                    >
                            <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
                              {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"][i]}
                            </span>
                                        <span
                                            className={`text-sm font-semibold leading-none ${isToday && !selected ? "text-primary" : ""}`}>
                              {d.format("DD")}
                            </span>
                                        {isToday && (
                                            <span
                                                className={`w-1 h-1 rounded-full ${selected ? "bg-primary-foreground/60" : "bg-primary"}`}/>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Start time</label>
                <input disabled={isAccepted} type="time"
                       className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       value={timesheetEntry.startTime} onChange={(e) => dispatch(loadSingleTimesheetEntry({
                    ...timesheetEntry,
                    startTime: e.target.value
                }))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">End time</label>
                <input disabled={isAccepted} type="time"
                       className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       value={timesheetEntry.endTime} onChange={(e) => dispatch(loadSingleTimesheetEntry({
                    ...timesheetEntry,
                    endTime: e.target.value
                }))}/>
            </div>

            {!endTimeAfterStartTime ?
                <div className="col-span-2 px-3 py-2 flex items-center gap-2 text-sm text-fg-warning rounded-base bg-primary/10 bg-warning-soft rounded-md border border-primary/20" role="alert">
                    <Info className="w-4 h-4 text-primary flex-shrink-0"/>
                    <span className="text-primary font-medium">Start time must be before end time.</span>
                </div>
                : <></>}

            {timesheetEntry.startTime && timesheetEntry.endTime && calcHours(timesheetEntry.startTime, timesheetEntry.endTime) > 0 && (
                <div
                    className="col-span-2 flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md border border-primary/20">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0"/>
                    <span className="text-sm text-primary font-medium">
                    {formatHours(calcHours(timesheetEntry.startTime, timesheetEntry.endTime))} each day
                        {typeof timesheetEntryId === "undefined" && selectedDates.length > 1 && (
                            <span className="text-primary/70 font-normal ml-1.5">
                        · {formatHours(calcHours(timesheetEntry.startTime, timesheetEntry.endTime) * selectedDates.length)} total over {selectedDates.length} days
                      </span>
                        )}
                  </span>
                </div>
            )}

            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Customer</label>
                <select disabled={isAccepted}
                        className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                        value={timesheetEntry.customerId} onChange={(e) => dispatch(updateCustomerId(e.target.value))}>
                    {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}
                </select>
            </div>

            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Description</label>
                <textarea disabled={isAccepted}
                          className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                          rows={2} placeholder="What did you do?" value={timesheetEntry.description}
                          onChange={(e) => dispatch(loadSingleTimesheetEntry({
                              ...timesheetEntry,
                              description: e.target.value
                          }))}/>
            </div>
            {isAccepted || !endTimeAfterStartTime || (typeof timesheetEntryId === "undefined" && selectedDates.length === 0) ? <></> :
                <div className="col-span-2">
                    <button onClick={() => saveTimesheetEntries()}
                            className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                        <Save className="w-4 h-4"/> Save
                    </button>
                </div>
            }
        </div>
    </>
}

export default SingleTimesheetEntry