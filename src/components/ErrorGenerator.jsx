import React, { useState } from 'react';
import { X, Play } from 'lucide-react';

export default function ErrorGenerator({ isOpen, onClose, onStartSimulation }) {
  const [selectedInst, setSelectedInst] = useState('BlueWasher');
  const [errorCategory, setErrorCategory] = useState('Instrument Error');
  const [isLastTask, setIsLastTask] = useState(false);
  const [nextInst, setNextInst] = useState('STACK');
  const [nextInstStatus, setNextInstStatus] = useState('Idle');
  const [nextConnStatus, setNextConnStatus] = useState('Connected');

  if (!isOpen) return null;

  // Handler saat Faulted Instrument berubah
  const handleFaultedInstChange = (e) => {
    const newInst = e.target.value;
    setSelectedInst(newInst);

    if (newInst === 'STACK') {
      // Jika STACK, ubah nextInst ke opsi valid pertama selain STACK
      if (nextInst === 'STACK') {
        setNextInst('BlueWasher');
      }
    } else {
      // Jika Non-STACK, paksa nextTarget menjadi STACK
      setNextInst('STACK');
    }
  };

  const handleStart = () => {
    onStartSimulation({
      instrument: selectedInst,
      errorCategory,
      isLastTask: isLastTask,
      nextInstrument: isLastTask ? 'NONE' : nextInst,
      nextInstStatus,
      nextInstConnectionStatus: nextConnStatus,
    });
    onClose();
  };

  const isFaultedStack = selectedInst === 'STACK';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
        <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Error Simulation Generator</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs text-gray-700 max-h-[80vh] overflow-y-auto">
          {/* Target Instrument */}
          <div>
            <label className="block font-semibold mb-1 text-gray-800">Faulted Instrument</label>
            <select
              value={selectedInst}
              onChange={handleFaultedInstChange}
              className="w-full border border-gray-300 rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="BlueWasher">BlueWasher</option>
              <option value="MANTIS">MANTIS</option>
              <option value="TECAN">TECAN</option>
              <option value="STACK">STACK</option>
            </select>
          </div>

          {/* Error Category */}
          <div>
            <label className="block font-semibold mb-1 text-gray-800">Error Type</label>
            <select
              value={errorCategory}
              onChange={(e) => setErrorCategory(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Instrument Error">Instrument Error (Hardware/Task Fault)</option>
              <option value="Instrument Disconnect">Instrument Disconnect (Offline)</option>
            </select>
          </div>

          <hr className="border-gray-200 my-2" />

          {/* Is Last Task Toggle */}
          <div className="flex items-center space-x-2 bg-blue-50 p-2.5 rounded border border-blue-100">
            <input
              type="checkbox"
              id="isLastTask"
              checked={isLastTask}
              onChange={(e) => setIsLastTask(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isLastTask" className="font-semibold text-blue-900 cursor-pointer select-none">
              Is Last Task in Protocol?
            </label>
          </div>

          {/* Next Target Instrument Config */}
          {!isLastTask && (
            <div className="space-y-3 pl-2 border-l-2 border-blue-300">
              <div>
                <label className="block font-semibold mb-1 text-gray-800">Next Target Instrument</label>
                <select
                  value={nextInst}
                  onChange={(e) => setNextInst(e.target.value)}
                  disabled={!isFaultedStack}
                  className={`w-full border border-gray-300 rounded p-2 text-xs outline-none ${
                    !isFaultedStack ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
                  }`}
                >
                  {isFaultedStack ? (
                    <>
                      <option value="BlueWasher">BlueWasher</option>
                      <option value="MANTIS">MANTIS</option>
                      <option value="TECAN">TECAN</option>
                    </>
                  ) : (
                    <option value="STACK">STACK</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-gray-800">Next Inst. Status</label>
                  <select
                    value={nextInstStatus}
                    onChange={(e) => setNextInstStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white outline-none"
                  >
                    <option value="Idle">Idle (Ready)</option>
                    <option value="Running">Running (Busy)</option>
                    <option value="Faulted">Faulted</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-800">Next Connection</label>
                  <select
                    value={nextConnStatus}
                    onChange={(e) => setNextConnStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white outline-none"
                  >
                    <option value="Connected">Connected</option>
                    <option value="Disconnected">Disconnected</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
}