import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminCourses from '../pages/AdminCourses';
import AdminSubjects from '../pages/AdminSubjects';
import NoticeBoard from '../pages/NoticeBoard';
import ManageLeaves from '../pages/ManageLeaves';
import AdminProfile from '../pages/AdminProfile';
import ManageDepartments from '../pages/ManageDepartments'; 
import ManageFees from '../pages/ManageFees';
import ManageSemesters from '../pages/ManageSemesters'; 
import ManageAdvising from '../pages/ManageAdvising';
import ManageTimetables from '../pages/ManageTimetables';



const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const routes = [
    { path: '/admin/dashboard', name: 'Dashboard' },
    { path: '/admin/students', name: 'Students' },
    { path: '/admin/professors', name: 'Professors' },
    { path: '/admin/departments', name: 'Departments' },
    { path: '/admin/semesters', name: 'Semesters' },
    { path: '/admin/courses', name: 'Courses' },
    { path: '/admin/subjects', name: 'Subjects' },
    { path: '/admin/notices', name: 'Notice Board' },
    { path: '/admin/leaves', name: 'Leave Requests' },
    { path: '/admin/fees', name: 'Fees Management' },
    { path: '/admin/advising', name: 'Course Advising' },
    { path: '/admin/timetable', name: 'Class Timetable' },

    { path: '/admin/profile', name: 'Profile' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Sidebar (hidden off-screen on tablet/mobile, visible on desktop) */}
      <Sidebar
        routes={routes}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div
        className="admin-layout-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <div style={{ position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
          <TopNav
            title="System Administration"
            onMenuToggle={() => setSidebarOpen(prev => !prev)}
          />
        </div>
        <div
          style={{
            padding: '1.5rem 2rem',
            flex: 1,
            overflowY: 'auto',
            height: '100%',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route
              path="students"
              element={<AdminUsers userRole="Student" />}
            />
            <Route
              path="professors"
              element={<AdminUsers userRole="Professor" />}
            />
            <Route path="departments" element={<ManageDepartments />} />
            <Route path="semesters" element={<ManageSemesters />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="notices" element={<NoticeBoard />} />
            <Route path="leaves" element={<ManageLeaves />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<AdminDashboard />} />
            <Route path="fees" element={<ManageFees />} />
            <Route path="advising" element={<ManageAdvising />} />
            <Route path="timetable" element={<ManageTimetables />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

