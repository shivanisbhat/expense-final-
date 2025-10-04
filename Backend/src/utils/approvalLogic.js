const processApprovalFlow = async (expense, prisma) => {
  try {
    const submitter = expense.submitter;
    
    if (submitter.managerId && submitter.manager?.isManagerApprover) {
      await prisma.approvalStep.create({
        data: {
          expenseId: expense.id,
          approverId: submitter.managerId,
          sequence: 1,
          status: 'PENDING'
        }
      });

      await prisma.expense.update({
        where: { id: expense.id },
        data: { status: 'IN_REVIEW', currentApprovalStep: 1 }
      });
    } else {
      const rules = await prisma.approvalRule.findMany({
        where: { companyId: expense.companyId, isActive: true }
      });

      if (rules.length === 0) {
        await prisma.expense.update({
          where: { id: expense.id },
          data: { status: 'APPROVED' }
        });
        return;
      }

      const matchingRule = rules.find(rule => {
        if (!rule.amountThreshold) return true;
        return expense.amount >= rule.amountThreshold;
      });

      if (matchingRule && matchingRule.approverSequence) {
        const approvers = matchingRule.approverSequence;
        
        for (const approver of approvers) {
          await prisma.approvalStep.create({
            data: {
              expenseId: expense.id,
              approverId: approver.userId,
              sequence: approver.sequence,
              status: 'PENDING'
            }
          });
        }

        await prisma.expense.update({
          where: { id: expense.id },
          data: { status: 'IN_REVIEW', currentApprovalStep: 1 }
        });
      } else {
        await prisma.expense.update({
          where: { id: expense.id },
          data: { status: 'APPROVED' }
        });
      }
    }
  } catch (error) {
    console.error('Process approval flow error:', error);
    throw error;
  }
};

const checkConditionalRules = async (expense, currentSequence, prisma) => {
  try {
    const rules = await prisma.approvalRule.findMany({
      where: {
        companyId: expense.companyId,
        isActive: true,
        ruleType: { in: ['PERCENTAGE', 'SPECIFIC_APPROVER', 'HYBRID'] }
      }
    });

    if (rules.length === 0) return false;

    for (const rule of rules) {
      if ((rule.ruleType === 'SPECIFIC_APPROVER' || rule.ruleType === 'HYBRID') && rule.specificApproverId) {
        const specificApproval = await prisma.approvalAction.findFirst({
          where: {
            expenseId: expense.id,
            approverId: rule.specificApproverId,
            action: 'APPROVED'
          }
        });

        if (specificApproval) return true;
      }

      if ((rule.ruleType === 'PERCENTAGE' || rule.ruleType === 'HYBRID') && rule.percentageRequired) {
        const totalApprovers = await prisma.approvalStep.count({
          where: { expenseId: expense.id }
        });

        const approvedCount = await prisma.approvalAction.count({
          where: { expenseId: expense.id, action: 'APPROVED' }
        });

        const approvalPercentage = (approvedCount / totalApprovers) * 100;

        if (approvalPercentage >= rule.percentageRequired) return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Check conditional rules error:', error);
    return false;
  }
};

module.exports = { processApprovalFlow, checkConditionalRules };