import React, { useState, useEffect } from 'react';
import { X, AlertOctagon, Play } from 'lucide-react';

export default function ErrorGenerator({ isOpen, onClose, onStartSimulation }) {
  const [selectedInst, setSelectedInst] = useState('BlueWasher');
  const [errorCategory, setErrorCategory] = useState('Instrument Error');
  
  // Next Instrument State
  const [nextInst, setNextInst] = useState('STACK');
  const [nextConnStatus, setNextConnStatus] = useState('Connected');
  const [nextStatusState, setNextStatusState] = useState('Idle');

  // Sync Next Instrument secara otomatis saat Primary Instrument berubah
  useEffect(() => {
    if (selectedInst === 'STACK') {
      setNextInst('BlueWasher');
    } else {
      setNextInst('STACK');
    }
  }, [selectedInst]);

  if (!isOpen) return null;

  const handleSimulate = () => {
    // 1. Tentukan status instrumen utama berdasarkan kategori error
    const primaryInstStatus = errorCategory === 'Instrument Error' ? 'Faulted' : 'Disconnected';
    const primaryConnectionStatus = errorCategory === 'Instrument Disconnect' ? 'Disconnected' : 'Connected';

    // 2. Deteksi apakah target yang dipilih adalah Last Task / End of Workflow
    const isLastTask = nextInst === 'NONE';

    // 3. Kirim payload lengkap ke App.jsx
    if (onStartSimulation) {
      onStartSimulation({
        instrument: selectedInst,
        errorCategory,
        primaryInstStatus,
        connectionStatus: primaryConnectionStatus,
        
        // Kirim null / 'NONE' dan flag isLastTask
        isLastTask: isLastTask,
        nextInstrument: isLastTask ? null : nextInst,
        nextInstConnectionStatus: isLastTask ? 'Connected' : nextConnStatus,
        nextInstStatus: isLastTask ? 'Idle' : nextStatusState,
      });
    }
    
    onClose();
  };

  const isPrimaryStack = selectedInst === 'STACK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-md border border-gray-200 text-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-900">Error Scenario Generator</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Faulty Primary Instrument */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Faulty Primary Instrument</label>
            <select
              value={selectedInst}
              onChange={(e) => setSelectedInst(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
            >
              <option value="BlueWasher">BlueWasher</option>
              <option value="MANTIS">MANTIS</option>
              <option value="TECAN">TECAN</option>
              <option value="STACK">STACK</option>
            </select>
          </div>

          {/* Error Category */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Error Category</label>
            <select
              value={errorCategory}
              onChange={(e) => setErrorCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="Instrument Error">Instrument Error (Primary Status: Faulted)</option>
              <option value="Instrument Disconnect">Instrument Disconnect (Primary Status: Disconnected)</option>
            </select>
          </div>

          <hr className="border-gray-200 my-2" />
          <span className="font-bold text-gray-800 block text-xs">Configure Next Instrument Target State</span>

          {/* Next Target Instrument Select */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Next Instrument Target
            </label>

            <select
              value={nextInst}
              onChange={(e) => setNextInst(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
            >
              {isPrimaryStack ? (
                <>
                  <option value="BlueWasher">BlueWasher</option>
                  <option value="MANTIS">MANTIS</option>
                  <option value="TECAN">TECAN</option>
                </>
              ) : (
                <option value="STACK">STACK (Auto Transfer Target)</option>
              )}
              {/* OPSI UNTUK SIMULASI LAST TASK */}
              <option value="NONE" className="font-semibold text-amber-700">
                🛑 None (End of Workflow / Last Task)
              </option>
            </select>
          </div>

          {/* Next Target Status States (Hanya tampil jika bukan Last Task) */}
          {nextInst !== 'NONE' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Connection</label>
                <select
                  value={nextConnStatus}
                  onChange={(e) => setNextConnStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white"
                >
                  <option value="Connected">Connected</option>
                  <option value="Disconnected">Disconnected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status State</label>
                <select
                  value={nextStatusState}
                  onChange={(e) => setNextStatusState(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white"
                >
                  <option value="Idle">Idle (Green - Ready)</option>
                  <option value="Faulted">Faulted (Yellow - Cause Block)</option>
                  <option value="Busy">Busy (Red - Not Ready)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
              💡 <strong>Simulasi Last Task:</strong> Tidak ada instrumen berikutnya. Melewatkan task ini akan menandai run sebagai selesai.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 bg-gray-50 border-t border-gray-100 rounded-b-md">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded font-semibold text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSimulate}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Simulation</span>
          </button>
        </div>

      </div>
    </div>
  );
}