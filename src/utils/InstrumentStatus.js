/**
 * Utility untuk manajemen status instrumen dan warna UI
 */

// Menentukan apakah instrumen siap menerima/menjalankan task berikutnya
export function isInstrumentReady(connectionStatus, instStatus) {
  const isConnected = (connectionStatus || '').toLowerCase() === 'connected';
  const status = (instStatus || '').toLowerCase();

  // Instrumen HANYA dianggap Ready kalau Connected DAN Idle.
  // Jika statusnya 'faulted', 'busy', atau 'disconnected', dianggap NOT READY -> Memicu ValidationInfoCard
  return isConnected && status === 'idle';
}

// Mendapatkan class warna teks berdasarkan status instrumen (Tailwind CSS)
export function getStatusColorClass(instStatus) {
  const status = (instStatus || '').toLowerCase();

  switch (status) {
    case 'idle':
      return 'text-emerald-400'; // Hijau (Ready)
    case 'faulted':
      return 'text-amber-400';   // Kuning (Faulted - Perlu aksi / Blocked dependency)
    case 'busy':
      return 'text-red-400';     // Merah (Busy)
    case 'disconnected':
      return 'text-gray-400';    // Abu-abu / Disconnected
    default:
      return 'text-gray-400';
  }
}

// Mendapatkan label status yang rapi untuk ditampilkan di UI
export function getStatusLabel(instStatus) {
  const status = (instStatus || '').toLowerCase();

  switch (status) {
    case 'idle':
      return 'Idle / Ready';
    case 'faulted':
      return 'Faulted';
    case 'busy':
      return 'Busy';
    case 'disconnected':
      return 'Disconnected';
    default:
      return instStatus || 'Unknown';
  }
}