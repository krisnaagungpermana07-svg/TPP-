import React from 'react';

/**
 * Renders the classic PEEPL / Sikap Kerja Kecermatan Missing Character stimulus:
 * Top strip: 5 reference characters coded A, B, C, D, E.
 * Bottom strip: 4 characters shown — candidate identifies which 1 character is missing.
 */
export default function MissingCharPanel({ missingCharData }) {
  if (!missingCharData) return null;
  const { refs = [], shown = [] } = missingCharData;

  return (
    <div className="my-4 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-navy-700 mb-2">
          Kolom Acuan (5 Karakter — Kode A sampai E)
        </div>
        <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
          {refs.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border-2 border-navy-200 bg-white overflow-hidden shadow-sm text-center"
            >
              <div className="bg-navy-900 text-white text-xs font-bold py-1 font-mono">{r.id}</div>
              <div className="py-3 text-2xl sm:text-3xl font-extrabold font-mono text-navy-950 select-none">
                {r.char}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center mb-2">
          Soal — 4 Karakter Tampil (Cari 1 Karakter yang Hilang!)
        </div>
        <div className="flex items-center justify-center gap-3">
          {shown.map((ch, idx) => (
            <div
              key={idx}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-amber-50/70 border-2 border-amber-300 flex items-center justify-center text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 shadow-sm select-none"
            >
              {ch}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
