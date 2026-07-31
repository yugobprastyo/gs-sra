import React from 'react';
import { Info } from 'lucide-react';

export default function UserActionCard({ event, onActionConfirm }) {
  if (!event) return null;

  const runName = event.runName || 'Run 1 (1)';
  const instName = event.instName || 'MANTIS';
  const taskName = event.taskName || 'Dispense';
  const errorType = event.errorType || 'Faulted Error';

  const startTime = event.startTime || `${event.date || '12-09-2026'} ${event.time || '02:30:00 pm'}`;
  const estEndTime = event.estEndTime || `${event.date || '12-09-2026'} 02:40:00 pm`;

  return (
    <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-3 font-sans">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <Info className="w-6 h-6 text-blue-500 fill-blue-500 text-white shrink-0" />
        <h3 className="text-base font-semibold text-gray-800 leading-none">
          {event.title || "User Action - Run Blocked"}
        </h3>
      </div>

      {/* Sub-header */}
      <div className="mt-2.5 pl-8">
        <p className="text-sm font-medium text-gray-700">
          {instName} : {taskName}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-gray-500">
          <div>
            <span className="font-semibold text-gray-700 block">Start Time :</span>
            <span>{startTime}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700 block">Est. End Time :</span>
            <span>{estEndTime}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 pl-8">
        <p className="text-sm text-gray-600 leading-snug">
          <strong className="font-semibold text-gray-800">{runName}</strong> has encountered an error (<strong className="font-semibold text-gray-800">{instName} : {errorType}</strong>) and is currently blocked. Action required.
        </p>
      </div>

      {/* Footer CTA */}
      <div className="mt-5 pl-8 pt-3 border-t border-gray-100 flex items-center justify-between">
        {/* Abort Action */}
        <button
          type="button"
          onClick={() => onActionConfirm && onActionConfirm('ABORT', event)}
          className="px-3.5 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Abort
        </button>

        <div className="flex items-center space-x-2">
          {/* Retry Action */}
          <button
            type="button"
            onClick={() => onActionConfirm && onActionConfirm('RETRY', event)}
            className="px-3.5 py-1.5 border border-amber-400 text-amber-700 hover:bg-amber-50 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Retry
          </button>
          
          {/* Skip Action */}
          <button 
            type="button"
  onClick={() => onActionConfirm && onActionConfirm('SKIP', event)}
  className="px-3.5 py-1.5 border border-amber-400 text-amber-700 hover:bg-amber-50 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}