import { useState, useEffect } from 'react';
import api from '../../services/api';
import React from 'react';
export default function PendingApprovals() {
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await api.get('/approvals/pending');
      setApprovals(response.data.pendingApprovals);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAction = async (expenseId, action) => {
    const comments = prompt(`Comments for ${action}:`);
    try {
      await api.post(`/approvals/${expenseId}/process`, { action, comments });
      alert(`Expense ${action.toLowerCase()} successfully!`);
      fetchApprovals();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Failed'));
    }
  };

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <div key={approval.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg">{approval.expense.category}</h3>
          <p className="text-gray-600">{approval.expense.description}</p>
          <p className="text-sm mt-2">Amount: {approval.expense.amount} {approval.expense.currency}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleAction(approval.expenseId, 'APPROVED')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction(approval.expenseId, 'REJECTED')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}