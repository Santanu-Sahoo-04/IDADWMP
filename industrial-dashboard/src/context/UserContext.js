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
        credentials: 'include' // Crucial for sending session cookie
      });
      if (res.ok) {
        const userData = await res.json();
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          designation: userData.designation, // Capture designation
          area: userData.area,
          departmentId: userData.department_id,
          dashboardAccessEnabled: userData.dashboard_access_enabled,
          departmentName: userData.department_name, // If provided by check-auth/profile
          locationName: userData.location_name // If provided by check-auth/profile
        });
      } else {
        // If not authenticated or error, clear user
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null); // Ensure user is null on error
    } finally {
      setLoading(false); // ALWAYS set loading to false
    }
  };

  const login = (userData) => {
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      designation: userData.designation, // Capture designation from login response
      area: userData.area,
      departmentId: userData.departmentId,
      dashboardAccessEnabled: userData.dashboardAccessEnabled,
      departmentName: userData.departmentName,
      locationName: userData.locationName
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
    isJunior: user?.role === 'junior',
    isCMD: user?.designation?.toLowerCase() === 'cmd', // Helper for CMD check
    // Check for Director includes 'director' in designation (case-insensitive)
    isDirector: user?.designation?.toLowerCase().includes('director') || user?.designation?.toLowerCase().includes('ed') || user?.designation?.toLowerCase().includes('ggm') // Check Director, ED, GGM
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};