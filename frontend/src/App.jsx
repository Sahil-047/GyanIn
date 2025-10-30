import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
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

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <div className="min-h-screen flex flex-col">
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
            <Navbar />
            <main className="flex-grow">
              <Teachers />
            </main>
            <Footer />
          </div>
        } 
      />
      
      <Route 
        path="/contact" 
        element={
          <div className="min-h-screen flex flex-col">
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
  )
}

export default App