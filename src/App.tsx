import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Calendar, Leaf, Clock, Shield } from 'lucide-react';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Hero Section */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LawnCare Pro</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2"
              >
                Login
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Book Now
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Professional Lawn Care
              <span className="block text-green-600">Made Simple</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Book expert lawn care services in minutes. Get your perfect lawn without the hassle.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10">
                  Schedule Service
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex justify-center">
                  <Calendar className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Easy Scheduling</h3>
                <p className="mt-2 text-gray-500">Book your service in minutes with our simple scheduling system.</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <Shield className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Licensed Professionals</h3>
                <p className="mt-2 text-gray-500">All our landscapers are vetted and professionally trained.</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <Clock className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Real-Time Updates</h3>
                <p className="mt-2 text-gray-500">Stay informed with live updates on your service status.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default App;