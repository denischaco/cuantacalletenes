import React, { useState } from 'react';
import { Lock, Unlock, X, KeyRound, AlertCircle } from 'lucide-react';

export default function PinModal({ isOpen, onClose, onUnlock, expectedPin = '1984', sponsorName = 'el local' }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === String(expectedPin)) {
          onUnlock();
          setPin('');
          onClose();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-sm">PIN de Seguridad</h3>
              <p className="text-[10px] text-slate-400">Desbloquear edición de {sponsorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Indicadores de PIN */}
        <div className="text-center py-2 space-y-2">
          <p className="text-xs text-slate-300">
            Ingresá el PIN de 4 dígitos del dueño para habilitar modificaciones:
          </p>
          <div className="flex justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    error
                      ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-500/50'
                      : isFilled
                      ? 'bg-amber-400 scale-110 shadow-lg shadow-amber-400/50'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              );
            })}
          </div>
          {error && (
            <p className="text-xs text-rose-400 font-bold flex items-center justify-center gap-1 animate-shake">
              <AlertCircle className="w-3.5 h-3.5" /> PIN incorrecto
            </p>
          )}
        </div>

        {/* Teclado Numérico */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              className="py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-white font-mono font-bold text-lg border border-slate-700/60 shadow transition-all cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 text-xs font-bold border border-slate-800 transition-colors cursor-pointer"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-white font-mono font-bold text-lg border border-slate-700/60 shadow transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 text-xs font-bold border border-slate-800 transition-colors cursor-pointer"
          >
            ← Borrar
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-500 pt-1">
          (PIN por defecto de prueba: <span className="font-mono text-amber-400 font-bold">{expectedPin}</span>)
        </p>
      </div>
    </div>
  );
}
