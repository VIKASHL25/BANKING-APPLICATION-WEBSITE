import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'svbank-jwt-secret';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [staffMembers] = await pool.query(
      'SELECT * FROM staff WHERE email = ?',
      [email]
    );
    if (staffMembers.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const staff = staffMembers[0];
    if (password !== staff.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: staff.id, email: staff.email, role: staff.role, isStaff: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      message: 'Staff login successful',
      token,
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during staff login' });
  }
};