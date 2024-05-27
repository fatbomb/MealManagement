import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig'; // Ensure firestore is imported
import { doc, getDoc } from 'firebase/firestore';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // State to track if user is admin

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Fetch user's name and admin status from Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.name || user.email);
          setIsAdmin(userData.admin || false); // Check if user is admin
        } else {
          setDisplayName(user.email);
        }
      } else {
        setDisplayName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      try {
        await auth.signOut();
        navigate('/');
      } catch (error) {
        console.error('Error logging out: ', error);
      }
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">Cuckoo's Nest</div>
      <nav className="flex space-x-4">
        {user ? (
          <>
            <NavLink to="/name" className={`hover:underline ${location.pathname === '/name' ? 'font-bold' : ''}`}>{displayName}</NavLink>
            <NavLink to="/monthmeal" className={`hover:underline ${location.pathname === '/monthmeal' ? 'font-bold' : ''}`}>Month Summary</NavLink>
            <NavLink to="/meals" className={`hover:underline ${location.pathname === '/meals' ? 'font-bold' : ''}`}>Meals</NavLink>
            <NavLink to="/months" className={`hover:underline ${location.pathname === '/months' ? 'font-bold' : ''}`}>Months</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={`hover:underline ${location.pathname === '/admin' ? 'font-bold' : ''}`}>Admin</NavLink>
            )}
            <button onClick={handleLogout} className="hover:underline">Logout</button>
          </>
        ) : (
          <Link to="/" className="hover:underline">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
