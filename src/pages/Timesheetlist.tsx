import Pagination, {PAGE_SIZE} from "../components/Pagination.tsx";
import {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {loadEmployees, selectEmployees} from "../redux/employee.slice.ts";
import {Configuration, EmployeeApiFp} from "../types/people";
import {PEOPLE_BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import {Link} from "react-router";
import {AlertCircle, CheckCircle2, Pencil, Plus, Search, SortAscIcon, SortDesc, Timer, Trash2, X} from "lucide-react";

type HourStatus = "Approved" | "In process" | "Rejected";

interface HourEntry {
    id: number;
    employeeId: string;
    date: string;
    startTime: string;
    endTime: string;
    project: string;
    description: string;
    status: HourStatus;
}

const SEED_HOURS: HourEntry[] = [
    { id: 1, employeeId: "1", date: "2026-07-07", startTime: "09:00", endTime: "17:30", project: "PeopleDesk V2", description: "Frontend componenten gebouwd", status: "Approved" },
    { id: 2, employeeId: "2", date: "2026-07-07", startTime: "08:30", endTime: "16:00", project: "Klantportal", description: "UX flows uitgewerkt", status: "Approved" },
    { id: 3, employeeId: "3", date: "2026-07-07", startTime: "09:00", endTime: "12:00", project: "Marketing Site", description: "Campagne planning Q3", status: "In process" },
    { id: 4, employeeId: "6", date: "2026-07-07", startTime: "08:00", endTime: "18:00", project: "Infrastructuur", description: "CI/CD pipeline opgezet", status: "Approved" },
    { id: 5, employeeId: "10", date: "2026-07-07", startTime: "09:30", endTime: "17:00", project: "Data Migratie", description: "Database schema gemigreerd", status: "In process" },
    { id: 6, employeeId: "1", date: "2026-07-08", startTime: "09:00", endTime: "17:00", project: "PeopleDesk V2", description: "Bug fixes en code review", status: "Approved" },
    { id: 7, employeeId: "4", date: "2026-07-08", startTime: "10:00", endTime: "15:30", project: "Intern", description: "Onboarding nieuwe collega", status: "Approved" },
    { id: 8, employeeId: "5", date: "2026-07-08", startTime: "08:30", endTime: "17:00", project: "Intern", description: "Maandafsluiting verwerkt", status: "In process" },
    { id: 9, employeeId: "8", date: "2026-07-08", startTime: "07:00", endTime: "15:00", project: "Overig", description: "Leveranciersgesprekken", status: "Rejected" },
    { id: 10, employeeId: "2", date: "2026-07-09", startTime: "09:00", endTime: "18:00", project: "Klantportal", description: "Designsysteem bijgewerkt", status: "In process" },
];

const HOUR_STATUS_COLORS: Record<HourStatus, string> = {
    Approved: "bg-emerald-500/15 text-emerald-400",
    "In process": "bg-yellow-500/15 text-yellow-400",
    Rejected: "bg-red-500/15 text-red-400",
};

const HOUR_STATUS_ICONS: Record<HourStatus, typeof CheckCircle2> = {
    Approved: CheckCircle2,
    "In process": AlertCircle,
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

function calcHours(start: string, end: string): number {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(0, Math.round(diff / 60 * 10) / 10);
}

function formatHours(h: number) {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    return mins > 0 ? `${whole}u ${mins}m` : `${whole}u`;
}

function Timesheetlist () {
    const dispatch = useDispatch();
    const employees = useSelector(selectEmployees);

    const [entries] = useState<HourEntry[]>(SEED_HOURS);
    const [search, setSearch] = useState("");
    const [empFilter, setEmpFilter] = useState<string | "All">("All");
    const [statusFilter, setStatusFilter] = useState<HourStatus | "All">("All");
    const [weekOffset, setWeekOffset] = useState(0);
    const [sortKey, setSortKey] = useState<keyof HourEntry>("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);

    async function fetchEmployees() {
        const employeeList = await EmployeeApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).employeesList();
        const employeeListResponse = await employeeList(axios);
        dispatch(loadEmployees(employeeListResponse.data));
    }

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Week range
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + weekOffset * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const filtered = useMemo(() => {
        let list = [...entries];
        const ws = weekStart.toISOString().slice(0, 10);
        const we = weekEnd.toISOString().slice(0, 10);
        list = list.filter((e) => e.date >= ws && e.date <= we);
        if (search.trim()) {
            const q = search.toLowerCase();
            const emp = employees.find((e) => (e.firstName + " " + e.lastName).toLowerCase().includes(q));
            list = list.filter((e) =>
                e.project.toLowerCase().includes(q) ||
                e.description.toLowerCase().includes(q) ||
                (emp && e.employeeId === emp.id) ||
                employees.find((em) => em.id === e.employeeId)?.firstName.toLowerCase().includes(q) ||
                employees.find((em) => em.id === e.employeeId)?.lastName.toLowerCase().includes(q)
            );
        }
        if (empFilter !== "All") list = list.filter((e) => e.employeeId === empFilter);
        if (statusFilter !== "All") list = list.filter((e) => e.status === statusFilter);
        list.sort((a, b) => {
            const av = String(a[sortKey]); const bv = String(b[sortKey]);
            return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });
        return list;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entries, employees, search, empFilter, statusFilter, sortKey, sortDir, weekOffset]);

    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function handleSort(key: keyof HourEntry) {
        if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
        setCurrentPage(1);
    }

    const totalHours = filtered.reduce((acc, e) => acc + calcHours(e.startTime, e.endTime), 0);
    const approvedHours = filtered.filter((e) => e.status === "Approved").reduce((acc, e) => acc + calcHours(e.startTime, e.endTime), 0);
    const pendingCount = filtered.filter((e) => e.status === "In process").length;

    const weekLabel = `${weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}`;

    // Hours per day for the mini week chart
    const hoursPerDay = weekDays.map((d) => {
        const key = d.toISOString().slice(0, 10);
        return entries.filter((e) => e.date === key).reduce((acc, e) => acc + calcHours(e.startTime, e.endTime), 0);
    });
    const maxDayHours = Math.max(...hoursPerDay, 8);

    return (
        <>
            <header className="px-8 py-6 border-b border-border flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                        Work hours
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{weekLabel}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
                        <button onClick={() => { setWeekOffset((w) => w - 1); setCurrentPage(1); }} className="px-2.5 py-1 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">‹</button>
                        <button onClick={() => { setWeekOffset(0); setCurrentPage(1); }} className="px-3 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors" style={{ fontFamily: "'DM Mono', monospace" }}>Today</button>
                        <button onClick={() => { setWeekOffset((w) => w + 1); setCurrentPage(1); }} className="px-2.5 py-1 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">›</button>
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
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Total</p>
                    <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{formatHours(totalHours)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">this week</p>
                </div>
                <div className="bg-card rounded-lg px-5 py-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Approved</p>
                    <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{formatHours(approvedHours)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">approved</p>
                </div>
                <div className="bg-card rounded-lg px-5 py-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>In process</p>
                    <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{pendingCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">registrations</p>
                </div>
                {/* Mini week bar chart */}
                <div className="bg-card rounded-lg px-5 py-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Each day</p>
                    <div className="flex items-end gap-1.5 h-10">
                        {weekDays.map((d, i) => {
                            const h = hoursPerDay[i];
                            const pct = maxDayHours > 0 ? (h / maxDayHours) * 100 : 0;
                            const isToday = d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full rounded-sm" style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: isToday ? "var(--primary)" : "var(--muted)", minHeight: h > 0 ? "4px" : "2px", opacity: h > 0 ? 1 : 0.3 }} title={`${["Ma","Di","Wo","Do","Vr","Za","Zo"][i]}: ${formatHours(h)}`} />
                                    <span className="text-[9px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{["Ma","Di","Wo","Do","Vr","Za","Zo"][i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="px-8 py-4 flex items-center gap-3 border-b border-border flex-wrap">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md pl-9 pr-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Find employee, project" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
                </div>
                <select className="bg-secondary text-secondary-foreground text-xs font-medium rounded-md px-3 py-1.5 border border-border focus:outline-none cursor-pointer" value={empFilter} onChange={(e) => { setEmpFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="All">All employees</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName + " " + e.lastName}</option>)}
                </select>
                <div className="flex items-center gap-2">
                    {(["All", "Approved", "In process", "Rejected"] as const).map((s) => (
                        <button key={s} onClick={() => { setStatusFilter(s as HourStatus | "All"); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{s}</button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-8 py-4">
                <table className="w-full border-collapse text-sm">
                    <thead>
                    <tr className="border-b border-border">
                        {([
                            ["date", "Date"], ["employeeId", "Employee"], ["project", "Project"],
                            ["startTime", "Time"], ["description", "Description"], ["status", "Status"],
                        ] as [keyof HourEntry, string][]).map(([key, label]) => (
                            <th key={key} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-widest cursor-pointer select-none hover:text-foreground transition-colors" style={{ fontFamily: "'DM Mono', monospace" }} onClick={() => handleSort(key)}>
                                <span
                                    className="inline-flex items-center gap-1">{label}{(sortKey === key ? (sortDir === "asc" ?
                                    <SortAscIcon/> : <SortDesc/>) : <></>)} :</span>
                            </th>
                        ))}
                        <th className="py-3 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>Acties</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr><td colSpan={7} className="py-16 text-center text-muted-foreground text-sm">Geen urenregistraties gevonden voor deze week.</td></tr>
                    )}
                    {paginated.map((entry, i) => {
                        const emp = employees.find((e) => e.id === entry.employeeId);
                        const hours = calcHours(entry.startTime, entry.endTime);
                        const StatusIcon = HOUR_STATUS_ICONS[entry.status];
                        return (
                            <tr key={entry.id} className={`border-b border-border/50 hover:bg-card/60 transition-colors group ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                                <td className="py-3.5 px-3 text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem" }}>
                                    <div>
                                        <p className="text-foreground font-medium" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem" }}>
                                            {new Date(entry.date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
                                        </p>
                                        <p style={{ fontSize: "0.75rem" }}>{new Date(entry.date + "T00:00:00").toLocaleDateString("nl-NL", { year: "numeric" })}</p>
                                    </div>
                                </td>
                                <td className="py-3.5 px-3">
                                    {emp && (
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${getAvatarColor(emp.firstName + " " + emp.lastName)}`}>{getInitials(emp.firstName + " " + emp.lastName)}</div>
                                            <div>
                                                <p className="font-medium text-foreground text-sm">{emp.firstName + " " + emp.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{emp.department}</p>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3.5 px-3">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{entry.project}</span>
                                </td>
                                <td className="py-3.5 px-3" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem" }}>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Timer className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{entry.startTime} – {entry.endTime}</span>
                                    </div>
                                    <p className="text-primary font-medium mt-0.5 text-xs">{formatHours(hours)}</p>
                                </td>
                                <td className="py-3.5 px-3 text-muted-foreground text-sm max-w-[200px] truncate">{entry.description || "—"}</td>
                                <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${HOUR_STATUS_COLORS[entry.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                        {entry.status}
                    </span>
                                </td>
                                <td className="py-3.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link to={"/timesheets/" + entry.id + "/edit"}
                                              className="p-1.5 rounded-md hover:bg-primary/15 hover:text-primary text-muted-foreground transition-colors"><Pencil
                                            className="w-3.5 h-3.5"/></Link>
                                        {(entry.status !== "Approved" ? <button
                                            className="p-1.5 rounded-md hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors">
                                            <Trash2 className="w-3.5 h-3.5"/></button>
                                            : <></>)}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
            <Pagination page={currentPage} total={filtered.length} onChange={setCurrentPage} />
    </>)
}

export default Timesheetlist