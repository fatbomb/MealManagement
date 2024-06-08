import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MealUpdateForm = ({ userId, givenDate, isMessmanager }) => {
  const [date, setDate] = useState('');
  const [day, setDay] = useState('');
  const [lunchAvailable, setLunchAvailable] = useState(false);
  const [dinnerAvailable, setDinnerAvailable] = useState(false);
  const [extraRiceLunch, setExtraRiceLunch] = useState(0);
  const [extraRiceDinner, setExtraRiceDinner] = useState(0);
  const [editable, setEditable] = useState(true);
  const [dinnerEditable, setDinnerEditable] = useState(true);
  const [prevMealData, setPrevMealData] = useState({});
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (givenDate) {
      const formattedDate = givenDate.toISOString().split('T')[0];
      setDate(formattedDate);
    }
  }, [givenDate]);

  useEffect(() => {
    if (date) {
      const selectedDate = new Date(date);
      const options = { weekday: 'long' };
      const dayName = new Intl.DateTimeFormat('en-US', options).format(selectedDate);
      setDay(dayName);
    }
  }, [date]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(firestore, `users`, userId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUserName(userData.name);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchMealData = async () => {
      if (!date) return;
      const mealDocRef = doc(firestore, `users/${userId}/meals`, date);
      const mealDocSnapshot = await getDoc(mealDocRef);
      if (mealDocSnapshot.exists()) {
        const mealData = mealDocSnapshot.data();
        setPrevMealData(mealData);
        setLunchAvailable(mealData.lunchAvailable || false);
        setDinnerAvailable(mealData.dinnerAvailable || false);
        setExtraRiceLunch(mealData.extraRiceLunch || 0);
        setExtraRiceDinner(mealData.extraRiceDinner || 0);
      } else {
        setLunchAvailable(false);
        setDinnerAvailable(false);
        setExtraRiceLunch(0);
        setExtraRiceDinner(0);
      }
    };

    fetchMealData();
  }, [date, userId]);

  useEffect(() => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const selectedDate = new Date(date);

    if (selectedDate.getDate() < currentDate.getDate() || (currentDate.getDate() === selectedDate.getDate() && currentHour >= 19)) {
      setEditable(false);
      setDinnerEditable(false);
    } else if (selectedDate.getDate() === currentDate.getDate() && currentHour >= 9 && currentHour < 19) {
      setDinnerEditable(true);
      setEditable(false);
    } else {
      setEditable(true);
      setDinnerEditable(true);
    }
  }, [date]);

  const updateAggregates = async (mealData, userId, date, prevMealData) => {
    const [year, month] = date.split('-');
    const monthYear = `${year}-${month}`;
    const dailyAggregateRef = doc(firestore, `dailyAggregates`, date);
    const monthlyAggregateRef = doc(firestore, `users/${userId}/monthlyAggregates`, monthYear);

    const dailyAggregateDoc = await getDoc(dailyAggregateRef);
    const monthlyAggregateDoc = await getDoc(monthlyAggregateRef);

    let dailyAggregateData = dailyAggregateDoc.exists() ? dailyAggregateDoc.data() : {
      totalLunches: 0,
      totalDinners: 0,
      totalExtraRiceLunch: 0,
      totalExtraRiceDinner: 0
    };

    let monthlyAggregateData = monthlyAggregateDoc.exists() ? monthlyAggregateDoc.data() : {
      totalLunches: 0,
      totalDinners: 0,
      totalExtraRiceLunch: 0,
      totalExtraRiceDinner: 0
    };

    // Decrease counts if lunchAvailable or dinnerAvailable changed from true to false
    if (prevMealData?.lunchAvailable && !mealData.lunchAvailable) {
      dailyAggregateData.totalLunches -= 1;
      monthlyAggregateData.totalLunches -= 1;
    }
    if (prevMealData?.dinnerAvailable && !mealData.dinnerAvailable) {
      dailyAggregateData.totalDinners -= 1;
      monthlyAggregateData.totalDinners -= 1;
    }
    if (prevMealData?.extraRiceLunch > mealData.extraRiceLunch) {
      dailyAggregateData.extraRiceLunch -= (prevMealData?.extraRiceLunch - mealData.extraRiceLunch)
      monthlyAggregateData.extraRiceLunch -= (prevMealData?.extraRiceLunch - mealData.extraRiceLunch)
    }
    if (prevMealData?.extraRiceDinner > mealData.extraRiceDinner) {
      dailyAggregateData.extraRiceDinner -= (prevMealData?.extraRiceDinner - mealData.extraRiceDinner)
      monthlyAggregateData.extraRiceDinner -= (prevMealData?.extraRiceDinner - mealData.extraRiceDinner)
    }

    // Update counts for extra rice
    if (mealData.lunchAvailable && !prevMealData?.lunchAvailable) {
      dailyAggregateData.totalLunches += 1;
      monthlyAggregateData.totalLunches += 1;
    }
    if (mealData.dinnerAvailable && !prevMealData?.dinnerAvailable) {
      dailyAggregateData.totalDinners += 1;
      monthlyAggregateData.totalDinners += 1;
    }
    // Ensure prevMealData and its properties are properly initialized
    const prevExtraRiceLunch = prevMealData?.extraRiceLunch || 0;
    const prevExtraRiceDinner = prevMealData?.extraRiceDinner || 0;

    if (mealData.extraRiceLunch > prevExtraRiceLunch) {
      dailyAggregateData.totalExtraRiceLunch += (mealData.extraRiceLunch - prevExtraRiceLunch);
      monthlyAggregateData.totalExtraRiceLunch += (mealData.extraRiceLunch - prevExtraRiceLunch);
    } else {
      dailyAggregateData.totalExtraRiceLunch -= (prevExtraRiceLunch - mealData.extraRiceLunch);
      monthlyAggregateData.totalExtraRiceLunch -= (prevExtraRiceLunch - mealData.extraRiceLunch);
    }

    if (mealData.extraRiceDinner > prevExtraRiceDinner) {
      dailyAggregateData.totalExtraRiceDinner += (mealData.extraRiceDinner - prevExtraRiceDinner);
      monthlyAggregateData.totalExtraRiceDinner += (mealData.extraRiceDinner - prevExtraRiceDinner);
    } else {
      dailyAggregateData.totalExtraRiceDinner -= (prevExtraRiceDinner - mealData.extraRiceDinner);
      monthlyAggregateData.totalExtraRiceDinner -= (prevExtraRiceDinner - mealData.extraRiceDinner);
    }

    setPrevMealData(mealData);

    await setDoc(dailyAggregateRef, dailyAggregateData, { merge: true });
    await setDoc(monthlyAggregateRef, monthlyAggregateData, { merge: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mealData = {
      date,
      lunchAvailable,
      dinnerAvailable,
      extraRiceLunch,
      extraRiceDinner,
      updatedBy: userName,
      updatedAt: new Date()
    };

    try {
      const mealDocRef = doc(firestore, `users/${userId}/meals`, date);
      await setDoc(mealDocRef, mealData);
      await updateAggregates(mealData, userId, date, prevMealData);
      toast.success('Meal data saved successfully!');
    } catch (error) {
      toast.error('Error saving meal data: ' + error.message);
    }
  };

  return (
    <div className="bg-white p-8 mt-4">
      <h2 className="text-2xl font-bold mb-4">Update Meal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="block text-left font-medium mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {date && (
            <div className="flex-1">
              <label className="block text-left font-medium mb-2">Day</label>
              <input
                type="text"
                value={day}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
          )}
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={lunchAvailable}
            onChange={(e) => setLunchAvailable(e.target.checked)}
            className="mr-2"
            disabled={!editable && !isMessmanager}
          />
          <label>Lunch</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={dinnerAvailable}
            onChange={(e) => setDinnerAvailable(e.target.checked)}
            className="mr-2"
            disabled={!editable && !dinnerEditable && !isMessmanager}
          />
          <label>Dinner</label>
        </div>
        <div>
          <label className="block text-left font-medium mb-2">Extra Rice for Lunch</label>
          <input
            type="number"
            value={extraRiceLunch}
            onChange={(e) => setExtraRiceLunch(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={0}
            disabled={!editable && !isMessmanager}
          />
        </div>
        <div>
          <label className="block text-left font-medium mb-2">Extra Rice for Dinner</label>
          <input
            type="number"
            value={extraRiceDinner}
            onChange={(e) => setExtraRiceDinner(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={0}
            disabled={!editable && !dinnerEditable && !isMessmanager}
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition duration-200"
          disabled={!editable && !dinnerEditable && !isMessmanager}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default MealUpdateForm;
