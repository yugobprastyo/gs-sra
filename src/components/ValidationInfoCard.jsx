import React from 'react';
import { Info } from 'lucide-react';

export default function ValidationInfoCard({ event }) {
  if (!event) return null;

  const runName = event.runName || 'Run 1 (2)';
  const reasonHeader = event.reasonHeader || 'Run Blocked';
  const errorType = event.errorType || 'Faulted/Error';
  const instName = event.instName || 'Primary Instrument';
  const taskName = event.taskName || 'Next Protocol';
  const title = event.title || 'Validation Info - Run Blocked';

  return (
    <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-3 font-sans">
      {/* Header: Icon Info & Judul Utama */}
      <div className="flex items-center space-x-2.5">
        <Info className="w-6 h-6 text-blue-500 fill-blue-500 text-white shrink-0" />
        <h3 className="text-base font-semibold text-gray-800 leading-none">
          {title}
        </h3>
      </div>

      {/* Sub-header: Inst_name : Task_name & Timestamp */}
      <div className="mt-2.5 pl-8">
        <p className="text-sm font-medium text-gray-700">
          {instName} : {taskName}
        </p>
        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
          <span>{event.date || '12-09-2026'}</span>
          <span>{event.time || '02:30:00 pm'}</span>
        </div>
      </div>

      {/* Body: Reason Header & Dynamic Template Text */}
      <div className="mt-4 pl-8 space-y-1">
        <h4 className="text-sm font-semibold text-gray-800">
          {reasonHeader}
        </h4>
        <p className="text-sm text-gray-600 leading-snug">
          {runName} is temporarily blocked due to a dependency error: ({instName} : {errorType}). Execution will resume once the main issue is resolved.
        </p>
      </div>
    </div>
  );
}