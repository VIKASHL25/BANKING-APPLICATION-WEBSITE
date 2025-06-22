
import { useState } from 'react';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { IndianRupee } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { API_URL, USE_MOCK_DATA, MOCK_USER, MOCK_STAFF } from "@/utils/constants";

const Index = () => {
  const { login, staffLogin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [staffLoginForm, setStaffLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ 
    username: "", 
    password: "", 
    confirmPassword: "",
    name: ""
  });
  const [loading, setLoading] = useState(false);
  
  // Redirect if already logged in
  if (isLoggedIn) {
    navigate("/dashboard");
    return null;
  }
  
  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        if (isStaffLogin) {
     
          setTimeout(() => {
            const mockToken = "mock-staff-jwt-token";
            staffLogin(mockToken, MOCK_STAFF);
            navigate("/staff");
            toast.success("Staff login successful (Demo Mode)!");
          }, 800);
        } else {
        
          setTimeout(() => {
            const mockToken = "mock-user-jwt-token";
            login(mockToken, MOCK_USER);
            navigate("/dashboard");
            toast.success("Login successful (Demo Mode)!");
          }, 800);
        }
        return;
      }
      
      // Actual API calls if not using mock data
      if (isStaffLogin) {
        const response = await fetch(`${API_URL}/staff/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: staffLoginForm.email,
            password: staffLoginForm.password
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Login failed');
        }
        
        const data = await response.json();
        staffLogin(data.token, data.staff);
        navigate("/staff");
        toast.success("Staff login successful!");
      } else {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: loginForm.username,
            password: loginForm.password
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Login failed');
        }
        
        const data = await response.json();
        login(data.token, data.user);
        navigate("/dashboard");
        toast.success("Login successful!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error((error as Error).message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if we should use mock data
      if (USE_MOCK_DATA) {
        // Simulate registration with mock data
        setTimeout(() => {
          toast.success("Registration successful! Please login. (Demo Mode)");
          setActiveTab("login");
          setRegisterForm({
            username: "",
            password: "",
            confirmPassword: "",
            name: ""
          });
        }, 800);
        return;
      }
      
      // Actual API call if not using mock data
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password,
          name: registerForm.name
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      toast.success("Registration successful! Please login.");
      setActiveTab("login");
      setRegisterForm({
        username: "",
        password: "",
        confirmPassword: "",
        name: ""
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error((error as Error).message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="homepage">
      {/* Modern Banking Header */}
      <header>
        <div className="container">
          <div className="header-content">
            <h1 className='bank-name'>SV Bank</h1>
            <div className="nav-buttons">
              <button 
                className="customer-btn"
                onClick={() => {
                  setIsStaffLogin(false);
                  setActiveTab("login");
                }}
              >
                Customer Login
              </button>
              <button 
                className="staff-btn"
                onClick={() => {
                  setIsStaffLogin(true);
                  setActiveTab("login");
                }}
              >
                Staff Login
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h2>Banking Made <span>Simple</span> for Everyone</h2>
              <p>
                Experience secure, reliable, and convenient banking services with SV Bank.
                Manage your finances, apply for loans, and transfer money with ease.
              </p>
              <div className="hero-buttons">
                <button 
                  className="primary-btn"
                  onClick={() => setActiveTab("register")}
                >
                  Open an Account
                </button>
                <button 
                  className="secondary-btn"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="login-container">
              <div className="login-card">
                <div className="card-header">
                  <h3 className="card-title">
                    {isStaffLogin ? "Staff Login" : activeTab === "login" ? "Welcome Back" : "Join SV Bank"}
                  </h3>
                  <p className="card-description">
                    {isStaffLogin 
                      ? "Access the staff portal" 
                      : activeTab === "login" 
                        ? "Login to your account" 
                        : "Create a new account"
                    }
                  </p>
                </div>
                
                <div className="card-content">
                  {!isStaffLogin ? (
                    <div className="tabs">
                      <div className="tabs-list">
                        <button 
                          className={`tab-trigger ${activeTab === 'login' ? 'active' : ''}`}
                          onClick={() => setActiveTab("login")}
                        >
                          Login
                        </button>
                        <button 
                          className={`tab-trigger ${activeTab === 'register' ? 'active' : ''}`}
                          onClick={() => setActiveTab("register")}
                        >
                          Register
                        </button>
                      </div>
                      
                      <div className={`tab-content ${activeTab === 'login' ? 'active' : ''}`}>
                        <form onSubmit={handleLogin} className="form">
                          <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input 
                              id="username" 
                              type="text" 
                              placeholder="Enter your username" 
                              value={loginForm.username}
                              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                              disabled={loading}
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input 
                              id="password" 
                              type="password" 
                              placeholder="Enter your password"
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                              disabled={loading}
                              required
                            />
                          </div>
                          
                          <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                          >
                            {loading ? 'Processing...' : 'Login'}
                          </button>
                        </form>
                      </div>
                      
                      <div className={`tab-content ${activeTab === 'register' ? 'active' : ''}`}>
                        <form onSubmit={handleRegister} className="form">
                          <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input 
                              id="name" 
                              type="text" 
                              placeholder="Enter your full name"
                              value={registerForm.name}
                              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                              disabled={loading}
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="reg-username">Username</label>
                            <input 
                              id="reg-username" 
                              type="text" 
                              placeholder="Choose a username"
                              value={registerForm.username}
                              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                              disabled={loading}
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="reg-password">Password</label>
                            <input 
                              id="reg-password" 
                              type="password" 
                              placeholder="Choose a password"
                              value={registerForm.password}
                              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                              disabled={loading}
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input 
                              id="confirm-password" 
                              type="password" 
                              placeholder="Confirm your password"
                              value={registerForm.confirmPassword}
                              onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                              disabled={loading}
                              required
                            />
                          </div>
                          
                          <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                          >
                            {loading ? 'Processing...' : 'Register'}
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleLogin} className="form">
                      <div className="form-group">
                        <label htmlFor="staff-email">Staff Email</label>
                        <input 
                          id="staff-email" 
                          type="email" 
                          placeholder="Enter your staff email" 
                          value={staffLoginForm.email}
                          onChange={(e) => setStaffLoginForm({ ...staffLoginForm, email: e.target.value })}
                          disabled={loading}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="staff-password">Password</label>
                        <input 
                          id="staff-password" 
                          type="password" 
                          placeholder="Enter your password"
                          value={staffLoginForm.password}
                          onChange={(e) => setStaffLoginForm({ ...staffLoginForm, password: e.target.value })}
                          disabled={loading}
                          required
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Staff Login'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Our Banking Services</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Secure Transactions</h3>
              <p>
                Safely transfer funds between accounts with our secure transaction system.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="icon-circle">
                <IndianRupee className="icon" />
              </div>
              <h3>Quick Loans</h3>
              <p>
                Apply for personal, home, or business loans with competitive interest rates.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3>Secure Banking</h3>
              <p>
                Experience top-notch security with our advanced data protection systems.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>SV Bank</h3>
              <p>
                Your trusted financial partner for all banking services.
              </p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#">Home</a></li>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Services</h4>
              <ul className="footer-links">
                <li><a href="#">Personal Banking</a></li>
                <li><a href="#">Business Banking</a></li>
                <li><a href="#">Loans</a></li>
                <li><a href="#">Investments</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contact Us</h4>
              <address>
                <p>DSCE</p>
                <p>Financial District</p>
                <p>support@svbank.com</p>
                
              </address>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} SV Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>
        {`
        /* Base styles */
        .homepage {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Header Styles */
        header {
          background-image: linear-gradient(to right, #1e40af, #1e3a8a);
          color: white;
          padding: 1.5rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

          .bank-name {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  background: linear-gradient(145deg, #ffffff, #d1d5db); /* soft silver gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
   text-shadow:
    0 0 6px rgba(255, 255, 255, 0.4),
    0 0 12px rgba(255, 255, 255, 0.2),
    0 4px 6px rgba(0, 0, 0, 0.3); /* soft shadow for depth */
}

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        header h1 {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .nav-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .customer-btn {
           backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  color: white;
          
          
        }

        .customer-btn:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .staff-btn {
           backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  color: white;
        }

        .staff-btn:hover {
          background-color: rgba(255, 255, 250, 0.3);
        }

        /* Hero Section */
        .hero {
           background-image: linear-gradient(to bottom right, #eef2ff, #faf5ff);
          padding: 5rem 0;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        @media (min-width: 768px) {
          .hero-content {
            flex-direction: row;
          }
        }

        .hero-text {
          margin-bottom: 2.5rem;
          text-align: center;
        }

        @media (min-width: 768px) {
          .hero-text {
            width: 50%;
            text-align: left;
            margin-bottom: 0;
          }
        }

        .hero h2 {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .hero h2 {
            font-size: 3rem;
          }
        }

        .hero h2 span {
          color: #4f46e5;
        }

        .hero p {
          font-size: 1.125rem;
          color: #4b5563;
          margin-bottom: 2rem;
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .primary-btn {
          background-color: #4f46e5;
          color: white;
          padding: 0.75rem 1.5rem;
          font-size: 1.125rem;
          border-radius: 0.5rem;
          border: none;
        }

        .primary-btn:hover {
          background-color: #4338ca;
        }

        .secondary-btn {
          background-color: transparent;
          border: 1px solid #4f46e5;
          color: #4f46e5;
          padding: 0.75rem 1.5rem;
          font-size: 1.125rem;
          border-radius: 0.5rem;
        }

        .secondary-btn:hover {
          background-color: #f5f3ff;
        }

        .login-container {
          width: 100%;
        }

        @media (min-width: 768px) {
          .login-container {
            width: 50%;
            padding-left: 2.5rem;
          }
        }

        .login-card {
          background-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(4px);
          border-radius: 0.5rem;
          overflow: hidden;
          max-width: 28rem;
          margin: 0 auto;
        }

        .card-header {
          padding: 1.5rem;
          text-align: center;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #4338ca;
        }

        .card-description {
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .card-content {
          padding: 0 1.5rem 1.5rem;
        }

        /* Tabs */
        .tabs-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          margin-bottom: 1rem;
        }

        .tab-trigger {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          font-weight: 500;
          text-align: center;
          background-color: transparent;
          border: none;
          border-bottom: 2px solid #e5e7eb;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .tab-trigger.active {
          color: #4f46e5;
          border-bottom-color: #4f46e5;
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
        }

        /* Form */
        .form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        input {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 1rem;
        }

        input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .submit-btn {
          background-color: #4f46e5;
          color: white;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border-radius: 0.375rem;
          border: none;
          margin-top: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .submit-btn:hover {
          background-color: #4338ca;
        }

        .submit-btn:disabled {
          background-color: #6b7280;
          cursor: not-allowed;
        }

        /* Features Section */
        .features {
          padding: 4rem 0;
          background-color: white;
        }

        .section-title {
          font-size: 1.875rem;
          font-weight: bold;
          color: #1f2937;
          text-align: center;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .feature-card {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 2rem;
          text-align: center;
          transition: box-shadow 0.3s ease;
        }

        .feature-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .icon-circle {
          width: 4rem;
          height: 4rem;
          background-color: #eef2ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .icon {
          width: 2rem;
          height: 2rem;
          color: #4f46e5;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          color: #6b7280;
          line-height: 1.5;
        }

        /* Footer */
        footer {
          background-color: #1f2937;
          color: white;
          padding: 3rem 0;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .footer-content {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .footer-section h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .footer-section h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .footer-section p {
          color: #d1d5db;
        }

        .footer-links {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 0.5rem;
        }

        .footer-links a {
          color: #d1d5db;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: white;
        }

        address {
          font-style: normal;
          color: #d1d5db;
        }

        address p {
          margin-bottom: 0.25rem;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          margin-top: 2rem;
          padding-top: 2rem;
          text-align: center;
          color: #9ca3af;
        }
        `}
      </style>
    </div>
  );
};

export default Index;
