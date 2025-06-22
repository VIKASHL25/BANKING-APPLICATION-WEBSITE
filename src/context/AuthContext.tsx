
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
}

interface Staff {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isStaff: boolean;
  user: User | null;
  staff: Staff | null;
  token: string | null;
  login: (token: string, user: User) => void;
  staffLogin: (token: string, staff: Staff) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isStaff: false,
  user: null,
  staff: null,
  token: null,
  login: () => {},
  staffLogin: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  
  // Check if user is logged in from local storage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedStaff = localStorage.getItem('staff');
    const storedIsStaff = localStorage.getItem('isStaff') === 'true';
    
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      
      if (storedIsStaff && storedStaff) {
        setIsStaff(true);
        setStaff(JSON.parse(storedStaff));
      } else if (storedUser) {
        setIsStaff(false);
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);
  
  // Login function for regular users
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setStaff(null);
    setIsLoggedIn(true);
    setIsStaff(false);
    
    // Save to local storage
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('isStaff', 'false');
    localStorage.removeItem('staff');
  };
  
  // Login function for staff members
  const staffLogin = (newToken: string, newStaff: Staff) => {
    setToken(newToken);
    setStaff(newStaff);
    setUser(null);
    setIsLoggedIn(true);
    setIsStaff(true);
    
    // Save to local storage
    localStorage.setItem('token', newToken);
    localStorage.setItem('staff', JSON.stringify(newStaff));
    localStorage.setItem('isStaff', 'true');
    localStorage.removeItem('user');
  };
  
  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setStaff(null);
    setIsLoggedIn(false);
    setIsStaff(false);
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('staff');
    localStorage.removeItem('isStaff');
  };
  
  const contextValue: AuthContextType = {
    isLoggedIn,
    isStaff,
    user,
    staff,
    token,
    login,
    staffLogin,
    logout,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
