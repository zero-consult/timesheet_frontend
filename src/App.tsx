import './App.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Provider} from "react-redux";
import store from "./redux/store.ts";
import ErrorMessagePopup from "./components/ErrorMessagePopup.tsx";

import './i18n';
import {useState} from "react";
import CollapsedMenu from "./components/CollapsedMenu.tsx";
import FullMenu from "./components/FullMenu.tsx";
import Timesheetlist from "./pages/Timesheetlist.tsx";
import SingleTimesheetEntry from "./pages/SingleTimesheetEntry.tsx";

function App() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Provider store={store}>
            <ErrorMessagePopup/>
            <BrowserRouter>
                <div className="min-h-screen flex" style={{fontFamily: "'DM Sans', sans-serif"}}>
                    {collapsed ?
                        <CollapsedMenu expand={() => setCollapsed(false)}/>
                        :
                        <FullMenu shrink={() => setCollapsed(true)}/>
                    }
                    {/* Page content */}
                    <main className={"flex-1 flex flex-col min-w-0 bg-background overflow-y-auto" + (collapsed ? " pl-15": " pl-60")}>
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
