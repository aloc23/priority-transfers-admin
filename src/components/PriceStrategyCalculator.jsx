import React, { useState, useEffect } from "react";

export default function PriceStrategyCalculator({ onChange }) {
  const [inputs, setInputs] = useState({
    markupPercent: 40,
    baseFee: 58,
    minimumCharge: 116,
    totalCosts: 0
  });
  const [results, setResults] = useState({
    markup: 0,
    subtotal: 0,
    finalPrice: 0,
    profit: 0,
    profitMargin: 0
  });

  useEffect(() => {
    const { markupPercent, baseFee, minimumCharge, totalCosts } = inputs;
    const markup = totalCosts * (markupPercent / 100);
    const subtotal = totalCosts + markup + baseFee;
    const finalPrice = Math.max(subtotal, minimumCharge);
    const profit = finalPrice - totalCosts;
    const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;
    setResults({ markup, subtotal, finalPrice, profit, profitMargin });
    if (onChange) onChange({ ...inputs, ...results });
  }, [inputs]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Price Strategy Calculator</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Markup % (on costs)</label>
          <input type="number" value={inputs.markupPercent} onChange={e => setInputs({ ...inputs, markupPercent: Number(e.target.value) })} className="w-full p-2 border rounded" min="0" max="200" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Base Fee (€)</label>
          <input type="number" value={inputs.baseFee} onChange={e => setInputs({ ...inputs, baseFee: Number(e.target.value) })} className="w-full p-2 border rounded" min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Minimum Charge (€)</label>
          <input type="number" value={inputs.minimumCharge} onChange={e => setInputs({ ...inputs, minimumCharge: Number(e.target.value) })} className="w-full p-2 border rounded" min="0" />
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded mb-4">
        <div className="flex justify-between mb-2">
          <span>Markup</span>
          <span>€{results.markup.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Base Fee</span>
          <span>€{inputs.baseFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Calculated Price</span>
          <span>€{results.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Minimum Charge</span>
          <span>€{inputs.minimumCharge.toFixed(2)}</span>
        </div>
      </div>
      <div className="bg-yellow-50 p-4 rounded border-2 border-yellow-200">
        <div className="flex justify-between text-lg font-bold">
          <span>Final Quote Price</span>
          <span className="text-green-600">€{results.finalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Profit</span>
          <span className="font-medium">€{results.profit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Profit Margin</span>
          <span className="font-medium">{results.profitMargin.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
