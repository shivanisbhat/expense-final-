// src/controllers/userController.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, managerId, isManagerApprover } = req.body;

    // Only Admin can create users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['EMPLOYEE', 'MANAGER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        companyId: req.user.companyId,
        managerId: managerId || null,
        isManagerApprover: isManagerApprover || false
      },
      include: {
        manager: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { companyId: req.user.companyId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isManagerApprover: true,
        manager: {
          select: { firstName: true, lastName: true, email: true }
        },
        employees: {
          select: { firstName: true, lastName: true, email: true }
        },
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, managerId, isManagerApprover } = req.body;

    // Only Admin can update users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can update users' });
    }

    // Check if user exists and belongs to same company
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate || userToUpdate.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (role) updateData.role = role;
    if (managerId !== undefined) updateData.managerId = managerId;
    if (isManagerApprover !== undefined) updateData.isManagerApprover = isManagerApprover;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isManagerApprover: true,
        manager: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Only Admin can delete users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    // Check if user exists and belongs to same company
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete || userToDelete.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cannot delete self
    if (userToDelete.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
};

const getManagers = async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: {
        companyId: req.user.companyId,
        role: { in: ['MANAGER', 'ADMIN'] }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    res.json({ managers });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ error: 'Failed to get managers' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getManagers
};