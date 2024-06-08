import React, { useState, useEffect, useCallback } from 'react';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';

const UserDues = ({ userId, userName, selectedMonth, isMessManager, allUsersMealData, users }) => {
  const [amountGiven, setAmountGiven] = useState(0);
  const [amountToPay, setAmountToPay] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [amountToAdd, setAmountToAdd] = useState(0);

  useEffect(() => {
    if (userId && selectedMonth && allUsersMealData) {
      calculateDues(userId, selectedMonth, allUsersMealData);
    }
  }, [userId, selectedMonth, allUsersMealData]);

  const fetchBills = async (month) => {
    const billsDoc = await getDoc(doc(firestore, 'bills', month));
    if (billsDoc.exists()) {
      return billsDoc.data();
    }
    return null;
  };

  // const fetchUserMealData = async (userId, month) => {
  //   const mealDataCollection = collection(firestore, 'users', userId, 'meals');
  //   const mealDataSnapshot = await getDocs(mealDataCollection);
  //   const mealData = mealDataSnapshot.docs.map(doc => doc.data());
  //   return mealData.filter(meal => meal.date.startsWith(month));
  // };
  const fetchMonthlyAggregates = async (userId, month) => {
    const userMonthlyAggregatesDoc = await getDoc(doc(firestore, 'users', userId, 'monthlyAggregates', month));
    if (userMonthlyAggregatesDoc.exists()) {
      return {
        totalLunchesu: userMonthlyAggregatesDoc.data().totalLunches || 0,
        totalDinnersu: userMonthlyAggregatesDoc.data().totalDinners || 0,
        totalExtraRiceLunchu: userMonthlyAggregatesDoc.data().totalExtraRiceLunch || 0,
        totalExtraRiceDinneru: userMonthlyAggregatesDoc.data().totalExtraRiceDinner || 0
      };
      
    }
    return null;
  };

  const calculateDues = async (userId, month, allUsersMealData) => {
    const bills = await fetchBills(month);
    const { totalLunches, totalDinners, totalExtraRiceLunch, totalExtraRiceDinner } = allUsersMealData;
    // const userMealData = await fetchUserMealData(userId, month);
    const userMonthlyAggregates = await fetchMonthlyAggregates(userId, month);
    console.log(userName,userMonthlyAggregates);
    const { totalLunchesu=0, totalDinnersu=0, totalExtraRiceLunchu=0, totalExtraRiceDinneru=0 } = userMonthlyAggregates||{};
    const totalExtraRiceu = totalExtraRiceLunchu + totalExtraRiceDinneru;

    if (!bills || (totalLunches + totalDinners) === 0) return;

    const generalCost = bills.houseRent + bills.wifiBill + bills.khalaBill + bills.currentBill + bills.dustBill + bills.festBill;
    const generalCostPerPerson = generalCost / users.length;

    const totalExtraRice = totalExtraRiceLunch + totalExtraRiceDinner;
    const foodCost = bills.monthlyShopping1 + bills.monthlyShopping2 +
                     bills.week1Shopping + bills.week2Shopping + bills.week3Shopping + bills.week4Shopping -
                     (10 * totalExtraRice);

    const singleDinnerCost = foodCost / (totalDinners + (totalLunches * (38 / 62)));
    const singleLunchCost = singleDinnerCost * (38 / 62);
    console.log(singleDinnerCost,singleLunchCost);


    const userFoodCost =  userMonthlyAggregates!=null ? 
                         (totalLunchesu * singleLunchCost) + (totalDinnersu * singleDinnerCost) + (10 * totalExtraRiceu) : 0;

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
          <div>
          <div className="flex flex-col md:flex-row md:justify-between">
            <label className="block font-medium mb-4 md:mb-0">Add/Remove Amount:</label>
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
        </div>
        )}
      </div>
    </div>
  );
};

export default UserDues;
