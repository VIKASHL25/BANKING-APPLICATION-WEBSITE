
// API URL - Automatically select between local and production environments
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Use the actual Lovable domain for production or localhost for development
export const API_URL = isLocalhost ? "http://localhost:5000/api" : `${window.location.origin}/api`;

// Flag to indicate if we should use mock data (when backend is unavailable)
export const USE_MOCK_DATA = !isLocalhost;

// Log the API URL being used to help with debugging
console.log(`Using API URL: ${API_URL}`);
console.log(`Using mock data: ${USE_MOCK_DATA}`);

// Mock user data for demonstration when backend is unavailable
export const MOCK_USER = {
  id: 1,
  username: "demo_user",
  name: "Demo User",
  balance: 15000
};

// Mock staff data for demonstration when backend is unavailable
export const MOCK_STAFF = {
  id: 1,
  email: "staff@svbank.com",
  name: "Staff User",
  role: "manager"
};

// Mock transaction data
export const MOCK_TRANSACTIONS = [
  {
    id: 1,
    user_id: 1,
    amount: 5000,
    transaction_type: "deposit",
    description: "Initial deposit",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    user_id: 1,
    amount: 1000,
    transaction_type: "withdrawal",
    description: "ATM withdrawal",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    user_id: 1,
    amount: 2500,
    transaction_type: "deposit",
    description: "Salary credit",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];
