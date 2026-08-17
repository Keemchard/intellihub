import { Icon } from "@/components/shared/icon";
import type { DSSearchIndexRow } from "@/features/bigquery/use-bigquery";
import entityHref from "../utils/entityHref";
import Link from "next/link";
import { ENTITY_ICONS } from "../marketplace-client";
import { pickColor } from "@/lib/bigquery-mappers";

function SearchResultRow({ r }: { r: DSSearchIndexRow }) {
  return (
    <Link
      href={entityHref(r)}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{
          background: `${pickColor(r.entity_type)}1a`,
          color: pickColor(r.entity_type),
        }}
      >
        <Icon name={ENTITY_ICONS[r.entity_type ?? ""] ?? "search"} size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-900">
          {r.title}
        </div>
        {r.subtitle && (
          <div className="truncate text-xs text-slate-500">{r.subtitle}</div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {r.certification_status && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            {r.certification_status}
          </span>
        )}
        {r.entity_type && (
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
            {r.entity_type.replace(/_/g, " ")}
          </span>
        )}
        <Icon name="arrow-right" size={15} className="text-slate-400" />
      </div>
    </Link>
  );
}

export default SearchResultRow;
