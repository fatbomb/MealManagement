import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.name || user.email);
          setIsAdmin(userData.admin || false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-md transition-all duration-400 ease-in-out p-5 lg:p-4 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-white">Cuckoo's Nest</div>
        <div className="lg:hidden">
          <button onClick={toggleMobileMenu} className="focus:outline-none text-white">
            {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
        <nav className="hidden lg:flex space-x-6 text-white">
          {user ? (
            <>
              <NavLink 
                to="/name" 
                className={({ isActive }) => 
                  isActive ? 
                  'font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-2 py-1 rounded underline-animation' : 
                  'hover:underline hover:underline-animation'
                }
              >
                {displayName}
              </NavLink>
              <NavLink 
                to="/monthmeal" 
                className={({ isActive }) => 
                  isActive ? 
                  'font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-2 py-1 rounded underline-animation' : 
                  'hover:underline hover:underline-animation'
                }
              >
                Month Summary
              </NavLink>
              <NavLink 
                to="/meals" 
                className={({ isActive }) => 
                  isActive ? 
                  'font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-2 py-1 rounded underline-animation' : 
                  'hover:underline hover:underline-animation'
                }
              >
                Meals
              </NavLink>
              <NavLink 
                to="/months" 
                className={({ isActive }) => 
                  isActive ? 
                  'font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-2 py-1 rounded underline-animation' : 
                  'hover:underline hover:underline-animation'
                }
              >
                Months
              </NavLink>
              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => 
                    isActive ? 
                    'font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-2 py-1 rounded underline-animation' : 
                    'hover:underline hover:underline-animation'
                  }
                >
                  Admin
                </NavLink>
              )}
              <button onClick={handleLogout} className="hover:underline hover:underline-animation">Logout</button>
            </>
          ) : (
            <Link to="/" className="hover:underline hover:underline-animation">Login</Link>
          )}
        </nav>
      </div>
      {isMobileMenuOpen && (
        <nav className="lg:hidden flex flex-col mt-4 space-y-2 text-white">
          {user ? (
            <>
              <NavLink 
                to="/name" 
                className={({ isActive }) => 
                  isActive ? 
                  'block px-4 py-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded font-bold underline-animation' : 
                  'block px-4 py-2 bg-blue-700 rounded hover:underline hover:underline-animation'
                }
              >
                {displayName}
              </NavLink>
              <NavLink 
                to="/monthmeal" 
                className={({ isActive }) => 
                  isActive ? 
                  'block px-4 py-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded font-bold underline-animation' : 
                  'block px-4 py-2 bg-blue-700 rounded hover:underline hover:underline-animation'
                }
              >
                Month Summary
              </NavLink>
              <NavLink 
                to="/meals" 
                className={({ isActive }) => 
                  isActive ? 
                  'block px-4 py-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded font-bold underline-animation' : 
                  'block px-4 py-2 bg-blue-700 rounded hover:underline hover:underline-animation'
                }
              >
                Meals
              </NavLink>
              <NavLink 
                to="/months" 
                className={({ isActive }) => 
                  isActive ? 
                  'block px-4 py-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded font-bold underline-animation' : 
                  'block px-4 py-2 bg-blue-700 rounded hover:underline hover:underline-animation'
                }
              >
                Months
              </NavLink>
              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => 
                    isActive ? 
                    'block px-4 py-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded font-bold underline-animation' : 
                    'block px-4 py-2 bg-blue-700 rounded hover:underline hover:underline-animation'
                  }
                >
                  Admin
                </NavLink>
              )}
              <button onClick={handleLogout} className="block px-4 py-2 bg-blue-700 rounded hover:underline hover:underline-animation">Logout</button>
            </>
          ) : (
            <Link to="/" className="block px-4 py-2 bg-blue-700 rounded hover:underline hover:underline-animation">Login</Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
