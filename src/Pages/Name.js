import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import MealUpdateForm from '../Components/MealUpdateForm'; // Import the meal update form component

const Name = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isUserDataExists, setIsUserDataExists] = useState(false);
  const [showMealUpdate, setShowMealUpdate] = useState(false); // State to control the visibility of the meal update form
  const [isKhalaInCharge, setIsKhalaInCharge] = useState(false);
  const [isFoodSavingInCharge, setIsFoodSavingInCharge] = useState(false);
  const [isMessManager, setIsMessManager] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      setIsUserDataExists(userDoc.exists());
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.name);
        setPhoneNumber(userData.phoneNumber);
        setIsAvailable(userData.isAvailable);
        checkRoles(userData);
      }
    };

    const checkRoles = (userData) => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayName = daysOfWeek[new Date().getDay()];
      const currentDayIndex = daysOfWeek.indexOf(currentDayName); // Sunday - Saturday : 0 - 6
      const currentMonth = new Date().getMonth() + 1; // January - December : 1 - 12
      console.log(currentDayName, userData.foodSavingincharge);

      setIsKhalaInCharge(userData.khalaIncharge === currentDayName);
      setIsFoodSavingInCharge(userData.foodSavingIncharge === currentDayName);
      setIsMessManager(userData.messManager === currentMonth);
    };

    fetchData();
  }, [currentUser, navigate]);

  const updateUserData = async (userData) => {
    const userDocRef = doc(firestore, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, userData);
      alert('User data updated successfully!');
    } catch (error) {
      alert('Error updating user data: ' + error.message);
    }
  };

  const saveUserData = async (userData) => {
    const userDocRef = doc(firestore, 'users', currentUser.uid);
    try {
      await setDoc(userDocRef, userData);
      alert('User data saved successfully!');
    } catch (error) {
      alert('Error saving user data: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name,
      email: currentUser.email,
      phoneNumber,
      isAvailable
    };

    if (isUserDataExists) {
      await updateUserData(userData);
    } else {
      await saveUserData(userData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 grid items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mt-5">
        <h1 className="text-3xl font-bold mb-6 text-center">Profile Information</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-left font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-left font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={currentUser ? currentUser.email : ''}
              readOnly
              className="w-full p-3 border border-gray-300 rounded bg-gray-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-left font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isKhalaInCharge}
                readOnly
                className="mr-2"
              />
              <label>Is Khala in Charge</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isFoodSavingInCharge}
                readOnly
                className="mr-2"
              />
              <label>Is Food Saving in Charge</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isMessManager}
                readOnly
                className="mr-2"
              />
              <label>Is Mess Manager</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="mr-2"
              />
              <label>Is Available</label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition duration-200"
          >
            {isUserDataExists ? 'Update' : 'Save'}
          </button>
        </form>

        <div className='bg-white p-4 rounded-lg shadow-lg max-w-md w-full mt-5 mb-5'>
          <button
            className="w-full p-3 bg-blue-500 text-white font-bold rounded mt-4 hover:bg-blue-600 transition duration-200"
            onClick={() => setShowMealUpdate(!showMealUpdate)}
          >
            Update Meal
          </button>

          {showMealUpdate && <MealUpdateForm userId={currentUser.uid} />}
        </div>
      </div>
    </div>
  );
};

export default Name;
