import React, { useState } from "react";
import { CheckIcon, CloseIcon } from "../components/Icons";

export default function IncomeModal({ onSave, onClose, editing }) {
  const [form, setForm] = useState(editing || {
    date: "",
    description: "",
    amount: ""
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <CloseIcon className="w-6 h-6 drop-shadow-sm hover:drop-shadow-lg" />
        </button>
        <h2 className="text-xl font-bold mb-6 text-green-700 flex items-center gap-2">
          <CheckIcon className="w-6 h-6 drop-shadow-sm hover:drop-shadow-lg" /> Add Income
        </h2>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="form-input w-full rounded-lg border-green-300 focus:border-green-500 focus:ring-green-500"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              className="form-input w-full rounded-lg"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount (€)</label>
            <input
              type="number"
              className="form-input w-full rounded-lg border-green-300 focus:border-green-500 focus:ring-green-500"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex gap-2 pt-4 justify-end">
            <button type="submit" className="btn btn-success shadow-md hover:shadow-lg">
              Save
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
