import './App.css'
import {Briefcase, Building2, Clock, LogOut, Users} from "lucide-react";
import {BrowserRouter, Link, Route, Routes} from "react-router";
import {Provider} from "react-redux";
import store from "./redux/store.ts";
import Timesheetlist from "./pages/Timesheetlist.tsx";

function NavigationList({active}: { active: string }) {
    return (<><Link
        key={"Employees"}
        to={import.meta.env.VITE_PEOPLE_FRONTEND_URL + "/employees"}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer
      ${
            active === "employees"
                ? "bg-primary/15 text-primary font-medium"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        }`}>
        <Users className="w-4 h-4 shrink-0"/>
        Employees
    </Link>
        <Link
            key={"Customers"}
            to={import.meta.env.VITE_PEOPLE_FRONTEND_URL + "/customers"}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer
      ${
                active === "customers"
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}>
            <Briefcase className="w-4 h-4 shrink-0"/>
            Customers
        </Link>
        <Link
            key={"Timesheets"}
            to={"/timesheets"}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer
      ${
                active === "timesheets"
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}>
            <Clock className="w-4 h-4 shrink-0"/>
            Timesheets
        </Link>
    </>)
}

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <div className="min-h-screen flex" style={{fontFamily: "'DM Sans', sans-serif"}}>
                    {/* Sidebar */}
                    <aside
                        className="w-60 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border overflow-y-auto">
                        <div className="px-6 py-5 border-b border-sidebar-border">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-white"/>
                                </div>
                                <span className="text-sidebar-foreground font-semibold text-sm tracking-wide"
                                      style={{fontFamily: "'Instrument Sans', sans-serif"}}>
                                Zero Consult
                            </span>
                            </div>
                        </div>


                        <nav className="flex-1 px-3 py-4 space-y-0.5">
                            <Routes>
                                <Route path="/" element={<NavigationList active="timesheets"/>}/>
                                <Route path="/timesheets/*" element={<NavigationList active="timesheets"/>}/>
                                <Route path="/timesheets" element={<NavigationList active="timesheets"/>}/>
                            </Routes>
                        </nav>

                        <div className="px-3 py-4 border-t border-sidebar-border">
                            <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
                                <div
                                    className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">JD
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-sidebar-foreground truncate">Jan de Groot</p>
                                    <p className="text-xs text-sidebar-foreground/40 truncate">Admin</p>
                                </div>
                            </div>
                            <button
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                                <LogOut className="w-4 h-4"/> Log out
                            </button>
                        </div>
                    </aside>

                    {/* Page content */}
                    <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
                        {/* Routes */}
                        <Routes>
                            <Route path="/" element={<Timesheetlist/>}/>
                            <Route path="/timesheets" element={<Timesheetlist/>}/>
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </Provider>
    )
}

export default App
