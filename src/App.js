import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext'; // Import AuthProvider and useAuth
import Login from './Login';
import SliderPage from './Slider';
import Header from './Header';
import Footer from './Footer';
import Name from './Pages/Name';
import Meals from './Pages/Meal';
import Months from './Pages/Months';
import Admin from './Pages/Admin';
import MealsPage from './Pages/MonthSummary';

function App() {
  const { currentUser } = useAuth(); // Get the current user from useAuth hook

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header id='header' />
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/slider" element={<SliderPage />} />
            <Route path="/name" element={<Name />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/months" element={<Months />} />
            <Route path="/monthmeal" element={<MealsPage />} />
            {/* Redirect to the appropriate default route based on authentication status */}
            <Route path="/" element={currentUser ? <Navigate to="/name" /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer id='footer' />
      </div>
    </Router>
  );
}

export default App;
