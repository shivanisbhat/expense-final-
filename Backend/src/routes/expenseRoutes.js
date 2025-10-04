const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  submitExpense,
  getMyExpenses,
  getAllExpenses,
  getExpenseById
} = require('../controllers/expenseController');
const router = express.Router();

router.use(authenticate);

router.post('/', submitExpense);
router.get('/my-expenses', getMyExpenses);
router.get('/all', authorize('ADMIN', 'MANAGER'), getAllExpenses);
router.get('/:id', getExpenseById);

module.exports = router;
