import { getLevelColor } from "../utils/tableConfig";

export default function MetricCell({ value, label, format, config }) {
  const formattedValue = format(value);
  const color = config ? getLevelColor(value, config) : "text-slate-300";

  return (
    <div className="text-center">
      <p className="text-[9px] text-slate-400 uppercase font-semibold">{label}</p>
      <p className={`mt-0.5 text-xs font-semibold ${color}`}>{formattedValue}</p>
    </div>
  );
}
