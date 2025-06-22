
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL, 
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(12, 2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL, 
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan types table
CREATE TABLE loan_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    max_amount DECIMAL(12, 2) NOT NULL,
    min_duration INT NOT NULL, 
    max_duration INT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    loan_type_id INT,
    principal_amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    monthly_payment DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', 
    approved_by INT,
    approved_at TIMESTAMP NULL,
    due_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (loan_type_id) REFERENCES loan_types(id),
    FOREIGN KEY (approved_by) REFERENCES staff(id)
);

-- Transactions table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, 
    description TEXT,
    reference_id INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


INSERT INTO loan_types (name, interest_rate, max_amount, min_duration, max_duration)
VALUES 
    ('Personal', 12.5, 500000, 6, 60),
    ('Home', 8.75, 10000000, 60, 360),
    ('Education', 7.25, 2000000, 12, 120),
    ('Vehicle', 9.5, 1500000, 12, 84),
    ('Business', 14.0, 5000000, 12, 60);


INSERT INTO staff (email, password, name, role)
VALUES 
    ('admin@svbank.com', 'admin123', 'Admin User', 'Administrator'),
    ('manager@svbank.com', 'manager123', 'Manager User', 'Branch Manager'),
    ('loan@svbank.com', 'loan123', 'Loan Officer', 'Loan Officer');



