import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SignUpPage from './pages/SignUpPage';

import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import toast, { Toaster } from 'react-hot-toast'; // Import Toaster
import { Loader } from 'lucide-react';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth ,onlineUsers} = useAuthStore();
  const {theme}=useThemeStore();
  useEffect(() => {
    checkAuth()
      .then(() => toast.success('Authentication checked successfully!'))
      .catch(() => toast.error('Error checking authentication.'));
  }, [checkAuth]);

  console.log({ authUser });
  console.log({onlineUsers});

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser? <HomePage/> : <Navigate to="/login"/>}/>
        <Route path="/signup" element={!authUser? <SignUpPage/>:<Navigate to="/"/>}/>
        <Route path="/login" element={!authUser ? <LoginPage/>: <Navigate to="/"/>}/>
        <Route path="/settings" element={<SettingsPage/>}/>
        <Route path="/profile" element={authUser? <ProfilePage/>: <Navigate to="/login"/>}/>
      </Routes>
      <Toaster/>
    </div>
  );
};

export default App;
