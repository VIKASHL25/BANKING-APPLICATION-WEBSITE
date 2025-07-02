import pool from '../config/db.js';

export const getLoanTypes = async (req, res) => {
  try {
    const [loanTypes] = await pool.query('SELECT * FROM loan_types');
    res.json({ loanTypes });
  } catch (error) {
    res.status(500).json({ error: 'Server error while getting loan types' });
  }
};

export  const applyLoan = async (req, res) => {
  try {
    if (req.user.isStaff) {
      return res.status(403).json({ error: 'Access denied. User only.' });
    }
    const { amount, loanTypeId, durationMonths } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!loanTypeId || isNaN(loanTypeId)) {
      return res.status(400).json({ error: 'Invalid loan type' });
    }
    if (!durationMonths || isNaN(durationMonths) || durationMonths <= 0) {
      return res.status(400).json({ error: 'Invalid duration' });
    }
    const [loanTypes] = await pool.query(
      'SELECT * FROM loan_types WHERE id = ?',
      [loanTypeId]
    );
    if (loanTypes.length === 0) {
      return res.status(404).json({ error: 'Loan type not found' });
    }
    const loanType = loanTypes[0];
    if (amount > loanType.max_amount) {
      return res.status(400).json({ 
        error: `Maximum loan amount for ${loanType.name} is ${loanType.max_amount}` 
      });
    }
    if (durationMonths < loanType.min_duration || durationMonths > loanType.max_duration) {
      return res.status(400).json({ 
        error: `Duration for ${loanType.name} must be between ${loanType.min_duration} and ${loanType.max_duration} months` 
      });
    }
    const interestRate = loanType.interest_rate;
    const monthlyInterest = interestRate / 100 / 12;
    const monthlyPayment = (amount * monthlyInterest * Math.pow(1 + monthlyInterest, durationMonths)) / 
                          (Math.pow(1 + monthlyInterest, durationMonths) - 1);
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + durationMonths);
    const [result] = await pool.query(
      `INSERT INTO loans 
       (user_id, loan_type_id, principal_amount, interest_rate, duration_months, monthly_payment, due_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        loanTypeId,
        amount,
        interestRate,
        durationMonths,
        monthlyPayment,
        dueDate
      ]
    );
    res.status(201).json({
      message: 'Loan application submitted successfully',
      loanId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during loan application' });
  }
};

export const getPendingLoans = async (req, res) => {
  try {
    if (!req.user.isStaff) {
      return res.status(403).json({ error: 'Access denied. Staff only.' });
    }
    const [loans] = await pool.query(`
      SELECT l.id, l.principal_amount, l.interest_rate, l.due_date, l.created_at,
             u.id as user_id, u.name as user_name,
             lt.name as loan_type
      FROM loans l
      JOIN users u ON l.user_id = u.id
      JOIN loan_types lt ON l.loan_type_id = lt.id
      WHERE l.status = 'pending'
      ORDER BY l.created_at DESC
    `);
    const pendingLoans = loans.map(loan => ({
      id: loan.id,
      userId: loan.user_id,
      userName: loan.user_name,
      loanType: loan.loan_type,
      principalAmount: loan.principal_amount,
      interestRate: loan.interest_rate,
      dueDate: loan.due_date,
      createdAt: loan.created_at
    }));
    res.json({ pendingLoans });
  } catch (error) {
    res.status(500).json({ error: 'Server error while getting pending loans' });
  }
};

export const processLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!req.user.isStaff) {
      return res.status(403).json({ error: 'Access denied. Staff only.' });
    }
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'Invalid action. Must be approve or reject.' });
    }
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      await connection.query(
        `UPDATE loans SET 
         status = ?, 
         approved_by = ?, 
         approved_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [action === 'approve' ? 'approved' : 'rejected', req.user.id, id]
      );
      if (action === 'approve') {
        const [loanResult] = await connection.query(
          'SELECT user_id, principal_amount FROM loans WHERE id = ?',
          [id]
        );
        if (loanResult.length === 0) {
          throw new Error('Loan not found');
        }
        const { user_id, principal_amount } = loanResult[0];
        await connection.query(
          'UPDATE users SET balance = balance + ? WHERE id = ?',
          [principal_amount, user_id]
        );
        await connection.query(
          `INSERT INTO transactions 
           (user_id, amount, transaction_type, description, reference_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            user_id, 
            principal_amount, 
            'loan_disbursement',
            'Loan approved and disbursed',
            id
          ]
        );
      }
      await connection.commit();
      res.json({ message: `Loan ${action === 'approve' ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: `Server error while processing loan` });
  }
};