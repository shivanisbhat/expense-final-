const { PrismaClient } = require('@prisma/client');
const { checkConditionalRules } = require('../utils/approvalLogic');

const prisma = new PrismaClient();

const getPendingApprovals = async (req, res) => {
  try {
    const pendingSteps = await prisma.approvalStep.findMany({
      where: {
        approverId: req.userId,
        isCompleted: false,
        expense: {
          status: { in: ['PENDING', 'IN_REVIEW'] }
        }
      },
      include: {
        expense: {
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
            }
          }
        },
        approver: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ pendingApprovals: pendingSteps });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to get pending approvals' });
  }
};

const processApproval = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { action, comments } = req.body;

    if (!action || !['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const approvalStep = await prisma.approvalStep.findFirst({
      where: {
        expenseId,
        approverId: req.userId,
        isCompleted: false
      },
      include: {
        expense: {
          include: {
            approvalSteps: {
              include: { approver: true },
              orderBy: { sequence: 'asc' }
            },
            company: true
          }
        }
      }
    });

    if (!approvalStep) {
      return res.status(404).json({ error: 'Approval step not found or already completed' });
    }

    const expense = approvalStep.expense;

    await prisma.approvalStep.update({
      where: { id: approvalStep.id },
      data: { status: action, isCompleted: true }
    });

    await prisma.approvalAction.create({
      data: {
        expenseId,
        approverId: req.userId,
        action,
        comments: comments || null
      }
    });

    if (action === 'REJECTED') {
      await prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'REJECTED' }
      });
      return res.json({ message: 'Expense rejected', expense: { ...expense, status: 'REJECTED' } });
    }

    const shouldAutoApprove = await checkConditionalRules(expense, approvalStep.sequence, prisma);

    if (shouldAutoApprove) {
      await prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'APPROVED' }
      });
      return res.json({ message: 'Expense approved (conditional rule met)', expense: { ...expense, status: 'APPROVED' } });
    }

    const nextStep = await prisma.approvalStep.findFirst({
      where: {
        expenseId,
        sequence: approvalStep.sequence + 1,
        isCompleted: false
      }
    });

    if (nextStep) {
      await prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'IN_REVIEW', currentApprovalStep: nextStep.sequence }
      });
      return res.json({ message: 'Approved - moved to next approver', expense: { ...expense, status: 'IN_REVIEW' } });
    } else {
      await prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'APPROVED' }
      });
      return res.json({ message: 'Expense fully approved', expense: { ...expense, status: 'APPROVED' } });
    }
  } catch (error) {
    console.error('Process approval error:', error);
    res.status(500).json({ error: 'Failed to process approval', details: error.message });
  }
};

const getApprovalHistory = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const actions = await prisma.approvalAction.findMany({
      where: { expenseId },
      include: {
        approver: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json({ history: actions });
  } catch (error) {
    console.error('Get approval history error:', error);
    res.status(500).json({ error: 'Failed to get approval history' });
  }
};

module.exports = { getPendingApprovals, processApproval, getApprovalHistory };