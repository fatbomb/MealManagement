// src/components/UserDues.js
import React, { useState, useEffect, useCallback } from 'react';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';

const UserDues = ({ userId, userName, selectedMonth, isMessManager }) => {
  const [amountGiven, setAmountGiven] = useState(0);
  const [amountToPay, setAmountToPay] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [amountToAdd, setAmountToAdd] = useState(0);

  useEffect(() => {
    if (userId && selectedMonth) {
      calculateDues(userId, selectedMonth);
    }
  }, [userId, selectedMonth]);

  const fetchBills = async (month) => {
    const billsDoc = await getDoc(doc(firestore, 'bills', month));
    if (billsDoc.exists()) {
      return billsDoc.data();
    }
    return null;
  };

  const fetchUsers = async () => {
    const usersCollection = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const fetchAllUsersMealData = async (month) => {
    const users = await fetchUsers();
    let totalLunches = 0;
    let totalDinners = 0;
    let totalExtraRiceLunch = 0;
    let totalExtraRiceDinner = 0;

    for (const user of users) {
      const mealDataCollection = collection(firestore, 'users', user.id, 'meals');
      const mealDataSnapshot = await getDocs(mealDataCollection);
      const mealData = mealDataSnapshot.docs.map(doc => doc.data());
      const filteredMealData = mealData.filter(meal => meal.date.startsWith(month));

      filteredMealData.forEach(meal => {
        if (meal.lunchAvailable) totalLunches++;
        if (meal.dinnerAvailable) totalDinners++;
        totalExtraRiceLunch += meal.extraRiceLunch || 0;
        totalExtraRiceDinner += meal.extraRiceDinner || 0;
      });
    }

    return { totalLunches, totalDinners, totalExtraRiceLunch, totalExtraRiceDinner };
  };

  const fetchUserMealData = async (userId, month) => {
    const mealDataCollection = collection(firestore, 'users', userId, 'meals');
    const mealDataSnapshot = await getDocs(mealDataCollection);
    const mealData = mealDataSnapshot.docs.map(doc => doc.data());
    return mealData.filter(meal => meal.date.startsWith(month));
  };

  const calculateDues = async (userId, month) => {
    const bills = await fetchBills(month);
    const users = await fetchUsers();
    const { totalLunches, totalDinners, totalExtraRiceLunch, totalExtraRiceDinner } = await fetchAllUsersMealData(month);
    const userMealData = await fetchUserMealData(userId, month);

    if (!bills || users.length === 0 ||(totalLunches+totalDinners)===0) return;

    const generalCost = bills.houseRent + bills.wifiBill + bills.khalaBill + bills.currentBill + bills.dustBill + bills.festBill;
    const generalCostPerPerson = generalCost / users.length;

    const totalExtraRice = totalExtraRiceLunch + totalExtraRiceDinner;
    const foodCost = bills.monthlyShopping1 + bills.monthlyShopping2 +
                     bills.week1Shopping + bills.week2Shopping + bills.week3Shopping + bills.week4Shopping -
                     (10 * totalExtraRice);

    const singleDinnerCost = foodCost / (totalDinners + (totalLunches * (38 / 62)));
    const singleLunchCost = singleDinnerCost * (38 / 62);

    let userLunches = 0;
    let userDinners = 0;
    let userExtraRice = 0;

    userMealData.forEach(meal => {
      if (meal.lunchAvailable) userLunches++;
      if (meal.dinnerAvailable) userDinners++;
      userExtraRice += (meal.extraRiceLunch || 0) + (meal.extraRiceDinner || 0);
    });

    const userFoodCost = userMealData.length > 0 ? 
                         (userLunches * singleLunchCost) + (userDinners * singleDinnerCost) + (10 * userExtraRice) : 0;

    const totalAmountToPay = generalCostPerPerson + userFoodCost;

    setAmountToPay(totalAmountToPay);

    // Fetch previous dues
    const duesDoc = await getDoc(doc(firestore, 'dues', `${userId}_${month}`));
    if (duesDoc.exists()) {
      const duesData = duesDoc.data();
      setAmountGiven(duesData.amountGiven || 0);
      const dueAmount = totalAmountToPay - duesData.amountGiven;
      setAmountDue(dueAmount);
    } else {
      setAmountGiven(0);
      setAmountDue(totalAmountToPay);
    }
  };

  const handleAmountChange = (e) => {
    setAmountToAdd(parseFloat(e.target.value));
  };

  const handleSave = async () => {
    const newAmountGiven = amountGiven + amountToAdd;
    const newAmountDue = amountToPay - newAmountGiven;

    await setDoc(doc(firestore, 'dues', `${userId}_${selectedMonth}`), {
      amountGiven: newAmountGiven
    });

    setAmountGiven(newAmountGiven);
    setAmountDue(newAmountDue);
    setAmountToAdd(0);

    toast('User dues updated successfully!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h3 className="text-xl font-semibold mb-4">{userName}</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="font-medium">Amount Given:</span>
          <span>{amountGiven} TK</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Amount to Pay:</span>
          <span>{amountToPay.toFixed(2)} TK</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Amount Due:</span>
          <span>{amountDue.toFixed(2)} TK</span>
        </div>
        {isMessManager && (
          <>
            <div className="flex justify-between">
              <label className="block font-medium">Add/Remove Amount:</label>
              <input
                type="number"
                value={amountToAdd}
                onChange={handleAmountChange}
                className="p-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSave}
                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDues;
