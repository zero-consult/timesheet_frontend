import {Link} from "react-router";
import {Briefcase, Clock, Users} from "lucide-react";
import {useTranslation} from "react-i18next";

function NavigationList({active}: { active: string}) {
    const { t } = useTranslation();

    return (<><Link
        key={"Employees"}
        to={import.meta.env.VITE_PEOPLE_FRONTEND_URL +"/employees"}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer
      ${
            active === "employees"
                ? "bg-primary/15 text-primary font-medium"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        }`}>
        <Users className="w-4 h-4 shrink-0" />
        {t("menu.employees")}
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
            <Briefcase className="w-4 h-4 shrink-0" />
            {t("menu.customers")}
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
            {t("menu.timesheets")}
        </Link></>)
}

export default NavigationList;