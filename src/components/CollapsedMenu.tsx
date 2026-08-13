import {ArrowRightToLine, LogOut} from "lucide-react";
import {Route, Routes} from "react-router";
import NavigationList from "./NavigationList.tsx";
import LanguageSwitcher from "./LanguageSwitcher.tsx";
import {useDispatch, useSelector} from "react-redux";
import {logout, selectUser} from "../redux/account.slice.ts";
import {getInitials} from "../utils/NameUtils.ts";

export type CollapsedMemuProps = {
    expand: () => void;
}

function CollapsedMemu(props: CollapsedMemuProps) {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    function doLogout() {
        dispatch(logout());
        window.location.href = import.meta.env.VITE_PEOPLE_FRONTEND_URL;
    }

    return <>
        {/* Sidebar */}
        <aside
            className="fixed bottom-0 h-full w-15 shrink-0 overflow-hidden flex flex-col bg-sidebar border-r border-sidebar-border overflow-y-auto">
            <div className="flex border-b h-15 border-sidebar-border">
                <div className={"px-5 py-6 flex items-center gap-2.5"}>
                    <ArrowRightToLine className="w-5 h-5 cursor-pointer" onClick={() => props.expand()}/>
                </div>
            </div>


            <nav className="flex-1 px-2 py-4 space-y-0.5">
                <Routes>
                    <Route path="/" element={<NavigationList compact={true} active="timesheets"/>}/>
                    <Route path="/timesheets/*" element={<NavigationList compact={true} active="timesheets"/>}/>
                    <Route path="/timesheets" element={<NavigationList compact={true} active="timesheets"/>}/>
                </Routes>
            </nav>

            <div>
                <div className="py-4 border-t border-sidebar-border">
                    <div className="flex h-10 items-center gap-3 px-4 py-2.5 mb-1">
                        <div
                            className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">{getInitials(user!.firstName + " " + user!.lastName)}
                        </div>
                    </div>
                    <button
                        onClick={() => doLogout()}
                        className="w-9 h-10 flex items-center gap-3 ml-3 pl-2 py-2 rounded-md text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                        <LogOut className="w-4 h-4"/>
                    </button>
                </div>
                <LanguageSwitcher compact={true}/>
            </div>
        </aside>
    </>
}

export default CollapsedMemu;