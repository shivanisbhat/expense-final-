const { PrismaClient } = require('@prisma/client');
const { convertCurrency } = require('../utils/currencyConverter');
const { processApprovalFlow } = require('../utils/approvalLogic');

const prisma = new PrismaClient();

const submitExpense = async (req, res) => {
  try {
    const { amount, currency, category, description, date } = req.body;

    if (!amount || !currency || !category || !description || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        currency,
        category,
        description,
        date: new Date(date),
        submitterId: req.userId,
        companyId: req.companyId,
        status: 'PENDING'
      },
      include: {
        submitter: {
          select: { id: true, firstName: true, lastName: true, email: true, managerId: true, manager: true }
        },
        company: true
      }
    });

    await processApprovalFlow(expense, prisma);

    res.status(201).json({ message: 'Expense submitted successfully', expense });
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({ error: 'Failed to submit expense', details: error.message });
  }
};

const getMyExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { submitterId: req.userId },
      include: {
        approvalSteps: {
          include: {
            approver: {
              select: { firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { sequence: 'asc' }
        },
        approvalActions: {
          include: {
            approver: {
              select: { firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ expenses });
  } catch (error) {
    console.error('Get my expenses error:', error);
    res.status(500).json({ error: 'Failed to get expenses' });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { companyId: req.companyId },
      include: {
        submitter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        approvalSteps: {
          include: {
            approver: {
              select: { firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { sequence: 'asc' }
        },
        company: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const expensesWithConversion = await Promise.all(
      expenses.map(async (expense) => {
        if (expense.currency !== expense.company.currency) {
          const convertedAmount = await convertCurrency(
            expense.amount,
            expense.currency,
            expense.company.currency
          );
          return {
            ...expense,
            convertedAmount,
            companyCurrency: expense.company.currency
          };
        }
        return {
          ...expense,
          convertedAmount: expense.amount,
          companyCurrency: expense.company.currency
        };
      })
    );

    res.json({ expenses: expensesWithConversion });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ error: 'Failed to get expenses' });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        submitter: {
          select: { firstName: true, lastName: true, email: true }
        },
        approvalSteps: {
          include: {
            approver: {
              select: { firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { sequence: 'asc' }
        },
        approvalActions: {
          include: {
            approver: {
              select: { firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { timestamp: 'desc' }
        },
        company: true
      }
    });

    if (!expense || expense.companyId !== req.companyId) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Failed to get expense' });
  }
};

module.exports = { submitExpense, getMyExpenses, getAllExpenses, getExpenseById };