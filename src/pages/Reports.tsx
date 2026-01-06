import { useEffect, useState } from 'react';
import { supabase, type Expense, type Income, type Asset, type Liability } from '../lib/supabase';

export default function Reports() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'income-statement' | 'balance-sheet'>('income-statement');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set default dates to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadData();
    }
  }, [startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expensesRes, incomeRes, assetsRes, liabilitiesRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('*, category:expense_categories(*)')
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('income')
          .select('*, category:income_categories(*)')
          .gte('date', startDate)
          .lte('date', endDate),
        supabase.from('assets').select('*'),
        supabase.from('liabilities').select('*'),
      ]);

      if (expensesRes.error) throw expensesRes.error;
      if (incomeRes.error) throw incomeRes.error;
      if (assetsRes.error) throw assetsRes.error;
      if (liabilitiesRes.error) throw liabilitiesRes.error;

      setExpenses(expensesRes.data || []);
      setIncome(incomeRes.data || []);
      setAssets(assetsRes.data || []);
      setLiabilities(liabilitiesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Income Statement Calculations
  const totalRevenue = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, exp) => {
    const categoryName = exp.category ? (exp.category as any).name : 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += exp.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group income by category
  const incomeByCategory = income.reduce((acc, inc) => {
    const categoryName = inc.category ? (inc.category as any).name : 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += inc.amount;
    return acc;
  }, {} as Record<string, number>);

  // Balance Sheet Calculations
  const totalAssets = assets.reduce((sum, asset) => sum + asset.current_value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const equity = totalAssets - totalLiabilities;

  // Group assets by type
  const assetsByType = assets.reduce((acc, asset) => {
    if (!acc[asset.asset_type]) {
      acc[asset.asset_type] = 0;
    }
    acc[asset.asset_type] += asset.current_value;
    return acc;
  }, {} as Record<string, number>);

  // Group liabilities by type
  const liabilitiesByType = liabilities.reduce((acc, liability) => {
    if (!acc[liability.liability_type]) {
      acc[liability.liability_type] = 0;
    }
    acc[liability.liability_type] += liability.amount;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="income-statement">Income Statement</option>
              <option value="balance-sheet">Balance Sheet</option>
            </select>
          </div>
          {reportType === 'income-statement' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {reportType === 'income-statement' && (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center mb-2">Income Statement</h2>
          <p className="text-center text-gray-600 mb-8">
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </p>

          <div className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
                Revenue
              </h3>
              {Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between py-2 px-4">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 px-4 bg-gray-50 font-semibold mt-2">
                <span>Total Revenue</span>
                <span className="text-green-600">${totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
                Expenses
              </h3>
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between py-2 px-4">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 px-4 bg-gray-50 font-semibold mt-2">
                <span>Total Expenses</span>
                <span className="text-red-600">${totalExpenses.toFixed(2)}</span>
              </div>
            </div>

            {/* Net Income */}
            <div className="pt-4 border-t-4 border-gray-300">
              <div className="flex justify-between py-3 px-4 bg-purple-50 font-bold text-lg">
                <span>Net Income</span>
                <span className={netIncome >= 0 ? 'text-green-700' : 'text-red-700'}>
                  ${netIncome.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'balance-sheet' && (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center mb-2">Balance Sheet</h2>
          <p className="text-center text-gray-600 mb-8">
            As of {new Date().toLocaleDateString()}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Assets */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
                Assets
              </h3>
              {Object.entries(assetsByType).length > 0 ? (
                <>
                  {Object.entries(assetsByType).map(([type, amount]) => (
                    <div key={type} className="flex justify-between py-2 px-4">
                      <span className="text-gray-700 capitalize">{type}</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-4 bg-gray-50 font-semibold mt-2">
                    <span>Total Assets</span>
                    <span className="text-green-600">${totalAssets.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm italic px-4">No assets recorded</p>
              )}
            </div>

            {/* Liabilities & Equity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
                Liabilities
              </h3>
              {Object.entries(liabilitiesByType).length > 0 ? (
                <>
                  {Object.entries(liabilitiesByType).map(([type, amount]) => (
                    <div key={type} className="flex justify-between py-2 px-4">
                      <span className="text-gray-700 capitalize">{type}</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-4 bg-gray-50 font-semibold mt-2">
                    <span>Total Liabilities</span>
                    <span className="text-red-600">${totalLiabilities.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm italic px-4 mb-4">No liabilities recorded</p>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
                  Equity
                </h3>
                <div className="flex justify-between py-2 px-4 bg-purple-50 font-bold">
                  <span>Owner's Equity</span>
                  <span className={equity >= 0 ? 'text-green-700' : 'text-red-700'}>
                    ${equity.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-4 border-gray-300">
                <div className="flex justify-between py-2 px-4 bg-gray-100 font-semibold">
                  <span>Total Liabilities + Equity</span>
                  <span>${(totalLiabilities + equity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {totalAssets !== totalLiabilities + equity && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Assets should equal Liabilities + Equity.
                Please review your data for accuracy.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
