// Admin.jsx
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import MonthManagers from '../Components/MonthManagers'; // Import the MonthManagers component
import { toast } from 'react-toastify';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('khala');
  const [khalaIncharge, setKhalaIncharge] = useState(Array(7).fill(''));
  const [foodSavingIncharge, setFoodSavingIncharge] = useState(Array(7).fill(''));
  const [messManager, setMessManager] = useState(Array(12).fill(Array(0)));

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(firestore, 'roles', 'currentAssignments');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setKhalaIncharge(data.khalaIncharge || Array(7).fill(''));
        setFoodSavingIncharge(data.foodSavingIncharge || Array(7).fill(''));
        setMessManager(data.messManager || Array(12).fill([]));
      }

      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => {
        const userData = doc.data();
        const isMessManager = userData.isMessManager || false; // Set isMessManager to false if it's not defined in Firestore
        return { id: doc.id, ...userData, isMessManager };
      });
      setUsers(usersList);
    };
    fetchData();
  }, []);

  const handleMonthManagersUpdate = (monthIndex, managers) => {
    const newMessManager = [...messManager];
    newMessManager[monthIndex] = managers;
    setMessManager(newMessManager);
  };
  const handleUserUpdate = async (userId, isMessManager) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { isMessManager });
      // Update the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, isMessManager } : user
        )
      );
      toast('User updated successfully!');
    } catch (error) {
      console.error('Error updating user: ', error);
      toast('Error updating user: ' + error.message);
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    let data;

    let flattenedMessManager; // Define flattenedMessManager here
    if (type === 'khala') {
      data = { khalaIncharge };
    } else if (type === 'foodSaving') {
      data = { foodSavingIncharge };
    } else if (type === 'messManager') {
      // Flatten the messManager array
      const flattenedMessManager = messManager.reduce((acc, managers, monthIndex) => {
        managers.forEach(manager => {
          acc.push({ monthIndex, manager });
        });
        return acc;
      }, []);
      data = { messManager: flattenedMessManager };
    }
    try {
      const rolesDocRef = doc(firestore, 'roles', 'currentAssignments');
      const rolesDoc = await getDoc(rolesDocRef);
      if (rolesDoc.exists()) {
        await updateDoc(rolesDocRef, data);
      } else {
        await setDoc(rolesDocRef, data);
      }
  
      // Update user roles in Firestore
      if (type === 'khala') {
        for (let i = 0; i < khalaIncharge.length; i++) {
          const userDocRef = doc(firestore, 'users', khalaIncharge[i]);
          await updateDoc(userDocRef, { khalaIncharge });
        }
      } else if (type === 'foodSaving') {
        for (let i = 0; i < foodSavingIncharge.length; i++) {
          const userDocRef = doc(firestore, 'users', foodSavingIncharge[i]);
          await updateDoc(userDocRef, { foodSavingIncharge });
        }
      } else if (type === 'messManager') {
        for (let i = 0; i < flattenedMessManager.length; i++) {
          const { monthIndex, manager } = flattenedMessManager[i];
          const userDocRef = doc(firestore, 'users', manager);
          const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][monthIndex];
          const monthDocRef = collection(userDocRef, 'messManager').doc(monthName);
          const selected = manager === userDocRef.id; // Set selected to true if the user is selected as manager for this month
          await setDoc(monthDocRef, { selected });
        }
      }
      toast('Roles updated successfully!');
    } catch (error) {
      console.error('Error updating roles: ', error);
      toast('Error updating roles: ' + error.message);
    }
  };
  
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 to-purple-500 p-8 mt-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
        <div className="flex justify-center mb-4">
          <button
            className={`p-2 ${activeTab === 'khala' ? 'font-bold' : ''}`}
            onClick={() => setActiveTab('khala')}
          >
            Khala In Charge
          </button>
          <button
            className={`p-2 ${activeTab === 'foodSaving' ? 'font-bold' : ''}`}
            onClick={() => setActiveTab('foodSaving')}
          >
            Food Saving In Charge
          </button>
          <button
            className={`p-2 ${activeTab === 'messManager' ? 'font-bold' : ''}`}
            onClick={() => setActiveTab('messManager')}
          >
            Mess Manager
          </button>
        </div>
        {activeTab === 'khala' && (
          <form onSubmit={(e) => handleSubmit(e, 'khala')}>
            <h2 className="text-2xl mb-4">Set Khala In Charge</h2>
            {khalaIncharge.map((userId, index) => (
              <div key={index} className=" grid grid-cols-2 mb-2">
                <label className="block text-left font-medium mb-1">Day {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]}</label>
                <select
                  value={userId}
                  onChange={(e) => {
                    const newDays = [...khalaIncharge];
                    newDays[index] = e.target.value;
                    setKhalaIncharge(newDays);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            ))}
            <button type="submit" className="w-full p-2 bg-blue-500 text-white font-bold rounded mt-4">
              Save Khala In Charge
            </button>
          </form>
        )}
        {activeTab === 'foodSaving' && (
          <form onSubmit={(e) => handleSubmit(e, 'foodSaving')}>
            <h2 className="text-2xl mb-4">Set Food Saving In Charge for 7 Days</h2>
            {foodSavingIncharge.map((userId, index) => (
              <div key={index} className="mb-2 grid grid-cols-2">
                <label className="block text-left font-medium mb-1">Day {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]}</label>
                <select
                  value={userId}
                  onChange={(e) => {
                    const newDays = [...foodSavingIncharge];
                    newDays[index] = e.target.value;
                    setFoodSavingIncharge(newDays);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select                 User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            ))}
            <button type="submit" className="w-full p-2 bg-blue-500 text-white font-bold rounded mt-4">
              Save Food Saving In Charge
            </button>
          </form>
        )}
        {activeTab === 'messManager' && (
          <div>
          <h2 className="text-2xl mb-4">Manage Mess Managers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map(user => (
              <div key={user.id} className="bg-white rounded-lg shadow-md p-4">
                <p className="text-lg font-semibold mb-2">{user.name}</p>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={user.isMessManager}
                    onChange={e => handleUserUpdate(user.id, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Is Mess Manager</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        

        )}
      </div>
    </div>
  );
};

export default Admin;

