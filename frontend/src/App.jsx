import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import ProfessorLayout from './layouts/ProfessorLayout';
import StudentLayout from './layouts/StudentLayout';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};
// const TitleUpdater = () => {
//   const location = useLocation();
//   useEffect(() => {
//     const path = location.pathname;
//     let title = 'University Management ';
//     if (path.includes('/dashboard')) title = 'Dashboard ';
//     else if (path.includes('/attendance')) title = 'Attendance';
//     else if (path.includes('/login')) title = 'Login';
//     else if (path.includes('/profile')) title = 'Profile';
//     else if (path.includes('/studymaterial')) title = 'Study Material';
//     else if (path.includes('/leaves')) title = 'Leaves ';
//     else if (path.includes('/notices')) title = 'Notice Board';
//     else if (path.includes('/courses')) title = 'Courses';
//     else if (path.includes('/subjects')) title = 'Subjects';
//     else if (path.includes('/users')) title = 'Users';
//     else if (path.includes('/students')) title = 'Students ';
//     document.title = title;
//   }, [location]);
//   return null;
// };
const TitleUpdater = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    let title = 'University Management';

    if (path.includes('/dashboard')) title = 'Dashboard';
    else if (path.includes('/attendance')) title = 'Attendance';
    else if (path.includes('/login')) title = 'Login';
    else if (path.includes('/profile')) title = 'Profile';
    else if (path.includes('/studymaterial')) title = 'Study Material';
    else if (path.includes('/leaves')) title = 'Leaves';
    else if (path.includes('/notices')) title = 'Notice Board';
    else if (path.includes('/courses')) title = 'Courses';
    else if (path.includes('/subjects')) title = 'Subjects';
    else if (path.includes('/users')) title = 'Users';
    else if (path.includes('/students')) title = 'Students';
    else if (path.includes('/professors')) title = 'Professors';
    // নতুন প্রফেশনাল পেজসমূহের টাইটেল:
    else if (path.includes('/finance')) title = 'Finance & Fees';
    else if (path.includes('/library')) title = 'Library Management';
    else if (path.includes('/settings')) title = 'System Settings';

    document.title = title;
  }, [location]);
  return null;
};

const App = () => {
  const { user } = useContext(AuthContext);
  const getDashboardHome = () => {

    if (!user) return <Navigate to="/" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Professor') return <Navigate to="/professor" replace />;
    if (user.role === 'Student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  };
  return (
    <Router>
      <TitleUpdater />
      <Routes>
        {/* <Route path="/" element={getDashboardHome()} /> */}
        <Route path="/" element={user ? getDashboardHome() : <Home />} />
        {/* <Route path="*" element={<Home />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={!user ? <Login /> : getDashboardHome()} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professor/*"
          element={
            <ProtectedRoute allowedRoles={['Professor']}>
              <ProfessorLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};
export default App;
