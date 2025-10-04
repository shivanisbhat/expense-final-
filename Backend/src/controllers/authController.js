// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyName, country } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !companyName || !country) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Fetch country currency
    let currency = 'USD';
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countryData = response.data.find(c => 
        c.name.common.toLowerCase() === country.toLowerCase() ||
        c.name.official.toLowerCase() === country.toLowerCase()
      );
      if (countryData && countryData.currencies) {
        const currencyCode = Object.keys(countryData.currencies)[0];
        currency = currencyCode;
      }
    } catch (error) {
      console.error('Error fetching currency:', error.message);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          country,
          currency
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ADMIN',
          companyId: company.id,
          isManagerApprover: true
        },
        include: {
          company: true
        }
      });

      return { company, user };
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id, companyId: result.company.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user;

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with company info
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        manager: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

module.exports = { signup, login };