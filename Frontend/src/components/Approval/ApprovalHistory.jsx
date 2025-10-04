import { useState, useEffect } from 'react';
import api from '../../services/api';
import React from 'react';
export default function ApprovalHistory({ expenseId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (expenseId) fetchHistory();
  }, [expenseId]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/approvals/${expenseId}/history`);
      setHistory(response.data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Approval History</h3>
      {history.length === 0 ? (
        <p className="text-gray-500">No approval actions yet.</p>
      ) : (
        <div className="space-y-3">
          {history.map((action) => (
            <div key={action.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {action.approver.firstName} {action.approver.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{action.approver.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  action.action === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {action.action}
                </span>
              </div>
              {action.comments && (
                <p className="text-sm text-gray-700 mt-2 italic">"{action.comments}"</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(action.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}