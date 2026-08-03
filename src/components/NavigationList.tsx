import {Link} from "react-router";
import {Briefcase, Clock, FileText, Receipt, Users} from "lucide-react";
import {useTranslation} from "react-i18next";

export type NavigationListProps = {
    active: string;
    compact: boolean;
}

const PERSONNEL_NAV: LinkProps[] = [
    {
        name: "employees",
        url: import.meta.env.VITE_PEOPLE_FRONTEND_URL + "/employees",
        icon: Users,
        label: "menu.employees",
    },
    {
        name: "timesheets",
        url: "/timesheets",
        icon: Clock,
        label: "menu.timesheets",
    },
    {
        name: "payslips",
        url: import.meta.env.VITE_INVOICES_FRONTEND_URL + "/payslips",
        icon: FileText,
        label: "menu.payslips",
    }
]

const FINANCIAL_NAV: LinkProps[] = [
    {
        name: "customers",
        url: import.meta.env.VITE_PEOPLE_FRONTEND_URL + "/customers",
        icon: Briefcase,
        label: "menu.customers",
    },
    {
        name: "invoices",
        url: import.meta.env.VITE_INVOICES_FRONTEND_URL + "/invoices",
        icon: Receipt,
        label: "menu.invoices",
    }
]

type LinkProps = {
    compact?: boolean
    active?: boolean
    name: string;
    url: string;
    icon: React.ElementType;
    label: string;
}

function SingleLink(linkInfo: LinkProps) {
    const {t} = useTranslation();

    return <Link
        key={linkInfo.name}
        to={linkInfo.url}
        className={`w-full flex items-center h-10 gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer
      ${
            linkInfo.active
                ? "bg-primary/15 text-primary font-medium"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        }`}>
        <linkInfo.icon className="ml-0.5 w-4 h-4 shrink-0"/>
        {linkInfo.compact ? '' : t("menu." + linkInfo.name)}
    </Link>
}

function NavigationList(props: NavigationListProps) {
    const {t} = useTranslation();

    return <>
        <p className="pl-3 pr-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">{props.compact ? t("menu.per") : t("menu.personnel")}</p>
        {PERSONNEL_NAV.map((linkInfo) => SingleLink({...linkInfo, compact: props.compact, active: props.active === linkInfo.name}))}
        <p className="pl-3 pr-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">{props.compact ? t("menu.fin") : t("menu.financial")}</p>
        {FINANCIAL_NAV.map((linkInfo) => SingleLink({...linkInfo, compact: props.compact, active: props.active === linkInfo.name}))}
    </>
}

export default NavigationList;