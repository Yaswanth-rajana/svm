import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ADMIN_ROUTES } from '../constants/routes';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { RoleGuard } from '../components/common/RoleGuard';
import AdminLayout from '../components/layout/AdminLayout';

// Pages
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import CoursesList from '../pages/Courses/CoursesList';
import CourseWizard from '../pages/Courses/CourseWizard';
import CourseDetailsPage from '../pages/Courses/CourseDetailsPage';
import ModuleWizard from '../pages/Courses/components/ModuleWizard/ModuleWizard';
import ModuleDetailsPage from '../pages/Courses/ModuleDetailsPage';
import LessonWizard from '../pages/Courses/components/LessonWizard/LessonWizard.jsx';
import StudentsDirectory from '../pages/Students/StudentsDirectory';

// Placeholder Pages for Errors
const NotFound = () => <div className="p-8 text-center"><h1 className="text-3xl font-bold text-white">404 - Not Found</h1></div>;
const Forbidden = () => <div className="p-8 text-center"><h1 className="text-3xl font-bold text-white">403 - Forbidden</h1><p className="text-gray-400">You don't have permission to access this resource.</p></div>;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to={ADMIN_ROUTES.LOGIN} replace />} />
          <Route path={ADMIN_ROUTES.LOGIN} element={<Login />} />
          
          {/* Protected Routes wrapped in Layout */}
          <Route element={<RoleGuard><AdminLayout /></RoleGuard>}>
            <Route path={ADMIN_ROUTES.DASHBOARD} element={<Dashboard />} />
            
            {/* Course Routes */}
            <Route path={ADMIN_ROUTES.COURSES} element={<CoursesList />} />
            <Route path={`${ADMIN_ROUTES.COURSES}/create`} element={<CourseWizard />} />
            <Route path={`${ADMIN_ROUTES.COURSES}/edit/:id`} element={<CourseWizard />} />
            <Route path={`${ADMIN_ROUTES.COURSES}/:id`} element={<CourseDetailsPage />} />
            
            {/* Module Routes */}
            <Route path={`${ADMIN_ROUTES.COURSES}/:id/modules/create`} element={<ModuleWizard />} />
            <Route path={`${ADMIN_ROUTES.COURSES}/:id/modules/edit/:moduleId`} element={<ModuleWizard />} />
            <Route path={`${ADMIN_ROUTES.COURSES}/:id/modules/:moduleId`} element={<ModuleDetailsPage />} />
            
            {/* Lesson Routes */}
            <Route path={`${ADMIN_ROUTES.COURSES}/:id/modules/:moduleId/lessons/create`} element={<LessonWizard />} />
            <Route path={`${ADMIN_ROUTES.COURSES}/:id/modules/:moduleId/lessons/edit/:lessonId`} element={<LessonWizard />} />
            
            {/* Student Routes */}
            <Route path={ADMIN_ROUTES.STUDENTS} element={<StudentsDirectory />} />
            
            {/* Future routes will be added here */}
          </Route>
          
          <Route path={ADMIN_ROUTES.FORBIDDEN} element={<Forbidden />} />
          <Route path={ADMIN_ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
};
