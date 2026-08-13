import {Configuration, CustomerApiFp, EmployeeApiFp} from "../types/people";
import {INVOICES_BACKEND_HOST, PEOPLE_BACKEND_HOST, TIMESHEET_BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import {loadEmployees, selectEmployees} from "../redux/employee.slice.ts";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router";
import {TimesheetApiFp, TimesheetType} from "../types/timesheet";
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
import {handleError, showError} from "../redux/error.slice.ts";
import {useTranslation} from "react-i18next";
import {InvoicingMonthApiFp, PayslipApiFp} from "../types/invoices";
import {
    selectLatestEmployeePayslipMonthFormatted,
    selectPayslipFormatted,
    setLatestEmployeePayslipMonth,
    setPayslipMonth
} from "../redux/invoicingMonth.slice.ts";
import {selectToken} from "../redux/account.slice.ts";

function calculateFromEnd(weekOffset: number) {
    const mwStart = moment();
    const mwDow = parseInt(moment(mwStart).format("d"));
    mwStart.subtract(mwDow === 0 ? 6 : mwDow - 1, "days").add(weekOffset * 7, "days");
    const mwEnd = moment(mwStart).add(6, "days");
    return {
        mwStart,
        mwEnd
    }
}

function SingleTimesheetEntry() {
    const {t, i18n} = useTranslation();
    const dispatch = useDispatch();
    const {timesheetEntryId} = useParams();
    const token = useSelector(selectToken);
    const payslipMonth = useSelector(selectPayslipFormatted);
    const latestEmployeePayslipMonth = useSelector(selectLatestEmployeePayslipMonthFormatted);
    const maxPayslipMonth = typeof payslipMonth === "undefined" ?
        (typeof latestEmployeePayslipMonth === "undefined" ? undefined : latestEmployeePayslipMonth.format("YYYY-MM-DD"))
        :
        (typeof latestEmployeePayslipMonth === "undefined" ? payslipMonth.format("YYYY-MM-DD")
            :
            (payslipMonth.isBefore(latestEmployeePayslipMonth) ? latestEmployeePayslipMonth : payslipMonth).format("YYYY-MM-DD"))


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
        const employeeList = await EmployeeApiFp(new Configuration({accessToken: token, basePath: PEOPLE_BACKEND_HOST})).employeesList();
        try {
            const employeeListResponse = await employeeList(axios);
            dispatch(loadEmployees(employeeListResponse.data));
            if (employeeListResponse.data.length > 0) {
                dispatch(updateEmployeeId(employeeListResponse.data[0].id || ""));
            }
        } catch (error) {
            dispatch(handleError(error))
        }
    }

    async function fetchCustomers() {
        const customerList = await CustomerApiFp(new Configuration({accessToken: token, basePath: PEOPLE_BACKEND_HOST})).customersList();
        try {
            const customerListResponse = await customerList(axios);
            dispatch(loadCustomers(customerListResponse.data));
            if (customerListResponse.data.length > 0) {
                dispatch(updateCustomerId(customerListResponse.data[0].id || ""));
            }
        } catch (error) {
            dispatch(handleError(error))
        }
    }

    async function fetchPayslipMonth() {
        const payslipMonth = await InvoicingMonthApiFp(new Configuration({accessToken: token, basePath: INVOICES_BACKEND_HOST})).getCurrentPayslipMonth();
        try {
            const payslipMonthResponse = await payslipMonth(axios);
            dispatch(setPayslipMonth(payslipMonthResponse.data));
        } catch (error) {
            dispatch(handleError(error))
        }
    }

    useEffect(() => {
        fetchEmployees();
        fetchCustomers();
        fetchPayslipMonth();
    }, []);

    async function fetchTimesheetEntry(timesheetEntryId: string) {
        const timesheetEntryFetch = await TimesheetApiFp(new Configuration({accessToken: token, basePath: TIMESHEET_BACKEND_HOST})).getTimesheetEntry(timesheetEntryId);
        try {
            const timesheetEntryFetchResponse = await timesheetEntryFetch(axios);
            dispatch(loadSingleTimesheetEntry(timesheetEntryFetchResponse.data));
        } catch (error) {
            dispatch(handleError(error))
        }
    }

    useEffect(() => {
        if (typeof timesheetEntryId !== "undefined") {
            fetchTimesheetEntry(timesheetEntryId);
        } else {
            dispatch(resetSingleTimesheetEntry())
        }
    }, [timesheetEntryId]);

    async function fetchEmployeePayslipsMonth() {
        const calculatedFromEnd = calculateFromEnd(weekOffset);
        const dayOfMonth = parseInt(moment(calculatedFromEnd.mwStart).format("D"));
        const searchStart = moment(calculatedFromEnd.mwStart).subtract(dayOfMonth - 1, "days").format("YYYY-MM-DD");
        const searchEnd = calculatedFromEnd.mwEnd.format("YYYY-MM-DD");


        const payslipFetch = await PayslipApiFp(new Configuration({accessToken: token, basePath: INVOICES_BACKEND_HOST})).payslipsList(searchStart, searchEnd, timesheetEntry.employeeId);
        try {
            const payslipFetchResponse = await payslipFetch(axios);
            if (payslipFetchResponse.data.length > 0) {
                let latestMonth = payslipFetchResponse.data[0].month;
                for (const payslip of payslipFetchResponse.data) {
                    if (moment(payslip.month, "YYYY-MM-DD").isAfter(moment(latestMonth, "YYYY-MM-DD"))) {
                        latestMonth = payslip.month;
                    }
                }

                const payslipMonthEmployee = moment(latestMonth).add(1, "month");
                setSelectedDates(selectedDates.filter(value => moment(value, "YYYY-MM-DD").month() >= payslipMonthEmployee.month()));
                dispatch(setLatestEmployeePayslipMonth(payslipMonthEmployee.format("YYYY-MM-DD")));
            } else {
                dispatch(setLatestEmployeePayslipMonth(undefined));
            }
        } catch (error) {
            dispatch(handleError(error))
        }
    }

    useEffect(() => {
        fetchEmployeePayslipsMonth();
    }, [weekOffset, timesheetEntry.employeeId])


    async function saveTimesheetEntries() {
        if (timesheetEntry.startTime.trim().length === 0) {
            dispatch(showError({
                title: "Input error",
                message: t('single_timesheet_entry.input.error.start_time_required')
            }));
            return;
        }
        if (timesheetEntry.employeeId.trim().length === 0) {
            dispatch(showError({
                title: "Input error",
                message: t('single_timesheet_entry.input.error.employee_required')
            }));
            return;
        }
        if (timesheetEntry.type === TimesheetType.Work && (!timesheetEntry.customerId || timesheetEntry.customerId.trim().length === 0)) {
            dispatch(showError({
                title: "Input error",
                message: t('single_timesheet_entry.input.error.customer_required')
            }));
            return;
        }
        if (typeof timesheetEntryId !== "undefined") {
            const timesheetEntryUpdate = await TimesheetApiFp(new Configuration({accessToken: token, basePath: TIMESHEET_BACKEND_HOST})).updateTimesheetEntry(timesheetEntryId, timesheetEntry);
            try {
                await timesheetEntryUpdate(axios);
                window.location.href = "/timesheets";
            } catch (error) {
                dispatch(handleError(error))
            }
        } else {
            for (const date of selectedDates) {
                const timesheetEntryToCreate = {...timesheetEntry, date: date};
                try {
                    const addTimesheetEntry = await TimesheetApiFp(new Configuration({accessToken: token, basePath: TIMESHEET_BACKEND_HOST})).addTimesheetEntry(timesheetEntryToCreate);
                    await addTimesheetEntry(axios);
                } catch (error) {
                    dispatch(handleError(error))
                    return;
                }
            }
            window.location.href = "/timesheets";
        }
    }

    return <>
        <div className="grid grid-cols-2 gap-4 p-5">
            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_timesheet_entry.labels.employee')} *</label>
                <select disabled={isAccepted}
                        className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                        value={timesheetEntry.employeeId} onChange={(e) => dispatch(updateEmployeeId(e.target.value))}>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName + " " + e.lastName}</option>)}
                </select>
            </div>

            <div className="col-span-2">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {typeof timesheetEntryId !== "undefined" ? t('single_timesheet_entry.labels.date') + " *" : `${t('single_timesheet_entry.labels.multiple_dates') + " *"}${selectedDates.length > 1 ? ` · ${t('single_timesheet_entry.labels.days_selected', {count: selectedDates.length})}` : ""}`}
                    </label>
                    {typeof timesheetEntryId === "undefined" && (() => {
                        const calculatedFromEnd = calculateFromEnd(weekOffset);
                        const label = `${calculatedFromEnd.mwStart.locale(i18n.resolvedLanguage || "en").format("DD MMM")} – ${calculatedFromEnd.mwEnd.locale(i18n.resolvedLanguage || "en").format("DD MMM")}`;
                        return (
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground mr-1"
                                      style={{fontFamily: "'DM Mono', monospace"}}>{label}</span>
                                <button type="button" onClick={() => setWeekOffset((w) => w - 1)}
                                        className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm">‹
                                </button>
                                <button type="button" onClick={() => setWeekOffset(0)}
                                        className="px-1.5 py-0.5 rounded text-xs hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                        style={{fontFamily: "'DM Mono', monospace"}}>
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
                           min={maxPayslipMonth}
                           className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                           value={timesheetEntry.date} onChange={(e) => dispatch(loadSingleTimesheetEntry({
                        ...timesheetEntry,
                        date: e.target.value
                    }))}/>
                ) : (() => {
                    const calculatedFromEnd = calculateFromEnd(weekOffset);
                    const days = Array.from({length: 7}, (_, i) => {
                        const d = moment(calculatedFromEnd.mwStart);
                        d.add(i, "days");
                        return d;
                    });
                    const todayStr = moment().format("YYYY-MM-DD");
                    return (
                        <div className="grid grid-cols-7 gap-1.5">
                            {days.map((d, i) => {
                                const ds = d.format("YYYY-MM-DD");
                                const selected = selectedDates.includes(ds);
                                const beforePayslipMonth = typeof maxPayslipMonth === "undefined" ? true : moment(maxPayslipMonth, "YYYY-MM-DD").isAfter(ds)
                                const isToday = ds === todayStr;
                                const isWeekend = i >= 5;
                                return (
                                    <button
                                        key={ds}
                                        type="button"
                                        disabled={beforePayslipMonth}
                                        onClick={() => toggleDate(ds)}
                                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-all 
                                        ${beforePayslipMonth ? "cursor-not-allowed" : ""} 
                                        ${
                                            selected
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : isWeekend
                                                    ? "border-border bg-muted/30 text-muted-foreground/50 hover:bg-muted/60"
                                                    : "border-border bg-input-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                                        }`}
                                    >
                            <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
                              {[t('single_timesheet_entry.weekday.mo'), t('single_timesheet_entry.weekday.tu'), t('single_timesheet_entry.weekday.we'), t('single_timesheet_entry.weekday.th'), t('single_timesheet_entry.weekday.fr'), t('single_timesheet_entry.weekday.sa'), t('single_timesheet_entry.weekday.su')][i]}
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
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_timesheet_entry.labels.start_time')} *</label>
                <input disabled={isAccepted} type="time"
                       className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       value={timesheetEntry.startTime} onChange={(e) => dispatch(loadSingleTimesheetEntry({
                    ...timesheetEntry,
                    startTime: e.target.value
                }))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_timesheet_entry.labels.end_time')} *</label>
                <input disabled={isAccepted} type="time"
                       className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       value={timesheetEntry.endTime} onChange={(e) => dispatch(loadSingleTimesheetEntry({
                    ...timesheetEntry,
                    endTime: e.target.value
                }))}/>
            </div>

            {!endTimeAfterStartTime ?
                <div
                    className="col-span-2 px-3 py-2 flex items-center gap-2 text-sm text-fg-warning rounded-base bg-primary/10 bg-warning-soft rounded-md border border-primary/20"
                    role="alert">
                    <Info className="w-4 h-4 text-primary flex-shrink-0"/>
                    <span
                        className="text-primary font-medium">{t('single_timesheet_entry.input.error.start_time_after_end_time')}</span>
                </div>
                : <></>}

            {timesheetEntry.startTime && timesheetEntry.endTime && calcHours(timesheetEntry.startTime, timesheetEntry.endTime) > 0 && (
                <div
                    className="col-span-2 flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md border border-primary/20">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0"/>
                    <span className="text-sm text-primary font-medium">
                    {t('single_timesheet_entry.each_day', {hours: formatHours(calcHours(timesheetEntry.startTime, timesheetEntry.endTime), i18n.resolvedLanguage)})}
                        {typeof timesheetEntryId === "undefined" && selectedDates.length > 1 && (
                            <span className="text-primary/70 font-normal ml-1.5">
                        · {t('single_timesheet_entry.day_overview', {
                                hours: formatHours(calcHours(timesheetEntry.startTime, timesheetEntry.endTime) * selectedDates.length, i18n.resolvedLanguage),
                                days: selectedDates.length
                            })}
                      </span>
                        )}
                  </span>
                </div>
            )}

            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_timesheet_entry.labels.type')} *</label>
                <select disabled={isAccepted}
                        className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                        value={timesheetEntry.type} onChange={(e) => dispatch(loadSingleTimesheetEntry({
                    ...timesheetEntry,
                    type: e.target.value as TimesheetType
                }))}>
                    <option key={TimesheetType.Work}
                            value={TimesheetType.Work}>{t('single_timesheet_entry.type.work')}</option>
                    <option key={TimesheetType.Holiday}
                            value={TimesheetType.Holiday}>{t('single_timesheet_entry.type.holiday')}</option>
                    <option key={TimesheetType.Sickness}
                            value={TimesheetType.Sickness}>{t('single_timesheet_entry.type.sickness')}</option>
                </select>
            </div>

            {timesheetEntry.type === TimesheetType.Work ?
                <div className="col-span-2">
                    <label
                        className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_timesheet_entry.labels.customer')} *</label>
                    <select disabled={isAccepted}
                            className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                            value={timesheetEntry.customerId}
                            onChange={(e) => dispatch(updateCustomerId(e.target.value))}>
                        {customers.map((customer) => <option key={customer.id}
                                                             value={customer.id}>{customer.companyName}</option>)}
                    </select>
                </div>
                :
                <></>
            }
            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_timesheet_entry.labels.description')}</label>
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
                        <Save className="w-4 h-4"/>{t('single_timesheet_entry.save')}
                    </button>
                </div>
            }
        </div>
    </>
}

export default SingleTimesheetEntry