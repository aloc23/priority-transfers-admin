// ActivityList: displays a list of recent activities
import React from 'react';

export default function ActivityList({ activities }) {
  return (
    <section aria-label="Recent Activity" className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <h2 className="text-base font-semibold text-slate-900 mb-2">Recent Activity</h2>
      <ul className="divide-y divide-slate-100">
        {activities.length === 0 ? (
          <li className="py-2 text-slate-500">No recent activity.</li>
        ) : (
          activities.map((activity, idx) => (
            <li key={idx} className="py-2 flex items-center gap-2">
              {/* You can add an icon or status here if needed */}
              <span className="text-sm text-slate-700">{activity.description}</span>
              <span className="ml-auto text-xs text-slate-400">{activity.date}</span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
