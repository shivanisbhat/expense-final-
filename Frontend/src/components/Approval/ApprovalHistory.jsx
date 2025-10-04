import { useState, useEffect } from 'react';
import api from '../../services/api';
import React from 'react';

export default function ApprovalHistory({ expenseId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (expenseId) fetchHistory();
  }, [expenseId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Backend endpoint: GET /api/expenses/:id includes approvalHistory
      const response = await api.get(`/expenses/${expenseId}`);
      setHistory(response.data.data?.approvalHistory || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
    setLoading(false);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'approved': return 'border-green-500 bg-green-50';
      case 'rejected': return 'border-red-500 bg-red-50';
      case 'pending': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Approval History</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Approval History</h3>
      {history.length === 0 ? (
        <p className="text-gray-500">No approval actions yet.</p>
      ) : (
        <div className="space-y-3">
          {history.map((action) => (
            <div 
              key={action.id} 
              className={`border-l-4 pl-4 py-3 rounded-r ${getActionColor(action.action)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">
                    Level {action.level}: {action.approver?.firstName} {action.approver?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{action.approver?.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(action.action)}`}>
                  {action.action.toUpperCase()}
                </span>
              </div>
              {action.comments && (
                <p className="text-sm text-gray-700 mt-2 italic">"{action.comments}"</p>
              )}
              {action.actionDate && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(action.actionDate).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}