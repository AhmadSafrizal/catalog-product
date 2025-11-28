"use client";
import React from 'react';

export default function ConfirmModal({ open, title = 'Konfirmasi', message = '', confirmText = 'Hapus', cancelText = 'Batal', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>{cancelText}</button>
          <button className="btn btn-error" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel} />
    </div>
  );
}
