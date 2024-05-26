import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('khala');
  const [khalaIncharge, setKhalaIncharge] = useState(Array(7).fill(''));
  const [foodSavingIncharge, setFoodSavingIncharge] = useState(Array(7).fill(''));
  const [messManager, setMessManager] = useState(Array(12).fill(''));
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({
    khalaIncharge: ["", "", "", "", "", "", ""],
    foodSavingIncharge: ["", "", "", "", "", "", ""],
    messManager: ["", "", "", "", "", "", "", "", "", "", "", ""]
  });

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(firestore, 'roles', 'currentAssignments');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setKhalaIncharge(data.khalaIncharge || Array(7).fill(''));
        setFoodSavingIncharge(data.foodSavingIncharge || Array(7).fill(''));
        setMessManager(data.messManager || Array(12).fill(''));
      }

      // Fetch all users
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);

      // Load user roles from JSON file
      const userRolesData = {
        khalaIncharge: Array(7).fill(''),
        foodSavingIncharge: Array(7).fill(''),
        messManager: Array(12).fill('')
      };
      // Load user roles from JSON file
      try {
        const response = await fetch('path/to/user_roles.json'); // Adjust the path accordingly
        if (!response.ok) {
          throw new Error('Failed to fetch user roles data');
        }
        const jsonData = await response.json();
        setUserRoles(jsonData);
      } catch (error) {
        console.error('Error loading user roles data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e, type) => {
    e.preventDefault();

    let data;
    if (type === 'khala') {
      data = { khalaIncharge };
    } else if (type === 'foodSaving') {
      data = { foodSavingIncharge };
    } else if (type === 'messManager') {
      data = { messManager };
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
          await updateDoc(userDocRef, { khalaIncharge: userRoles.khalaIncharge });
        }
      } else if (type === 'foodSaving') {
        for (let i = 0; i < foodSavingIncharge.length; i++) {
          const userDocRef = doc(firestore, 'users', foodSavingIncharge[i]);
          await updateDoc(userDocRef, { foodSavingIncharge: userRoles.foodSavingIncharge });
        }
      } else if (type === 'messManager') {
        for (let i = 0; i < messManager.length; i++) {
          const userDocRef = doc(firestore, 'users', messManager[i]);
          await updateDoc(userDocRef, { messManager: userRoles.messManager });
        }
      }

      alert('Roles updated successfully!');
    } catch (error) {
      console.error('Error updating roles: ', error);
      alert('Error updating roles: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
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
            <h2 className="text-2xl mb-4">Set Khala In Charge for 7 Days</h2>
            {khalaIncharge.map((userId, index) => (
              <div key={index} className="mb-2">
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
            <h2 className="text-2xl mb-4">Set Food Saving In Charge             for 7 Days</h2>
            {foodSavingIncharge.map((userId, index) => (
              <div key={index} className="mb-2">
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
                  <option value="">Select User</option>
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
          <form onSubmit={(e) => handleSubmit(e, 'messManager')}>
            <h2 className="text-2xl mb-4">Set Mess Manager for 12 Months</h2>
            {messManager.map((userId, index) => (
              <div key={index} className="mb-2">
                <label className="block text-left font-medium mb-1">Month {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][index]}</label>
                <select
                  value={userId}
                  onChange={(e) => {
                    const newMonths = [...messManager];
                    newMonths[index] = e.target.value;
                    setMessManager(newMonths);
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
              Save Mess Manager
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Admin;

