// Shared KPI calculation utilities for consistent financial analytics

export function calculateTotalIncome(income) {
  return income.reduce((sum, inc) => sum + (typeof inc.amount === 'number' ? inc.amount : Number(inc.amount) || 0), 0);
}

export function calculatePaidInvoices(invoices) {
  return invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (typeof inv.amount === 'number' ? inv.amount : Number(inv.amount) || 0), 0);
}

export function calculateTotalExpenses(expenses) {
  return expenses.reduce((sum, exp) => sum + (typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0), 0);
}

export function calculateNetProfit(income, expenses) {
  const totalIncome = calculateTotalIncome(income);
  const totalExpenses = calculateTotalExpenses(expenses);
  return totalIncome - totalExpenses;
}

export function calculateKPIs({ income, invoices, expenses }) {
  const totalIncome = calculateTotalIncome(income);
  const paidInvoices = calculatePaidInvoices(invoices);
  const totalExpenses = calculateTotalExpenses(expenses);
  const netProfit = totalIncome - totalExpenses;
  return {
    totalIncome,
    paidInvoices,
    totalExpenses,
    netProfit
  };
}
