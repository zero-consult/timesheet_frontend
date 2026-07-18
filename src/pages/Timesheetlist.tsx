import Pagination, {PAGE_SIZE} from "../components/Pagination.tsx";
import {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {loadEmployees, selectEmployees} from "../redux/employee.slice.ts";
import {Configuration, CustomerApiFp, EmployeeApiFp} from "../types/people";
import {PEOPLE_BACKEND_HOST, TIMESHEET_BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import {Link} from "react-router";
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Pencil,
    Plus,
    Search,
    SortAscIcon,
    SortDesc,
    Timer,
    Trash2,
    X
} from "lucide-react";
import {calcHours, formatHours} from "../utils/timeUtils.ts";
import moment from "moment";
import {loadTimesheetEntries, selectTimesheetEntries} from "../redux/timesheet.slice.ts";
import {
    TimesheetApiFp,
    type TimesheetEntry,
    type TimesheetStatus,
    TimesheetStatus as TimesheetEntryStatus
} from "../types/timesheet";
import {loadCustomers, selectCustomers} from "../redux/customer.slice.ts";
import {handleError} from "../redux/error.slice.ts";

const TIMESHEET_STATUS_COLORS: Record<TimesheetStatus, string> = {
    Approved: "bg-emerald-500/15 text-emerald-400",
    "In progress": "bg-yellow-500/15 text-yellow-400",
    Rejected: "bg-red-500/15 text-red-400",
};

const TIMESHEET_STATUS_ICONS: Record<TimesheetStatus, typeof CheckCircle2> = {
    Approved: CheckCircle2,
    "In progress": AlertCircle,
    Rejected: X,
};

const INITIALS_COLORS = [
    "bg-blue-600", "bg-violet-600", "bg-rose-600",
    "bg-amber-600", "bg-teal-600", "bg-indigo-600",
];

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
    return INITIALS_COLORS[name.charCodeAt(0) % INITIALS_COLORS.length];
}

