import { useState, useEffect } from 'react';
import api from '../../services/api';
import ApprovalHistory from '../Approval/ApprovalHistory';
import React from 'react';
export default function ExpenseDetail({ expenseId, onClose }) {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpense();
  }, [expenseId]);

  const fetchExpense = async () => {
    try {
      const response = await api.get(`/expenses/${expenseId}`);
      setExpense(response.data.expense);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!expense) return <div className="text-center py-8">Expense not found</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Expense Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(expense.status)}`}>
              {expense.status}
            </span>
            <span className="text-sm text-gray-500">
              Submitted: {new Date(expense.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Expense Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p className="text-lg font-semibold">{expense.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-lg font-semibold">{new Date(expense.date).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Amount</label>
              <p className="text-lg font-semibold">{expense.amount} {expense.currency}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Submitted By</label>
              <p className="text-lg font-semibold">
                {expense.submitter.firstName} {expense.submitter.lastName}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="mt-1 text-gray-700">{expense.description}</p>
          </div>

          {/* Approval Steps */}
          {expense.approvalSteps && expense.approvalSteps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Approval Flow</h3>
              <div className="space-y-2">
                {expense.approvalSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        Step {idx + 1}: {step.approver.firstName} {step.approver.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{step.approver.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                      {step.isCompleted ? step.status : 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval History */}
          <ApprovalHistory expenseId={expenseId} />
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}