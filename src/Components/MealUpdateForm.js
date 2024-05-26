import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

const MealUpdateForm = ({ userId }) => {
    const [date, setDate] = useState('');
    const [lunchAvailable, setLunchAvailable] = useState(false);
    const [dinnerAvailable, setDinnerAvailable] = useState(false);
    const [extraRiceLunch, setExtraRiceLunch] = useState(0);
    const [extraRiceDinner, setExtraRiceDinner] = useState(0);
    const [editable, setEditable] = useState(true);
    const [dinnerEditable, setDinnerEditable] = useState(true);
  
    useEffect(() => {
      // Fetch data for the selected date from Firestore
      const fetchMealData = async () => {
        if (!date) return; // Don't fetch if date is not set
        const mealDocRef = doc(firestore, `users/${userId}/meals`, date);
        const mealDocSnapshot = await getDoc(mealDocRef);
        if (mealDocSnapshot.exists()) {
          const mealData = mealDocSnapshot.data();
          setLunchAvailable(mealData.lunchAvailable || false);
          setDinnerAvailable(mealData.dinnerAvailable || false);
          setExtraRiceLunch(mealData.extraRiceLunch || 0);
          setExtraRiceDinner(mealData.extraRiceDinner || 0);
        } else {
          // If no data exists for the selected date, reset form fields
          setLunchAvailable(false);
          setDinnerAvailable(false);
          setExtraRiceLunch(0);
          setExtraRiceDinner(0);
        }
      };
  
      fetchMealData();
    }, [date]);

    useEffect(() => {
        // Check conditions for editability
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        const selectedDate = new Date(date);
    
        if (selectedDate.getDate() < currentDate.getDate() || (currentDate.getDate() === selectedDate.getDate() && currentHour >= 19)) {
          setEditable(false);
          setDinnerEditable(false);
        } else if (
          selectedDate.getDate() === currentDate.getDate() &&
          currentHour >= 9 && currentHour < 19
        ) {
          setDinnerEditable(true);
          setEditable(false);
        } else {
          setEditable(true);
          setDinnerEditable(true);
        }
        console.log(dinnerEditable,editable);
      }, [date]);
  
    // Other useEffect remains the same
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Prepare data to be saved in Firestore
      const mealData = {
        date,
        lunchAvailable,
        dinnerAvailable,
        extraRiceLunch,
        extraRiceDinner
      };
  
      try {
        const mealDocRef = doc(firestore, `users/${userId}/meals`, date);
        await setDoc(mealDocRef, mealData);
        alert('Meal data saved successfully!');
      } catch (error) {
        alert('Error saving meal data: ' + error.message);
      }
    };
  
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg mt-4">
        {/* Form content remains the same */}
        <h2 className="text-2xl font-bold mb-4">Update Meal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-left font-medium mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={lunchAvailable}
            onChange={(e) => setLunchAvailable(e.target.checked)}
            className="mr-2"
            disabled={!editable}
          />
          <label>Lunch </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={dinnerAvailable}
            onChange={(e) => setDinnerAvailable(e.target.checked)}
            className="mr-2"
            disabled={!editable && !dinnerEditable}
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
            disabled={!editable}
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
            disabled={!editable && !dinnerEditable}
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition duration-200"
          disabled={!editable && !dinnerEditable}
        >
          Submit
        </button>
      </form>
      </div>
    );
  };
  
  export default MealUpdateForm;