function Timesheetlist() {
    const dispatch = useDispatch();
    const customers = useSelector(selectCustomers);
    const employees = useSelector(selectEmployees);
    const entries = useSelector(selectTimesheetEntries);
    const [search, setSearch] = useState("");
    const [empFilter, setEmpFilter] = useState<string | "All">("All");
    const [statusFilter, setStatusFilter] = useState<TimesheetStatus | "All">("All");
    const [weekOffset, setWeekOffset] = useState(0);
    const [sortKey, setSortKey] = useState<keyof TimesheetEntry>("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);

    // Week range
    const today = moment();
    const dayOfWeek = parseInt(today.format("d"));
    const weekStart = moment().subtract(dayOfWeek - 1, "days").add(weekOffset * 7, "days");
    const weekEnd = moment(weekStart).add(6, "days");

    const weekDays = Array.from({length: 7}, (_, i) => {
        return moment(weekStart).add(i, "days");
    });

    async function fetchEmployees() {
        const employeeList = await EmployeeApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).employeesList();
        try {
            const employeeListResponse = await employeeList(axios);
            dispatch(loadEmployees(employeeListResponse.data));
        } catch(error) {
            dispatch(handleError(error))
        }
    }

    async function fetchCustomers() {
        const customerList = await CustomerApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).customersList();
        try {
            const customerListResponse = await customerList(axios);
            dispatch(loadCustomers(customerListResponse.data));
        } catch(error) {
            dispatch(handleError(error))
        }
    }

    async function fetchTimesheetEntries() {
        const timesheetEntryList = await TimesheetApiFp(new Configuration({basePath: TIMESHEET_BACKEND_HOST})).timesheetsList(weekStart.format("YYYY-MM-DD"), weekEnd.format("YYYY-MM-DD"));
        try {
            const timesheetEntryListResponse = await timesheetEntryList(axios);
            dispatch(loadTimesheetEntries(timesheetEntryListResponse.data));
        } catch(error) {
            dispatch(handleError(error))
        }
    }

    useEffect(() => {
        fetchEmployees();
        fetchCustomers();
        fetchTimesheetEntries();
    }, []);

    useEffect(() => {
        fetchTimesheetEntries();
    }, [weekOffset])

    const filtered = useMemo(() => {
        let list = [...entries];
        const ws = weekStart.format("YYYY-MM-DD");
        const we = weekEnd.format("YYYY-MM-DD");
        list = list.filter((e) => e.date >= ws && e.date <= we);
        if (search.trim()) {
            const q = search.toLowerCase();
            const emp = employees.find((e) => (e.firstName + " " + e.lastName).toLowerCase().includes(q));
            list = list.filter((e) =>
                customers.filter(customer => customer.id === e.customerId && customer.companyName.toLowerCase().includes(q)).length > 0 ||
                e.description?.toLowerCase().includes(q) ||
                (emp && e.employeeId === emp.id) ||
                employees.find((em) => em.id === e.employeeId)?.firstName.toLowerCase().includes(q) ||
                employees.find((em) => em.id === e.employeeId)?.lastName.toLowerCase().includes(q)
            );
        }
        if (empFilter !== "All") list = list.filter((e) => e.employeeId === empFilter);
        if (statusFilter !== "All") list = list.filter((e) => e.status === statusFilter);
        list.sort((a, b) => {
            if (sortKey === "customerId") {
                const aCustomer = customers.find(c => c.id === a.customerId);
                const bCustomer = customers.find(c => c.id === b.customerId);
                if (aCustomer && bCustomer) {
                    return aCustomer.companyName.localeCompare(bCustomer.companyName);
                } else if (aCustomer) {
                    return -1;
                } else if (bCustomer) {
                    return 1;
                }
            }
            if (sortKey === "employeeId") {
                const aEmployee = employees.find(e => e.id === a.employeeId);
                const bEmployee = employees.find(e => e.id === b.employeeId);
                if (aEmployee && bEmployee) {
                    return aEmployee.firstName.localeCompare(bEmployee.firstName) || aEmployee.lastName.localeCompare(bEmployee.lastName);
                } else if (aEmployee) {
                    return -1;
                } else if (bEmployee) {
                    return 1;
                }
            }
            const av = String(a[sortKey]);
            const bv = String(b[sortKey]);
            return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });
        return list;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entries, employees, search, empFilter, statusFilter, sortKey, sortDir, weekOffset]);

    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function handleSort(key: keyof TimesheetEntry) {
        if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else {
            setSortKey(key);
            setSortDir("asc");
        }
        setCurrentPage(1);
    }

    const totalHours = filtered.reduce((acc, e) => acc + calcHours(e.startTime, e.endTime), 0);
    const approvedHours = filtered.filter((e) => e.status === "Approved").reduce((acc, e) => acc + calcHours(e.startTime, e.endTime), 0);
    const pendingCount = filtered.filter((e) => e.status === "In progress").length;

    const weekLabel = `${weekStart.format("D MMM")} – ${weekEnd.format("D MMM YYYY")}`;

    // Hours per day for the mini week chart
    const hoursPerDay = weekDays.map((d) => {
        const key = d.format("YYYY-MM-DD");
        return entries.filter((e) => e.date === key).reduce((acc, e) => acc + calcHours(e.startTime, e.endTime), 0);
    });
    const maxDayHours = Math.max(...hoursPerDay, 8);

    async function deleteTimesheetEntry(id: string) {
        const deleteTimesheetEntry = await TimesheetApiFp(new Configuration({basePath: TIMESHEET_BACKEND_HOST})).deleteTimesheetEntry(id);
        try {
            await deleteTimesheetEntry(axios);
            fetchTimesheetEntries();
        } catch(error) {
            dispatch(handleError(error))
        }
    }

    async function updateTimesheetEntry(updatedEntry: TimesheetEntry) {
        const updateTimesheetEntry = await TimesheetApiFp(new Configuration({basePath: TIMESHEET_BACKEND_HOST})).updateTimesheetEntry(updatedEntry.id || "", updatedEntry);
        try {
            await updateTimesheetEntry(axios);
            fetchTimesheetEntries();
        } catch(error) {
            dispatch(handleError(error))
        }
    }

    async function approveTimesheetEntry(entry: TimesheetEntry) {
        const updatedEntry = {...entry, status: TimesheetEntryStatus.Approved};
        await updateTimesheetEntry(updatedEntry);
    }

    async function rejectTimesheetEntry(entry: TimesheetEntry) {
        const updatedEntry = {...entry, status: TimesheetEntryStatus.Rejected};
        await updateTimesheetEntry(updatedEntry);
    }

    return (
        <>
            <header className="px-8 py-6 border-b border-border flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-foreground tracking-tight"
                        style={{fontFamily: "'Instrument Sans', sans-serif"}}>
                        Work hours
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{weekLabel}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
                        <button onClick={() => {
                            setWeekOffset((w) => w - 1);
                            setCurrentPage(1);
                        }}
                                className="px-2.5 py-1 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">‹
                        </button>
                        <button onClick={() => {
                            setWeekOffset(0);
                            setCurrentPage(1);
                        }}
                                className="px-3 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                                style={{fontFamily: "'DM Mono', monospace"}}>Today
                        </button>
                        <button onClick={() => {
                            setWeekOffset((w) => w + 1);
                            setCurrentPage(1);
                        }}
                                className="px-2.5 py-1 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">›
                        </button>
                    </div>
                    <Link to={"/timesheets/add"}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4"/> Register hours
                    </Link>
                </div>
            </header>

            {/* Stats + week chart */}
            <div className="px-8 py-5 grid grid-cols-4 gap-4 border-b border-border">
                <div className="bg-card rounded-lg px-5 py-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1"
                       style={{fontFamily: "'DM Mono', monospace"}}>Total</p>
                    <p className="text-2xl font-semibold text-foreground"
                       style={{fontFamily: "'Instrument Sans', sans-serif"}}>{formatHours(totalHours)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">this week</p>
                </div>
                <div className="bg-card rounded-lg px-5 py-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1"
                       style={{fontFamily: "'DM Mono', monospace"}}>Approved</p>
                    <p className="text-2xl font-semibold text-foreground"
                       style={{fontFamily: "'Instrument Sans', sans-serif"}}>{formatHours(approvedHours)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">approved</p>
                </div>
                <div className="bg-card rounded-lg px-5 py-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1"
                       style={{fontFamily: "'DM Mono', monospace"}}>In progress</p>
                    <p className="text-2xl font-semibold text-foreground"
                       style={{fontFamily: "'Instrument Sans', sans-serif"}}>{pendingCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">registrations</p>
                </div>
                {/* Mini week bar chart */}
                <div className="bg-card rounded-lg px-5 py-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3"
                       style={{fontFamily: "'DM Mono', monospace"}}>Each day</p>
                    <div className="flex items-end gap-1.5">
                        {weekDays.map((d, i) => {
                            const h = hoursPerDay[i];
                            const pct = maxDayHours > 0 ? (h / maxDayHours) * 80 : 0;
                            const isToday = d.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD");
                            return (
                                <div key={i}
                                     className="flex-1 flex flex-col items-center relative gap-1 h-24 content-end">
                                    <div className="w-full rounded-sm absolute bottom-0 mb-6" style={{
                                        height: `${Math.max(pct, 4)}%`,
                                        backgroundColor: isToday ? "var(--primary)" : "var(--muted)",
                                        minHeight: h > 0 ? "4px" : "2px",
                                        opacity: h > 0 ? 1 : 0.3
                                    }} title={`${["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"][i]}: ${formatHours(h)}`}/>
                                    <span className="text-[9px] text-muted-foreground absolute bottom-0"
                                          style={{fontFamily: "'DM Mono', monospace"}}>{["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"][i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="px-8 py-4 flex items-center gap-3 border-b border-border flex-wrap">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <input
                        className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md pl-9 pr-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="Find employee, project" value={search} onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}/>
                </div>
                <select
                    className="bg-secondary text-secondary-foreground text-xs font-medium rounded-md px-3 py-1.5 border border-border focus:outline-none cursor-pointer"
                    value={empFilter} onChange={(e) => {
                    setEmpFilter(e.target.value);
                    setCurrentPage(1);
                }}>
                    <option value="All">All employees</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName + " " + e.lastName}</option>)}
                </select>
                <div className="flex items-center gap-2">
                    {(["All", "Approved", "In progress", "Rejected"] as const).map((s) => (
                        <button key={s} onClick={() => {
                            setStatusFilter(s as TimesheetStatus | "All");
                            setCurrentPage(1);
                        }}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{s}</button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-8 py-4">
                <table className="w-full border-collapse text-sm" style={{width: "1080px"}}>
                    <thead>
                    <tr className="border-b border-border">
                        {([
                            ["date", "Date"], ["employeeId", "Employee"], ["customerId", "Customer"],
                            ["startTime", "Time"], ["description", "Description"], ["status", "Status"],
                        ] as [keyof TimesheetEntry, string][]).map(([key, label]) => (
                            <th key={key}
                                className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-widest cursor-pointer select-none hover:text-foreground transition-colors"
                                style={{fontFamily: "'DM Mono', monospace"}} onClick={() => handleSort(key)}>
                                <span
                                    className="inline-flex items-center gap-1">{label}{(sortKey === key ? (sortDir === "asc" ?
                                    <SortAscIcon/> : <SortDesc/>) : <></>)} :</span>
                            </th>
                        ))}
                        <th className="py-3 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-widest"
                            style={{fontFamily: "'DM Mono', monospace"}}>Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm">No timesheet entries found for this week.
                            </td>
                        </tr>
                    )}
                    {paginated.map((entry, i) => {
                        const emp = employees.find((e) => e.id === entry.employeeId);
                        const hours = calcHours(entry.startTime, entry.endTime);
                        const StatusIcon = typeof entry.status !== "undefined" ? TIMESHEET_STATUS_ICONS[entry.status] : AlertCircle;
                        return (
                            <tr key={entry.id}
                                className={`border-b border-border/50 hover:bg-card/60 transition-colors group ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                                <td className="py-3.5 px-3 text-muted-foreground"
                                    style={{fontFamily: "'DM Mono', monospace", fontSize: "0.8rem"}}>
                                    <div>
                                        <p className="text-foreground font-medium"
                                           style={{fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem"}}>
                                            {moment(entry.date, "YYYY-MM-DD").format("dd D MMM")}
                                        </p>
                                        <p style={{fontSize: "0.75rem"}}>{moment(entry.date, "YYYY-MM-DD").format("YYYY")}</p>
                                    </div>
                                </td>
                                <td className="py-3.5 px-3">
                                    {emp && (
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${getAvatarColor(emp.firstName + " " + emp.lastName)}`}>{getInitials(emp.firstName + " " + emp.lastName)}</div>
                                            <div>
                                                <p className="font-medium text-foreground text-sm">{emp.firstName + " " + emp.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{emp.department}</p>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3.5 px-3">
                                    <span
                                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{customers.filter((c) => c.id === entry.customerId).map((c) => c.companyName).join(", ")}</span>
                                </td>
                                <td className="py-3.5 px-3"
                                    style={{fontFamily: "'DM Mono', monospace", fontSize: "0.8rem"}}>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Timer className="w-3.5 h-3.5 flex-shrink-0"/>
                                        <span>{entry.startTime} – {entry.endTime}</span>
                                    </div>
                                    <p className="text-primary font-medium mt-0.5 text-xs">{formatHours(hours)}</p>
                                </td>
                                <td className="py-3.5 px-3 text-muted-foreground text-sm max-w-[200px] truncate">{entry.description || "—"}</td>
                                <td className="py-3.5 px-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeof entry.status !== "undefined" ? TIMESHEET_STATUS_COLORS[entry.status] : ""}`}>
                                      <StatusIcon className="w-3 h-3"/>
                                        {entry.status}
                                    </span>
                                </td>
                                <td className="py-3.5 px-3 text-right">
                                    <div
                                        className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {entry.status !== "Approved" ?
                                            <><Link to={"/timesheets/" + entry.id + "/edit"}
                                                    className="p-1.5 rounded-md hover:bg-primary/15 hover:text-primary text-muted-foreground transition-colors"><Pencil
                                                className="w-3.5 h-3.5"/></Link>
                                                <button
                                                    onClick={() => deleteTimesheetEntry(entry.id || "")}
                                                    className="cursor-pointer p-1.5 rounded-md hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5"/></button>
                                                <button
                                                    onClick={() => approveTimesheetEntry(entry)}
                                                    className="cursor-pointer p-1.5 rounded-md hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors">
                                                    <Check className="w-3.5 h-3.5"/></button>
                                                <button
                                                    onClick={() => rejectTimesheetEntry(entry)}
                                                    className="cursor-pointer p-1.5 rounded-md hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors">
                                                    <X className="w-3.5 h-3.5"/></button>

                                            </>
                                            : <></>
                                        }
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
            <Pagination page={currentPage} total={filtered.length} onChange={setCurrentPage}/>
        </>)
}

export default Timesheetlist