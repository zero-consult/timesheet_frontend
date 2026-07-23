import {useTranslation} from "react-i18next";
import {ArrowLeftToLine, Building2, LogOut} from "lucide-react";
import {Route, Routes} from "react-router";
import NavigationList from "./NavigationList.tsx";
import LanguageSwitcher from "./LanguageSwitcher.tsx";

export type FullMenuProps = {
    shrink: () => void;
}

function FullMenu(props: FullMenuProps) {
    const {t} = useTranslation();

    return <>
        {/* Sidebar */}
        <aside
            className="fixed bottom-0 h-full w-60 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border overflow-y-auto">
            <div className="flex border-b h-15 border-sidebar-border">
                <div className="flex-1 px-6 py-5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white"/>
                    </div>
                    <span className="text-sidebar-foreground font-semibold text-sm tracking-wide"
                          style={{fontFamily: "'Instrument Sans', sans-serif"}}>
                                Zero Consult
                            </span>
                </div>
                <div className={"pr-6 py-5 flex items-center gap-2.5"}>
                    <ArrowLeftToLine className="w-5 h-5 cursor-pointer" onClick={() => props.shrink()}/>
                </div>
            </div>


            <nav className="flex-1 px-2 py-4 space-y-0.5">
                <Routes>
                    <Route path="/" element={<NavigationList compact={false} active="timesheets"/>}/>
                    <Route path="/timesheets/*" element={<NavigationList compact={false} active="timesheets"/>}/>
                    <Route path="/timesheets" element={<NavigationList compact={false} active="timesheets"/>}/>
                </Routes>
            </nav>

            <div>
                <div className="px-3 py-4 border-t border-sidebar-border">
                    <div className="flex h-10 items-center gap-3 px-1 py-2.5 mb-1">
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
                        className="w-full h-10 flex items-center gap-3 px-2 py-2 rounded-md text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                        <LogOut className="w-4 h-4"/> {t('menu.logout')}
                    </button>
                </div>
                <LanguageSwitcher compact={false}/>
            </div>
        </aside>
    </>
}

export default FullMenu;