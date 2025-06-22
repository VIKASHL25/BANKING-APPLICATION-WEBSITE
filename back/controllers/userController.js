// filepath: backend/controllers/userController.js
import pool from '../config/db.js';

export const getCurrentUser = async (req, res) => {
  try {
    if (req.user.isStaff) {
      const [staffMembers] = await pool.query(
        'SELECT id, email, name, role FROM staff WHERE id = ?',
        [req.user.id]
      );
      if (staffMembers.length === 0) {
        return res.status(404).json({ error: 'Staff not found' });
      }
      res.json({ staff: staffMembers[0], isStaff: true });
    } else {
      const [users] = await pool.query(
        'SELECT id, username, name, balance FROM users WHERE id = ?',
        [req.user.id]
      );
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user: users[0], isStaff: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error while getting user information' });
  }
};

export const getAccount = async (req, res) => {
  try {
    if (req.user.isStaff) {
      return res.status(403).json({ error: 'Access denied. User only.' });
    }
    const [users] = await pool.query(
      'SELECT id, username, name, balance FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const accountNumber = `SV${users[0].id.toString().padStart(8, '0')}`;
    res.json({
      balance: users[0].balance,
      name: users[0].name,
      accountNumber: accountNumber
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while getting account details' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    if (req.user.isStaff) {
      return res.status(403).json({ error: 'Access denied. User only.' });
    }
    const [transactions] = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 100`,
      [req.user.id]
    );
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Server error while getting transactions' });
  }
};

export const deposit = async (req, res) => {
  try {
    if (req.user.isStaff) {
      return res.status(403).json({ error: 'Access denied. User only.' });
    }
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      await connection.query(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [amount, req.user.id]
      );
      await connection.query(
        `INSERT INTO transactions 
         (user_id, amount, transaction_type, description) 
         VALUES (?, ?, ?, ?)`,
        [req.user.id, amount, 'deposit', 'Cash deposit']
      );
      const [users] = await connection.query(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.id]
      );
      await connection.commit();
      res.json({
        message: 'Deposit successful',
        newBalance: users[0].balance
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during deposit' });
  }
};

export const withdraw = async (req, res) => {
  try {
    if (req.user.isStaff) {
      return res.status(403).json({ error: 'Access denied. User only.' });
    }
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const [users] = await connection.query(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.id]
      );
      if (users[0].balance < amount) {
        await connection.rollback();
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      await connection.query(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [amount, req.user.id]
      );
      await connection.query(
        `INSERT INTO transactions 
         (user_id, amount, transaction_type, description) 
         VALUES (?, ?, ?, ?)`,
        [req.user.id, amount, 'withdrawal', 'Cash withdrawal']
      );
      const [updatedUser] = await connection.query(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.id]
      );
      await connection.commit();
      res.json({
        message: 'Withdrawal successful',
        newBalance: updatedUser[0].balance
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during withdrawal' });
  }
};

export const transfer = async (req, res) => {
  try {
    if (req.user.isStaff) {
      return res.status(403).json({ error: 'Access denied. User only.' });
    }
    const { amount, recipientUsername } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!recipientUsername) {
      return res.status(400).json({ error: 'Recipient username is required' });
    }
    if (req.user.username === recipientUsername) {
      return res.status(400).json({ error: 'Cannot transfer to your own account' });
    }
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const [senders] = await connection.query(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.id]
      );
      if (senders[0].balance < amount) {
        await connection.rollback();
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      const [recipients] = await connection.query(
        'SELECT id, name FROM users WHERE username = ?',
        [recipientUsername]
      );
      if (recipients.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Recipient not found' });
      }
      const recipient = recipients[0];
      await connection.query(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [amount, req.user.id]
      );
      await connection.query(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [amount, recipient.id]
      );
      await connection.query(
        `INSERT INTO transactions 
         (user_id, amount, transaction_type, description, reference_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          req.user.id, 
          amount, 
          'transfer', 
          `Transfer to ${recipientUsername}`,
          recipient.id
        ]
      );
      await connection.query(
        `INSERT INTO transactions 
         (user_id, amount, transaction_type, description, reference_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          recipient.id, 
          amount, 
          'deposit', 
          `Transfer from ${req.user.username}`,
          req.user.id
        ]
      );
      const [updatedSender] = await connection.query(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.id]
      );
      await connection.commit();
      res.json({
        message: 'Transfer successful',
        newBalance: updatedSender[0].balance,
        recipient: recipient.name
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during transfer' });
  }
};