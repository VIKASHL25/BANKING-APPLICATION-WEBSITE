// filepath: backend/controllers/authController.js
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'svbank-jwt-secret';

export const register = async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const [userCheck] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    if (userCheck.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const [result] = await pool.query(
      'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
      [username, password, name]
    );
    const [newUser] = await pool.query(
      'SELECT id, username, name FROM users WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = users[0];
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, isStaff: false },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};