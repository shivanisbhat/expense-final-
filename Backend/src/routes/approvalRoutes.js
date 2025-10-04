const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getPendingApprovals,
  processApproval,
  getApprovalHistory
} = require('../controllers/approvalController');
const router = express.Router();

router.use(authenticate);

router.get('/pending', authorize('MANAGER', 'ADMIN'), getPendingApprovals);
router.post('/:expenseId/process', authorize('MANAGER', 'ADMIN'), processApproval);
router.get('/:expenseId/history', getApprovalHistory);

module.exports = router;