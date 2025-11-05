import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import OffersBanner from './components/layout/OffersBanner'
import Footer from './components/layout/Footer'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ConfirmToast from './components/common/ConfirmToast'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import CMS from './pages/admin/CMS'
import Readmissions from './pages/admin/Readmissions'
import Slots from './pages/admin/Slots'
import LandingPage from './pages/public/LandingPage'
import Courses from './pages/public/Courses'
import ContactUs from './pages/public/ContactUs'
import Admissions from './pages/public/Admissions'
import PublicLogin from './pages/public/Login'
import Teachers from './pages/public/Teachers'
import Merchandise from './pages/public/Merchandise'

// Global confirm state
let globalConfirmState = null
let globalSetConfirmState = null

export const useGlobalConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  })

  // Store globally for use in non-React contexts
  globalConfirmState = confirmState
  globalSetConfirmState = setConfirmState

  const showConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }))
          setTimeout(() => resolve(true), 100)
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }))
          setTimeout(() => resolve(false), 100)
        },
      })
    })
  }

  return { confirmState, showConfirm }
}

// Export function for use in components
export const confirmToast = (message, options = {}) => {
  if (!globalSetConfirmState) {
    // Fallback to window.confirm if not initialized
    return Promise.resolve(window.confirm(message))
  }

  return new Promise((resolve) => {
    globalSetConfirmState({
      isOpen: true,
      message,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: () => {
        globalSetConfirmState(prev => ({ ...prev, isOpen: false }))
        setTimeout(() => resolve(true), 100)
      },
      onCancel: () => {
        globalSetConfirmState(prev => ({ ...prev, isOpen: false }))
        setTimeout(() => resolve(false), 100)
      },
    })
  })
}

function App() {
  const { confirmState } = useGlobalConfirm()

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <ConfirmToast
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
      <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <div className="min-h-screen flex flex-col">
            <OffersBanner />
            <Navbar />
            <main className="flex-grow">
              <LandingPage />
            </main>
            <Footer />
          </div>
        } 
      />
      
      <Route 
        path="/courses" 
        element={
          <div className="min-h-screen flex flex-col">
            <OffersBanner />
            <Navbar />
            <main className="flex-grow">
              <Courses />
            </main>
            <Footer />
          </div>
        } 
      />

      <Route 
        path="/teachers" 
        element={
          <div className="min-h-screen flex flex-col">
            <OffersBanner />
            <Navbar />
            <main className="flex-grow">
              <Teachers />
            </main>
            <Footer />
          </div>
        } 
      />

      <Route 
        path="/merchandise" 
        element={
          <div className="min-h-screen flex flex-col">
            <OffersBanner />
            <Navbar />
            <main className="flex-grow">
              <Merchandise />
            </main>
            <Footer />
          </div>
        } 
      />
      
      <Route 
        path="/contact" 
        element={
          <div className="min-h-screen flex flex-col">
            <OffersBanner />
            <Navbar />
            <main className="flex-grow">
              <ContactUs />
            </main>
            <Footer />
          </div>
        } 
      />
      
      <Route 
        path="/admissions" 
        element={
          <div className="min-h-screen flex flex-col">
            <OffersBanner />
            <Navbar />
            <main className="flex-grow">
              <Admissions />
            </main>
            <Footer />
          </div>
        } 
      />

      <Route 
        path="/login" 
        element={
          <div className="min-h-screen flex flex-col">
            <OffersBanner />
            <Navbar />
            <main className="flex-grow">
              <PublicLogin />
            </main>
            <Footer />
          </div>
        } 
      />

      {/* Backward-compatible routes map to the unified page with preselected tabs */}
      <Route 
        path="/admission" 
        element={
          <div className="min-h-screen flex flex-col">
            <OffersBanner />
            <Navbar />
            <main className="flex-grow">
              <Admissions defaultView="admission" />
            </main>
            <Footer />
          </div>
        } 
      />
      <Route 
        path="/readmissions" 
        element={
          <div className="min-h-screen flex flex-col">
            <OffersBanner />
            <Navbar />
            <main className="flex-grow">
              <Admissions defaultView="readmission" />
            </main>
            <Footer />
          </div>
        } 
      />
      
      {/* Admin Login Route */}
      <Route path="/admin/login" element={<Login />} />
      
      {/* Admin Routes - All wrapped in AdminLayout and Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cms" element={<CMS />} />
          <Route path="readmissions" element={<Readmissions />} />
          <Route path="slots" element={<Slots />} />
          <Route index element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
    </>
  )
}

export default App