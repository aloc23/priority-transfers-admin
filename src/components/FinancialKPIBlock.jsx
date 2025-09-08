import { useState, useMemo } from 'react';
import { useAppStore } from '../context/AppStore';
import { calculateKPIs } from '../utils/kpi';
import { RevenueIcon, EstimationIcon, BookingIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

export default function FinancialKPIBlock({ 
  compact = false 
}) {
  const { income, invoices, expenses } = useAppStore();
  const [expandedKPI, setExpandedKPI] = useState(null);

  // Calculate KPIs
  const kpis = calculateKPIs({ income, invoices, expenses });
  const totalIncomeNum = typeof kpis.totalIncome === 'number' ? kpis.totalIncome : 0;
  const paidInvoicesNum = typeof kpis.paidInvoices === 'number' ? kpis.paidInvoices : 0;
  const totalExpensesNum = typeof kpis.totalExpenses === 'number' ? kpis.totalExpenses : 0;
  const netProfitNum = typeof kpis.netProfit === 'number' ? kpis.netProfit : 0;

  // KPI configuration
  const kpiConfig = [
    {
      id: 'totalIncome',
      label: 'Total Income',
      value: totalIncomeNum,
      icon: RevenueIcon,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Total revenue from all income sources',
      details: `Generated from ${income.length} income entries`
    },
    {
      id: 'paidInvoices',
      label: 'Paid Invoices',
      value: paidInvoicesNum,
      icon: RevenueIcon,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Revenue from invoices that have been paid',
      details: `${invoices.filter(inv => inv.status === 'paid').length} paid invoices`
    },
    {
      id: 'totalExpenses',
      label: 'Total Expenses',
      value: totalExpensesNum,
      icon: EstimationIcon,
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Total operational expenses',
      details: `Generated from ${expenses.length} expense entries`
    },
    {
      id: 'netProfit',
      label: 'Net Profit',
      value: netProfitNum,
      icon: BookingIcon,
      color: netProfitNum >= 0 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200',
      description: 'Total Income minus Total Expenses',
      details: `€${totalIncomeNum.toFixed(2)} - €${totalExpensesNum.toFixed(2)}`
    }
  ];

  // Handle KPI expansion
  const handleKPIExpand = (kpiId) => {
    setExpandedKPI(expandedKPI === kpiId ? null : kpiId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-slate-800 ${compact ? 'text-base' : 'text-lg'}`}>
          Financial Overview
        </h3>
      </div>

      {/* Financial KPIs Grid - Expandable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiConfig.map((kpi) => (
          <div key={kpi.id} className="relative">
            <button
              onClick={() => handleKPIExpand(kpi.id)}
              className={`w-full p-4 rounded-xl border-2 font-medium transition-all duration-200 hover:shadow-lg ${kpi.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className="w-6 h-6" />
                {expandedKPI === kpi.id ? 
                  <ChevronUpIcon className="w-4 h-4" /> : 
                  <ChevronDownIcon className="w-4 h-4" />
                }
              </div>
              <div className="text-left">
                <div className="font-bold text-xl mb-1">€{kpi.value.toLocaleString()}</div>
                <div className="text-sm opacity-90">{kpi.label}</div>
              </div>
            </button>
            
            {/* Expandable Content */}
            {expandedKPI === kpi.id && (
              <div className="absolute top-full left-0 right-0 z-20 bg-white border-2 border-slate-200 rounded-xl shadow-xl p-4 mt-2">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <kpi.icon className="w-4 h-4" />
                  {kpi.label} Details
                </h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">€{kpi.value.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    <p className="mb-1">{kpi.description}</p>
                    <p>{kpi.details}</p>
                    {kpi.id === 'netProfit' && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className={`font-medium ${netProfitNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {netProfitNum >= 0 ? '📈 Profitable' : '📉 Loss'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Financial Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Profit Margin:</span>
            <span className="ml-2 font-semibold">
              {totalIncomeNum > 0 ? Math.round((netProfitNum / totalIncomeNum) * 100) : 0}%
            </span>
          </div>
          <div>
            <span className="text-slate-500">Expense Ratio:</span>
            <span className="ml-2 font-semibold">
              {totalIncomeNum > 0 ? Math.round((totalExpensesNum / totalIncomeNum) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}