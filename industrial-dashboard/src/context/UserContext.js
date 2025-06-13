import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/check-auth', {
        credentials: 'include'
      });
      if (res.ok) {
        const userData = await res.json();
        // Ensure that departmentId and dashboardAccessEnabled are set from backend userData
        // This assumes your /api/auth/check-auth endpoint will also return these fields
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          designation: userData.designation,
          area: userData.area,
          departmentId: userData.department_id, // Ensure your backend sends this as department_id
          dashboardAccessEnabled: userData.dashboard_access_enabled, // Ensure backend sends this
          // Assuming department_name and location_name might also come from check-auth or profile
          departmentName: userData.department_name,
          locationName: userData.location_name
        });
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    // When logging in, capture all relevant user data from the backend response
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      designation: userData.designation,
      area: userData.area,
      departmentId: userData.departmentId, // From auth.js /verify-otp response
      dashboardAccessEnabled: userData.dashboardAccessEnabled, // From auth.js /verify-otp response
      // departmentName and locationName might need to be fetched via profile if not in login response
      departmentName: userData.departmentName, // You might need to add this to the login response if desired
      locationName: userData.locationName // You might need to add this to the login response if desired
    });
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isSenior: user?.role === 'senior',
    isJunior: user?.role === 'junior'
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};