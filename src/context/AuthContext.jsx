import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  isLoggedIn: false,
  isStaff: false,
  user: null,
  staff: null,
  token: null,
  login: () => {},
  staffLogin: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

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

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setStaff(null);
    setIsLoggedIn(true);
    setIsStaff(false);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('isStaff', 'false');
    localStorage.removeItem('staff');
  };

  const staffLogin = (newToken, newStaff) => {
    setToken(newToken);
    setStaff(newStaff);
    setUser(null);
    setIsLoggedIn(true);
    setIsStaff(true);

    localStorage.setItem('token', newToken);
    localStorage.setItem('staff', JSON.stringify(newStaff));
    localStorage.setItem('isStaff', 'true');
    localStorage.removeItem('user');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setStaff(null);
    setIsLoggedIn(false);
    setIsStaff(false);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('staff');
    localStorage.removeItem('isStaff');
  };

  const contextValue = {
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
