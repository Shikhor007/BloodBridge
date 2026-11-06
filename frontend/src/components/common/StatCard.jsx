import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blood', trend }) {
  const colorMap = {
    blood: 'bg-blood-50 text-blood-700 border-blood-100',
    navy: 'bg-navy-50 text-navy-800 border-navy-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-xl border ${colorMap[color] || colorMap.blood}`}>
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className={trend.isPositive ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
}
