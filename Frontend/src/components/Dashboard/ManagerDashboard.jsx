// src/components/Dashboard/ManagerDashboard.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import React from 'react';
export default function ManagerDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingApprovals();
    fetchAllExpenses();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await api.get('/approvals/pending');
      setPendingApprovals(response.data.pendingApprovals);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const fetchAllExpenses = async () => {
    try {
      const response = await api.get('/expenses/all');
      setAllExpenses(response.data.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleApproval = async (expenseId, action) => {
    const comments = prompt(`Enter comments for ${action.toLowerCase()}:`);
    if (comments === null) return;

    setLoading(true);
    try {
      await api.post(`/approvals/${expenseId}/process`, {
        action,
        comments
      });
      alert(`Expense ${action.toLowerCase()} successfully!`);
      fetchPendingApprovals();
      fetchAllExpenses();
    } catch (error) {
      alert('Error processing approval: ' + (error.response?.data?.error || 'Unknown error'));
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.firstName}!</p>
        <p className="text-sm text-gray-500">Company Currency: {user?.company?.currency}</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Approvals ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Team Expenses
          </button>
        </div>
      </div>

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Pending Approvals</h2>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending approvals at the moment!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {approval.expense.category}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(approval.expense.status)}`}>
                          {approval.expense.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{approval.expense.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Submitted by:</span>
                          <span className="ml-2 font-medium">
                            {approval.expense.submitter.firstName} {approval.expense.submitter.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <span className="ml-2 font-medium">
                            {new Date(approval.expense.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Original Amount:</span>
                          <span className="ml-2 font-medium">
                            {approval.expense.amount} {approval.expense.currency}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Approval Step:</span>
                          <span className="ml-2 font-medium">
                            {approval.sequence} of {approval.expense.approvalSteps.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => handleApproval(approval.expenseId, 'APPROVED')}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(approval.expenseId, 'REJECTED')}
                        disabled={loading}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Expenses Tab */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">All Team Expenses</h2>
          </div>

          {allExpenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No expenses found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In {user?.company?.currency}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.submitter.firstName} {expense.submitter.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.amount} {expense.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.convertedAmount?.toFixed(2)} {expense.companyCurrency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}