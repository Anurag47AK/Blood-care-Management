import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  requiresReason = false,
  reasonPlaceholder = 'Please enter a justification or reason...',
  onConfirm,
  onClose
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) {
      setError('A mandatory reason is required to proceed.');
      return;
    }
    setError('');
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setError('');
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-slate-100">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>

        <p className="text-sm text-slate-600 mb-4">{message}</p>

        {requiresReason && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Remarks (Required):
            </label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={reasonPlaceholder}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blood-500 focus:border-blood-500 outline-none"
            />
            {error && <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-xl text-sm transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-white font-semibold rounded-xl text-sm transition-all shadow-sm ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-blood-600 hover:bg-blood-700 shadow-blood-600/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
