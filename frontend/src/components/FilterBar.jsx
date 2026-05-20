function FilterBar({ selectedFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All', icon: '∴' },
    { id: 'normal', label: 'Normal', icon: '◆' },
    { id: 'anomaly', label: 'Anomaly', icon: '⚠' },
    { id: 'critical', label: 'Critical', icon: '🚨' },
    { id: 'active', label: 'Active', icon: '●' },
    { id: 'acknowledged', label: 'Ack', icon: '✓' },
    { id: 'resolved', label: 'Resolved', icon: '✔' },
  ];

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
        Threat Filter
      </p>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-3 py-2 text-xs rounded-lg font-semibold uppercase tracking-[0.15em] transition-all duration-200 ${
              selectedFilter === filter.id
                ? 'border-cyan-400/60 bg-cyan-400/20 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                : 'border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <span className="mr-1">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FilterBar;
