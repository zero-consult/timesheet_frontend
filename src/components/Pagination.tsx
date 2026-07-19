import {ChevronDown, ChevronUp} from "lucide-react";
import {useTranslation} from "react-i18next";

export const PAGE_SIZE = 5;

export type PaginationProps = {
    page: number;
    total: number;
    onChange: (page: number) => void;
}

function Pagination({ page, total, onChange }: PaginationProps) {
    const {t} = useTranslation()

    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (pages <= 1) return null;

    const getRange = () => {
        const delta = 1;
        const range: (number | "…")[] = [];
        for (let i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
                range.push(i);
            } else if (range[range.length - 1] !== "…") {
                range.push("…");
            }
        }
        return range;
    };

    return (
        <div className="flex items-center justify-between px-8 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                {t('pagination.of', {from: Math.min((page - 1) * PAGE_SIZE + 1, total), until: Math.min(page * PAGE_SIZE, total), total: total})}
            </p>
            <div className="flex items-center gap-1">
                <button
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                    className="px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronUp className="w-4 h-4 -rotate-90" />
                </button>
                {getRange().map((item, i) =>
                    item === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-muted-foreground">…</span>
                    ) : (
                        <button
                            key={item}
                            onClick={() => onChange(item as number)}
                            className={`min-w-[2rem] px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                page === item
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                        >
                            {item}
                        </button>
                    )
                )}
                <button
                    disabled={page === pages}
                    onClick={() => onChange(page + 1)}
                    className="px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
            </div>
        </div>
    );
}

export default Pagination;