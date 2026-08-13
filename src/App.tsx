import './App.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {useSelector} from "react-redux";
import ErrorMessagePopup from "./components/ErrorMessagePopup.tsx";

import './i18n';
import {useEffect, useState} from "react";
import CollapsedMenu from "./components/CollapsedMenu.tsx";
import FullMenu from "./components/FullMenu.tsx";
import Timesheetlist from "./pages/Timesheetlist.tsx";
import SingleTimesheetEntry from "./pages/SingleTimesheetEntry.tsx";
import {selectUser} from "./redux/account.slice.ts";

function App() {
    const [collapsed, setCollapsed] = useState(false);
    const user = useSelector(selectUser);

    useEffect(() => {
        if (typeof user === "undefined") {
            window.location.href = import.meta.env.VITE_PEOPLE_FRONTEND_URL;
        }
    }, [])

    if (typeof user === "undefined") {
        return <></>
    } else {
        return <>
            <ErrorMessagePopup/>
            <BrowserRouter>
                <div className="min-h-screen flex" style={{fontFamily: "'DM Sans', sans-serif"}}>
                    {collapsed ?
                        <CollapsedMenu expand={() => setCollapsed(false)}/>
                        :
                        <FullMenu shrink={() => setCollapsed(true)}/>
                    }
                    {/* Page content */}
                    <main
                        className={"flex-1 flex flex-col min-w-0 bg-background overflow-y-auto" + (collapsed ? " pl-15" : " pl-60")}>
                        {/* Routes */}
                        <Routes>
                            <Route path="/timesheets" element={<Timesheetlist/>}/>
                            <Route path="/timesheets/timesheets" element={<Timesheetlist/>}/>
                            <Route path="/timesheets/timesheets/add" element={<SingleTimesheetEntry/>}/>
                            <Route path="/timesheets/timesheets/:timesheetEntryId/edit" element={<SingleTimesheetEntry/>}/>
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </>
    }
}

export default App
