import React from 'react';

import { useUser } from '../context/UserContext';
import { CircularProgress, Box } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom'; 

const ProtectedRoute = ({ children, requiredRole, isDepartmentDashboard = false }) => {
  const { user, loading, isAuthenticated, isSenior, isJunior } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login1" replace />;
  }
// Role-based protection for senior-specific routes (e.g., /upload, /user-management)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Special handling for junior department dashboards
if (isDepartmentDashboard) {
    // Seniors always have access to all department dashboards
    if (isSenior) {
      return children; // Senior bypasses further checks for department dashboards
    }

    // For Juniors:
    if (isJunior) {
      // First, check if department dashboard access is generally enabled for this junior
      if (!user.dashboardAccessEnabled) {
        return <Navigate to="/dashboard" replace state={{ dashboardAccessDenied: true, message: "CONTACT THE SENIOR: You do not have access to your department dashboard." }} />;
      }

      // Second, ensure junior only accesses *their own* department dashboard
      const currentPathDept = location.pathname.split('/')[1].toLowerCase(); // e.g., 'production'
      const userDeptName = getDepartmentName(user.departmentId).toLowerCase();

      if (currentPathDept !== userDeptName) {
        return <Navigate to="/dashboard" replace state={{ dashboardAccessDenied: true, message: `Access denied to ${currentPathDept} dashboard. You only have access to the ${userDeptName} dashboard.` }} />;
      }
    } else {
        // Fallback for unexpected roles if isDepartmentDashboard is true
        return <Navigate to="/dashboard" replace />;
    }
  }
  // --- END NEW LOGIC ---

  return children;
};

// Helper to get department name (can be moved to a shared utility or UserContext)
const getDepartmentName = (departmentId) => {
    switch (departmentId) {
        case 1: return 'Production';
        case 2: return 'Sales';
        case 3: return 'HR';
        default: return '';
    }
};

export default ProtectedRoute;