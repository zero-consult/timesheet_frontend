import './App.css'
import {Building2, LogOut} from "lucide-react";
import {BrowserRouter, Route, Routes} from "react-router";
import {Provider} from "react-redux";
import store from "./redux/store.ts";
import Timesheetlist from "./pages/Timesheetlist.tsx";
import SingleTimesheetEntry from "./pages/SingleTimesheetEntry.tsx";
import ErrorMessagePopup from "./components/ErrorMessagePopup.tsx";

import './i18n';
import NavigationList from "./components/NavigationList.tsx";
import LanguageSwitcher from "./components/LanguageSwitcher.tsx";
import {useTranslation} from "react-i18next";

function App() {
    const {t} = useTranslation();
    return (
        <Provider store={store}>
            <ErrorMessagePopup/>
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

                        <div className="fixed bottom-0 w-60">
                            <div className="px-3 py-4 border-t border-sidebar-border">
                                <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
                                    <div
                                        className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">JD
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-sidebar-foreground truncate">Jan de
                                            Groot</p>
                                        <p className="text-xs text-sidebar-foreground/40 truncate">Admin</p>
                                    </div>
                                </div>
                                <button
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                                    <LogOut className="w-4 h-4"/> {t('menu.logout')}
                                </button>
                            </div>
                            <LanguageSwitcher/>
                        </div>
                    </aside>

                    {/* Page content */}
                    <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
                        {/* Routes */}
                        <Routes>
                            <Route path="/" element={<Timesheetlist/>}/>
                            <Route path="/timesheets" element={<Timesheetlist/>}/>
                            <Route path="/timesheets/add" element={<SingleTimesheetEntry/>}/>
                            <Route path="/timesheets/:timesheetEntryId/edit" element={<SingleTimesheetEntry/>}/>
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </Provider>
    )
}

export default App
