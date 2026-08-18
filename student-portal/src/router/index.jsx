import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import StudentLayout from '../layouts/StudentLayout';
import Login from '../pages/Auth/Login';
import NotFound from '../pages/NotFound/NotFound';
import SkeletonPage from '../components/common/SkeletonLoader';
import useUIStore from '../store/useUIStore';
import { ROUTES } from '../constants/routes';

// Route-level code splitting: Lazy-load all major portal pages
const Home = lazy(() => import('../pages/Home/Home'));
const CourseDetails = lazy(() => import('../pages/Course/CourseDetails'));
const ModuleDetails = lazy(() => import('../pages/Module/ModuleDetails'));
const Announcements = lazy(() => import('../pages/Announcements/Announcements'));
const Profile = lazy(() => import('../pages/Profile/Profile'));

/**
 * Scroll Restoration & State Persistence Helper
 */
const ScrollRestorationHelper = () => {
  const { pathname } = useLocation();
  const saveScrollPosition = useUIStore((state) => state.saveScrollPosition);
  const getScrollPosition = useUIStore((state) => state.getScrollPosition);

  useEffect(() => {
    // Save scroll position on scroll
    const handleScroll = () => {
      saveScrollPosition(pathname, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Restore cached scroll position or scroll to top
    const savedPos = getScrollPosition(pathname);
    window.scrollTo(0, savedPos);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname, saveScrollPosition, getScrollPosition]);

  return null;
};

export const AppRouter = () => {
  return (
    <>
      <ScrollRestorationHelper />
      <Suspense fallback={<SkeletonPage />}>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          {/* Public Routes (Unauthenticated only) */}
          <Route element={<PublicRoute />}>
            <Route path={ROUTES.LOGIN} element={<Login />} />
          </Route>

          {/* Protected Routes with Persistent Mounted StudentLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<StudentLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<Home />} />
              <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetails />} />
              <Route path={ROUTES.MODULE_DETAIL} element={<ModuleDetails />} />
              <Route path={ROUTES.ANNOUNCEMENTS} element={<Announcements />} />
              <Route path={ROUTES.PROFILE} element={<Profile />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRouter;
