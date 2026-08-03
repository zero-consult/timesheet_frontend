import {ChevronDown, ChevronUp} from "lucide-react";

export type SortIconProps = {
    active: boolean;
    dir: "asc" | "desc"
}

function SortIcon({ active, dir }: SortIconProps) {
    if (!active) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return dir === "asc"
        ? <ChevronUp className="w-3 h-3 text-primary" />
        : <ChevronDown className="w-3 h-3 text-primary" />;
}

export default SortIcon;