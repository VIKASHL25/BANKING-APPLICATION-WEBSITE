import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, CreditCard, BanknoteIcon, IndianRupee, FileText } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { API_URL } from "@/utils/constants";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Dashboard = () => {
  const { isLoggedIn, isStaff, user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [accountNumber, setAccountNumber] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Form states
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanType, setLoanType] = useState("");
  const [loanDuration, setLoanDuration] = useState("");
  const [loanTypes, setLoanTypes] = useState([]);
  const [processingTransaction, setProcessingTransaction] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    if (isStaff) {
      navigate("/staff");
      return;
    }

    fetchAccountDetails();
    fetchTransactions();
    fetchLoanTypes();
    // eslint-disable-next-line
  }, [isLoggedIn, isStaff, navigate, token]);

  const handleApiError = (error, fallbackMessage) => {
    console.error(fallbackMessage, error);

    if (error.message && error.message.includes("Failed to fetch")) {
      toast.error("Could not connect to the banking server. Please check your connection or try again later.");
    } else if (error.message && error.message.includes("Unexpected token '<'")) {
      toast.error("API endpoint not available. Please try again later.");
    } else {
      toast.error(fallbackMessage);
    }
  };

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/user/account`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setBalance(user?.balance || 5000);
          setAccountNumber(user?.id ? `SV${user.id.toString().padStart(8, '0')}` : "SV00000000");
          return;
        }
        throw new Error(`Failed with status: ${response.status}`);
      }

      const data = await response.json();
      setBalance(data.balance);
      setAccountNumber(data.accountNumber || `SV${user?.id.toString().padStart(8, '0')}`);
    } catch (error) {
      handleApiError(error, "Failed to load account details");
      setBalance(user?.balance || 0);
      setAccountNumber(user?.id ? `SV${user.id.toString().padStart(8, '0')}` : "SV00000000");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/user/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setTransactions([]);
          return;
        }
        throw new Error(`Failed with status: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      handleApiError(error, "Failed to load transaction history");
      setTransactions([]);
    }
  };

  const fetchLoanTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/loan-types`);

      if (!response.ok) {
        if (response.status === 404) {
          setLoanTypes([
            { id: 1, name: "Personal Loan", interest_rate: 10.5, max_amount: 500000, min_duration: 12, max_duration: 60 },
            { id: 2, name: "Home Loan", interest_rate: 8.5, max_amount: 5000000, min_duration: 60, max_duration: 240 }
          ]);
          return;
        }
        throw new Error(`Failed with status: ${response.status}`);
      }

      const data = await response.json();
      setLoanTypes(data.loanTypes || []);
    } catch (error) {
      handleApiError(error, "Failed to load loan options");
      setLoanTypes([
        { id: 1, name: "Personal Loan", interest_rate: 10.5, max_amount: 500000, min_duration: 12, max_duration: 60 },
        { id: 2, name: "Home Loan", interest_rate: 8.5, max_amount: 5000000, min_duration: 60, max_duration: 240 }
      ]);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();

    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setProcessingTransaction(true);
      const response = await fetch(`${API_URL}/user/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(depositAmount) })
      });

      if (!response.ok) {
        if (response.status === 404) {
          const newBalance = balance + Number(depositAmount);
          setBalance(newBalance);
          toast.success(`Successfully deposited ${formatCurrency(Number(depositAmount))}`);
          setDepositAmount("");
          return;
        }

        const errorData = await response.json().catch(() => ({ error: 'Failed to process deposit' }));
        throw new Error(errorData.error || 'Failed to process deposit');
      }

      const data = await response.json();
      setBalance(data.newBalance);
      toast.success(`Successfully deposited ${formatCurrency(Number(depositAmount))}`);
      setDepositAmount("");
      fetchTransactions();
    } catch (error) {
      toast.error(error.message || "Failed to process deposit");
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(withdrawAmount) > balance) {
      toast.error("Insufficient funds");
      return;
    }

    try {
      setProcessingTransaction(true);
      const response = await fetch(`${API_URL}/user/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(withdrawAmount) })
      });

      if (!response.ok) {
        if (response.status === 404) {
          const newBalance = balance - Number(withdrawAmount);
          setBalance(newBalance);
          toast.success(`Successfully withdrew ${formatCurrency(Number(withdrawAmount))}`);
          setWithdrawAmount("");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process withdrawal');
      }

      const data = await response.json();
      setBalance(data.newBalance);
      toast.success(`Successfully withdrew ${formatCurrency(Number(withdrawAmount))}`);
      setWithdrawAmount("");
      fetchTransactions();
    } catch (error) {
      toast.error(error.message || "Failed to process withdrawal");
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!transferRecipient) {
      toast.error("Please enter a recipient username");
      return;
    }

    if (Number(transferAmount) > balance) {
      toast.error("Insufficient funds");
      return;
    }

    try {
      setProcessingTransaction(true);

      const response = await fetch(`${API_URL}/user/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(transferAmount),
          recipientUsername: transferRecipient
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process transfer');
      }

      const data = await response.json();
      setBalance(data.newBalance);
      toast.success(`Successfully transferred ${formatCurrency(Number(transferAmount))} to ${transferRecipient}`);
      setTransferAmount("");
      setTransferRecipient("");
      fetchTransactions();
    } catch (error) {
      toast.error(error.message || "Failed to process transfer");
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleLoanApplication = async (e) => {
    e.preventDefault();

    if (!loanAmount || isNaN(Number(loanAmount)) || Number(loanAmount) <= 0) {
      toast.error("Please enter a valid loan amount");
      return;
    }

    if (!loanType) {
      toast.error("Please select a loan type");
      return;
    }

    if (!loanDuration || isNaN(Number(loanDuration)) || Number(loanDuration) <= 0) {
      toast.error("Please enter a valid loan duration");
      return;
    }

    try {
      setProcessingTransaction(true);

      const response = await fetch(`${API_URL}/user/apply-loan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(loanAmount),
          loanTypeId: Number(loanType),
          durationMonths: Number(loanDuration)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit loan application');
      }

      toast.success("Loan application submitted successfully");
      setLoanAmount("");
      setLoanType("");
      setLoanDuration("");
    } catch (error) {
      toast.error(error.message || "Failed to submit loan application");
    } finally {
      setProcessingTransaction(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="transaction-icon deposit" />;
      case 'withdrawal':
        return <ArrowUp className="transaction-icon withdrawal" />;
      case 'transfer':
        return <ArrowUp className="transaction-icon transfer" />;
      case 'loan_disbursement':
        return <BanknoteIcon className="transaction-icon loan" />;
      case 'loan_payment':
        return <CreditCard className="transaction-icon payment" />;
      default:
        return <FileText className="transaction-icon" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'loan_disbursement':
        return 'text-green-600';
      case 'withdrawal':
      case 'transfer':
      case 'loan_payment':
        return 'text-red-600';
      default:
        return '';
    }
  };

  const getTransactionSign = (type) => {
    switch (type) {
      case 'deposit':
      case 'loan_disbursement':
        return '+';
      case 'withdrawal':
      case 'transfer':
      case 'loan_payment':
        return '-';
      default:
        return '';
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header>
        <div className="header-container">
          <div className="header-content">
            <h1 className="bank-name">SV Bank</h1>
            <div className="user-info">
              <div className="user-details">
                <p className="user-name">Welcome, {user?.name}</p>
              </div>
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        <div className="dashboard-container">
          {/* Account Overview Card */}
          <div className="balance-card">
            <div className="balance-header">
              <h2>Account Balance</h2>
              <span className="account-number">Account No: {accountNumber}</span>
            </div>
            <div className="balance-amount">
            
              <span>{formatCurrency(balance)}</span>
            </div>
            <div className="account-type">
              <span>Savings Account</span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="dashboard-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Account Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => setActiveTab('deposit')}
            >
              Deposit
            </button>
            <button 
              className={`tab-button ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              Withdraw
            </button>
            <button 
              className={`tab-button ${activeTab === 'transfer' ? 'active' : ''}`}
              onClick={() => setActiveTab('transfer')}
            >
              Transfer
            </button>
            <button 
              className={`tab-button ${activeTab === 'loan' ? 'active' : ''}`}
              onClick={() => setActiveTab('loan')}
            >
              Loan Application
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="tab-content-container">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-content">
                <h3>Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <Table>
                    <TableCaption>A list of your recent transactions.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="transaction-type-cell">
                              {getTransactionIcon(transaction.transaction_type)}
                              <span className="transaction-type">
                                {transaction.transaction_type.replace('_', ' ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className={`text-right ${getTransactionColor(transaction.transaction_type)}`}>
                            {getTransactionSign(transaction.transaction_type)}
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="no-transactions">
                    <p>No transactions found.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Deposit Tab */}
            {activeTab === 'deposit' && (
              <div className="tab-content">
                <h3>Deposit Money</h3>
                <form onSubmit={handleDeposit} className="transaction-form">
                  <div className="form-group">
                    <label htmlFor="deposit-amount">Amount</label>
                    <div className="amount-input">
                      <IndianRupee className="input-icon" />
                      <input
                        id="deposit-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={processingTransaction}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={processingTransaction}
                  >
                    {processingTransaction ? 'Processing...' : 'Deposit Money'}
                  </button>
                </form>
              </div>
            )}
            
            {/* Withdraw Tab */}
            {activeTab === 'withdraw' && (
              <div className="tab-content">
                <h3>Withdraw Money</h3>
                <form onSubmit={handleWithdraw} className="transaction-form">
                  <div className="form-group">
                    <label htmlFor="withdraw-amount">Amount</label>
                    <div className="amount-input">
                      <IndianRupee className="input-icon" />
                      <input
                        id="withdraw-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        disabled={processingTransaction}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={processingTransaction}
                  >
                    {processingTransaction ? 'Processing...' : 'Withdraw Money'}
                  </button>
                </form>
              </div>
            )}
            
            {/* Transfer Tab */}
            {activeTab === 'transfer' && (
              <div className="tab-content">
                <h3>Transfer Money</h3>
                <form onSubmit={handleTransfer} className="transaction-form">
                  <div className="form-group">
                    <label htmlFor="transfer-recipient">Recipient Username</label>
                    <input
                      id="transfer-recipient"
                      type="text"
                      placeholder="Enter username"
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      disabled={processingTransaction}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transfer-amount">Amount</label>
                    <div className="amount-input">
                      <IndianRupee className="input-icon" />
                      <input
                        id="transfer-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        disabled={processingTransaction}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={processingTransaction}
                  >
                    {processingTransaction ? 'Processing...' : 'Transfer Money'}
                  </button>
                </form>
              </div>
            )}
            
            {/* Loan Application Tab */}
            {activeTab === 'loan' && (
              <div className="tab-content">
                <h3>Apply for Loan</h3>
                <form onSubmit={handleLoanApplication} className="transaction-form">
                  <div className="form-group">
                    <label htmlFor="loan-type">Loan Type</label>
                    <select
                      id="loan-type"
                      value={loanType}
                      onChange={(e) => setLoanType(e.target.value)}
                      disabled={processingTransaction}
                      required
                    >
                      <option value="">Select loan type</option>
                      {loanTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.interest_rate}% interest)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="loan-amount">Amount</label>
                    <div className="amount-input">
                      <IndianRupee className="input-icon" />
                      <input
                        id="loan-amount"
                        type="number"
                        placeholder="Enter loan amount"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        disabled={processingTransaction}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="loan-duration">Duration (months)</label>
                    <input
                      id="loan-duration"
                      type="number"
                      placeholder="Enter duration in months"
                      value={loanDuration}
                      onChange={(e) => setLoanDuration(e.target.value)}
                      disabled={processingTransaction}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={processingTransaction}
                  >
                    {processingTransaction ? 'Processing...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer>
        <p>&copy; {new Date().getFullYear()} SV Bank. All rights reserved.</p>
      </footer>

      <style>
        {`
        .dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #CCE5FF;
        }
        
        header {
          background-image: linear-gradient(to right, #1e40af, #1e3a8a);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

       .bank-name {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  background: linear-gradient(145deg, #ffffff, #d1d5db); /* silver-white gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  /* ✨ Light Glow Effect */
  text-shadow:
    0 0 6px rgba(255, 255, 255, 0.4),
    0 0 12px rgba(255, 255, 255, 0.2),
    0 4px 6px rgba(0, 0, 0, 0.3); /* soft shadow for depth */
}

        
        h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-name {
          margin: 0;
          font-size: 2.3rem;
          font-family: 'Inter', sans-serif;
        position : center;
  font-weight: 600;
  color: #f9fafb; /* light on blue background */
  margin-top: 10px;
 text-shadow: 0 0 6px rgba(255, 255, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2);

        }
        
        .logout-btn {
          border: 1px solid white;
          background-color: #D12E2E;
          color: white;
           margin-left: auto; 
          
          padding: 0.5rem 1.2rem;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        
        .logout-btn:hover {
          background-color: rgba(253, 23, 23);
        }
        
        main {
          flex: 1;
          padding: 2rem 0;
        }
        
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .balance-card {
          background-image: linear-gradient(to right, #1e3a8a, #3b82f6);
          color: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        
        .balance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .balance-header h2 {
          font-size: 1.25rem;
          margin: 0;
        }
        
        .account-number {
          font-size: 1.5rem;
          opacity: 0.8;
        }
        
        .balance-amount {
          display: flex;
          align-items: center;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .currency-icon {
          margin-right: 0.5rem;
        }
        
        .account-type {
          font-size: 0.875rem;
          opacity: 0.8;
        }
        
        .dashboard-tabs {
          display: flex;
          overflow-x: auto;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .tab-button {
          padding: 0.75rem 1.25rem;
          border: none;
          background: none;
          color: #6b7280;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .tab-button.active {
          color: #1e40af;
          border-bottom: 2px solid #1e40af;
        }
        
        .tab-content-container {
          background-color: rgb(204,221,256);
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .tab-content h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          color: #1f2937;
        }
        
        .transaction-type-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .transaction-icon {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .transaction-icon.deposit {
          color: #16a34a;
        }
        
        .transaction-icon.withdrawal, .transaction-icon.transfer {
          color: #dc2626;
        }
        
        .transaction-icon.loan {
          color: #2563eb;
        }
        
        .transaction-icon.payment {
          color: #9333ea;
        }
        
        .transaction-type {
          text-transform: capitalize;
        }
        
        .no-transactions {
          text-align: center;
          padding: 2rem 0;
          color: #6b7280;
        }
        
        .transaction-form {
          max-width: 500px;
          margin: 0 auto;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 1rem;
        }
        
        .amount-input {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }
        
        .amount-input input {
          padding-left: 2.5rem;
        }
        
        .submit-btn {
          width: 100%;
          background-color: #1e40af;
          color: white;
          border: none;
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-btn:hover {
          background-color: #1e3a8a;
        }
        
        .submit-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        
        footer {
          background-color: #1f2937;
          color: white;
          text-align: center;
          padding: 1rem 0;
          margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
          .dashboard-tabs {
            flex-wrap: wrap;
          }
          
          .tab-button {
            flex: 1 1 auto;
            text-align: center;
            min-width: 33%;
          }
          
          .balance-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .account-number {
            margin-top: 0.5rem;
          }
        }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
