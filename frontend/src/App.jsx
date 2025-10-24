import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import CMS from './pages/admin/CMS'
import Readmissions from './pages/admin/Readmissions'
import Slots from './pages/admin/Slots'
import Reports from './pages/admin/Reports'
import LandingPage from './pages/public/LandingPage'
import Courses from './pages/public/Courses'
import ContactUs from './pages/public/ContactUs'

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
      
      {/* Admin Routes - All wrapped in AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="cms" element={<CMS />} />
        <Route path="readmissions" element={<Readmissions />} />
        <Route path="slots" element={<Slots />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}

export default App