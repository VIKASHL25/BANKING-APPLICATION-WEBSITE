import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, XCircle, UserCheck, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { API_URL } from "@/utils/constants";

const StaffDashboard = () => {
  const { staff, token, logout, isLoggedIn, isStaff } = useAuth();
  const navigate = useNavigate();

  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !isStaff) {
      navigate("/");
      return;
    }
    fetchPendingLoans();
    // eslint-disable-next-line
  }, [isLoggedIn, isStaff, navigate, token]);

  const fetchPendingLoans = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/staff/loans/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pending loans');
      }
      const data = await response.json();
      setPendingLoans(data.pendingLoans);
    } catch (error) {
      console.error("Error fetching pending loans:", error);
      toast.error("Failed to load pending loans");
    } finally {
      setLoading(false);
    }
  };

  const processLoan = async (loanId, action) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/staff/loans/${loanId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} loan`);
      }
      const data = await response.json();
      setPendingLoans(data.pendingLoans);
      toast.success(action === 'approve'
        ? "Loan approved successfully"
        : "Loan rejected successfully"
      );
    }
    catch (error) {
      console.error(`Error ${action}ing loan:`, error);
      toast.error(error.message || `Failed to ${action} loan`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <header>
        <div className="header-container">
          <div className="header-content">
            <div>
              <h1 className="bank-name">SV Bank Staff Portal</h1>
              <p className="subtitle">Loan Management System</p>
            </div>
            <div className="user-info">
              <div className="user-details">
                <p className="user-name">{staff?.name}</p>
                <p className="user-role">{staff?.role}</p>
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
        <div className="main-header">
          <div>
            <h2>Loan Applications</h2>
            <p>Review and process customer loan applications</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-indicator"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {pendingLoans.length === 0 ? (
              <div className="no-loans-card">
                <div className="no-loans-content">
                  <AlertCircle className="alert-icon" />
                  <h3>No Pending Applications</h3>
                  <p>
                    There are no loan applications waiting for your review at the moment.
                    Check back later or refresh the list.
                  </p>
                </div>
              </div>
            ) : (
              <div className="loans-grid">
                {pendingLoans.map((loan) => (
                  <div key={loan.id} className="loan-card">
                    <div className="loan-header">
                      <div>
                        <h3 className="loan-type">{loan.loanType} Loan</h3>
                        <div className="user-info-small">
                          <UserCheck size={16} />
                          <span>{loan.userName}</span>
                        </div>
                      </div>
                      <span className="status-badge">PENDING</span>
                    </div>
                    <div className="loan-content">
                      <div className="loan-details">
                        <div>
                          <p className="detail-label">Principal Amount</p>
                          <p className="detail-value">
                            <IndianRupee size={16} />
                            {formatCurrency(loan.principalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="detail-label">Interest Rate</p>
                          <p className="detail-value">{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="detail-label">Due Date</p>
                          <p className="detail-value">{new Date(loan.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="detail-label">Applied On</p>
                          <p className="detail-value">{new Date(loan.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="loan-actions">
                        <button
                          className="reject-btn"
                          onClick={() => processLoan(loan.id, 'reject')}
                          disabled={loading}
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                        <button
                          className="approve-btn"
                          onClick={() => processLoan(loan.id, 'approve')}
                          disabled={loading}
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer>
        <p>&copy; {new Date().getFullYear()} SV Bank Staff Portal. All rights reserved.</p>
      </footer>

      <style>
        {`
        .staff-dashboard {
          min-height: 100vh;
          background-image: linear-gradient(to bottom right, #f9fafb, #eff6ff);
        }
        
        header {
          width: 100%;
          background-image: linear-gradient(to right, #1e40af, #312e81);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header-container {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        h1 {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .subtitle {
          font-size: 0.875rem;
          color: #bfdbfe;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-details {
          text-align: right;
        }
        
        .user-name {
          font-weight: 700;
        }
        
        .user-role {
          font-size: 0.875rem;
          color: #bfdbfe;
        }

             .bank-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
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
          max-width: 80rem;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .main-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        
        h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .main-header p {
          color: #4b5563;
        }
        
        .refresh-btn {
          background-color: #2563eb;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
        }
        
        .refresh-btn:hover {
          background-color: #1d4ed8;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 0;
        }
        
        .loading-indicator {
          width: 4rem;
          height: 4rem;
          border: 4px solid rgba(37, 99, 235, 0.2);
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .loading-container p {
          font-size: 1.25rem;
          color: #2563eb;
        }
        
        .no-loans-card {
          border: 2px dashed #d1d5db;
          border-radius: 0.5rem;
        }
        
        .no-loans-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
        }
        
        .alert-icon {
          height: 3rem;
          width: 3rem;
          color: #3b82f6;
          margin-bottom: 1rem;
        }
        
        .no-loans-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .no-loans-content p {
          color: #6b7280;
          text-align: center;
          max-width: 28rem;
        }
        
        .loans-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .loans-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1200px) {
          .loans-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .loan-card {
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
        }
        
        .loan-header {
          background-color: #f9fafb;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .loan-type {
          font-size: 1.25rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .user-info-small {
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .user-info-small svg {
          margin-right: 0.25rem;
        }
        
        .status-badge {
          background-color: #fef3c7;
          color: #92400e;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
        
        .loan-content {
          padding: 1.5rem;
        }
        
        .loan-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .detail-label {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .detail-value {
          font-size: 1.125rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        
        .detail-value svg {
          margin-right: 0.25rem;
        }
        
        .loan-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .reject-btn, .approve-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          width: 50%;
        }
        
        .reject-btn {
          border: 1px solid #ef4444;
          color: #ef4444;
          background-color: transparent;
        }
        
        .reject-btn:hover {
          background-color: #fef2f2;
        }
        
        .approve-btn {
          background-color: #16a34a;
          color: white;
        }
        
        .approve-btn:hover {
          background-color: #15803d;
        }
        
        .reject-btn svg, .approve-btn svg {
          margin-right: 0.5rem;
        }
        
        footer {
          background-color: #1f2937;
          color: white;
          padding: 1.5rem 0;
          text-align: center;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        `}
      </style>
    </div>
  );
};

export default StaffDashboard;
