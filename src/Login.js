import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import Lottie from 'react-lottie-player';
import loginAnimation from './lotties/login-animation.json';  // Replace with your actual Lottie animation file path
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/name');
    } catch (error) {
      toast(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast('Password reset email sent!');
    } catch (error) {
      toast(error.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      {/* Animation in top left corner */}
      <Lottie
        loop
        animationData={loginAnimation}
        play
        style={{ width: 100, height: 100, position: 'absolute', top: 0, left: 0 }}
      />
      {/* Animation in top right corner */}
      <Lottie
        loop
        animationData={loginAnimation}
        play
        style={{ width: 100, height: 100, position: 'absolute', top: 0, right: 0 }}
      />
      {/* Animation in bottom left corner */}
      <Lottie
        loop
        animationData={loginAnimation}
        play
        style={{ width: 100, height: 100, position: 'absolute', bottom: 0, left: 0 }}
      />
      {/* Animation in bottom right corner */}
      <Lottie
        loop
        animationData={loginAnimation}
        play
        style={{ width: 100, height: 100, position: 'absolute', bottom: 0, right: 0 }}
      />
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center relative z-10">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-3 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-3 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLogin}
          className="w-full font-bold text-xl mb-4 p-3 bg-blue-500 text-white rounded hover:bg-blue-500 transition duration-200"
        >
          Login
        </button>
        <button
          onClick={handleForgotPassword}
          className="w-full p-3 font-bold text-xl bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
        >
          Forgot Password
        </button>
      </div>
    </div>
  );
};

export default Login;
