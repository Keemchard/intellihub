import { Icon } from "@/components/shared/icon";

function SeeMoreButton({
  onClick,
  isFetching,
}: {
  onClick: () => void;
  isFetching: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isFetching}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
    >
      {isFetching ? (
        <Icon name="loader" size={16} className="animate-spin" />
      ) : (
        <Icon name="chevron-down" size={16} />
      )}
      {isFetching ? "Loading…" : "See more"}
    </button>
  );
}

export default SeeMoreButton;
