const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getManagers
} = require('../controllers/userController');
const router = express.Router();

router.use(authenticate); // All routes require authentication

router.post('/', authorize('ADMIN'), createUser);
router.get('/', getAllUsers);
router.get('/managers', getManagers);
router.put('/:id', authorize('ADMIN'), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

module.exports = router;