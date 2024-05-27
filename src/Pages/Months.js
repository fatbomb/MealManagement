// src/components/Months.js
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import UserDues from '../Components/UserDues';
import { toast } from 'react-toastify';

const Months = () => {
  const [user, setUser] = useState(null);
  const [isMessManager, setIsMessManager] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthlyBills, setMonthlyBills] = useState({
    houseRent: 0,
    wifiBill: 0,
    khalaBill: 0,
    currentBill: 0,
    dustBill: 0,
    festBill: 0,
    monthlyShopping1: 0,
    monthlyShopping2: 0,
    week1Shopping: 0,
    week2Shopping: 0,
    week3Shopping: 0,
    week4Shopping: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkIfMessManager(currentUser.uid);
      } else {
        setUser(null);
        setIsMessManager(false);
      }
    });
    
    // Set current month as default selected month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const formattedMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    setSelectedMonth(formattedMonth);

    return () => unsubscribe();
  }, []);

  const checkIfMessManager = async (uid) => {
    const userDoc = await getDoc(doc(firestore, 'users', uid));
    if (userDoc.exists()) {
      setIsMessManager(userDoc.data().isMessManager);
    }
  };

  const fetchBills = async (month) => {
    const billsDoc = await getDoc(doc(firestore, 'bills', month));
    if (billsDoc.exists()) {
      setMonthlyBills(billsDoc.data());
    } else {
      setMonthlyBills({
        houseRent: 0,
        wifiBill: 0,
        khalaBill: 0,
        currentBill: 0,
        dustBill: 0,
        festBill: 0,
        monthlyShopping1: 0,
        monthlyShopping2: 0,
        week1Shopping: 0,
        week2Shopping: 0,
        week3Shopping: 0,
        week4Shopping: 0
      });
    }
  };

  const fetchUsers = async () => {
    const usersCollection = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      const isMessManager = userData.isMessManager || false;
      return { id: doc.id, ...userData, isMessManager };
    });
    setUsers(usersList);
  };

  useEffect(() => {
    if (selectedMonth) {
      fetchUsers();
      fetchBills(selectedMonth);
    }
  }, [selectedMonth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMonthlyBills((prevState) => ({
      ...prevState,
      [name]: parseFloat(value)
    }));
  };

  const handleSaveBills = async () => {
    await setDoc(doc(firestore, 'bills', selectedMonth), monthlyBills);
    toast('Bills saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-300 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Monthly Bills and Dues</h1>
      <div className="flex items-center justify-center gap-4 mb-8">
        <label className="block text-lg font-medium">Select Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 border rounded-lg"
        />
        <button onClick={() => fetchBills(selectedMonth)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
          Fetch Bills
        </button>
      </div>

      <div className={`bg-white p-6 rounded-lg shadow-lg mb-8 ${isMessManager ? '' : 'opacity-50'}`}>
        <h2 className="text-2xl font-semibold mb-6">Manage Bills</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(monthlyBills).map((bill) => (
            <div key={bill} className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">{bill.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type="number"
                name={bill}
                value={monthlyBills[bill]}
                onChange={handleInputChange}
                className="p-2 border rounded-lg w-full"
                disabled={!isMessManager} // Disable input if not mess manager
              />
            </div>
          ))}
        </div>
        {isMessManager && (
          <div className="flex justify-center mt-6">
            <button onClick={handleSaveBills} className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300">
              Save Bills
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">User Dues</h2>
        {users.map(user => (
          <UserDues
            key={user.id}
            userId={user.id}
            userName={user.name}
            selectedMonth={selectedMonth}
            isMessManager={isMessManager}
          />
        ))}
      </div>
    </div>
  );
};

export default Months;
