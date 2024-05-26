// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import SliderPage from './Slider';
import Header from './Header';
import Footer from './Footer';
import Name from './Pages/Name';
import Meals from './Pages/Meal';
import Months from './Pages/Months';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header id='header' />
        <main className=" flex-grow">
          <Routes >
          <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />
            <Route path="/slider" element={<SliderPage />} />
            <Route path="/name" element={<Name />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/months" element={<Months />} />
            {/* Add other routes here */}
          </Routes>
        </main>
        <Footer id='footer' />
      </div>
    </Router>
  );
}

export default App;
