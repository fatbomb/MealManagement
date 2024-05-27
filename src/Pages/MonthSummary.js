import React, { useState, useEffect, useRef } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import MealUpdateForm from '../Components/MealUpdateForm';

const MealsPage = () => {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [mealData, setMealData] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedCell, setSelectedCell] = useState({ userId: null, date: null });
    const formRef = useRef(null);

    useEffect(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
        const defaultMonth = `${currentYear}-${currentMonth}`;
        setSelectedMonth(defaultMonth);
    }, []);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    setCurrentUser(userDocSnapshot.data());
                }
            } else {
                setCurrentUser(null);
            }
        };

        fetchCurrentUser();
    }, []);

    const fetchAllMealData = async () => {
        if (!selectedMonth) return;

        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        const mealDataMap = {};
        await Promise.all(usersSnapshot.docs.map(async (userDoc) => {
            const userId = userDoc.id;
            const mealsCollection = collection(firestore, `users/${userId}/meals`);
            const startDate = `${selectedMonth}-01`;
            const endDate = `${selectedMonth}-31`;

            const mealQuery = query(mealsCollection, where('date', '>=', startDate), where('date', '<=', endDate));
            const mealQuerySnapshot = await getDocs(mealQuery);

            const userData = userDoc.data();
            const userName = userData.name || 'Unknown';

            const userMealData = {};
            mealQuerySnapshot.forEach((mealDoc) => {
                const mealDate = mealDoc.data().date;
                userMealData[mealDate] = mealDoc.data();
            });

            mealDataMap[userId] = {
                name: userName,
                mealData: userMealData
            };
        }));

        setMealData(mealDataMap);
    };

    useEffect(() => {
        fetchAllMealData();
    }, [selectedMonth]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setSelectedCell({ userId: null, date: null });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!selectedCell.userId && !selectedCell.date) {
            fetchAllMealData();
        }
    }, [selectedCell]);

    const handleCellClick = (userId, date) => {
        if (currentUser && currentUser.isMessManager) {
            const [year, month, day] = date.split('-').map(Number);
            const adjustedDate = new Date(year, month - 1, day + 1);
            setSelectedCell({ userId, date: adjustedDate });
        }
    };

    const daysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };

    const renderTableRows = () => {
        if (!selectedMonth) return null;

        const [year, month] = selectedMonth.split('-').map(Number);
        const numberOfDays = daysInMonth(year, month);

        return [...Array(numberOfDays).keys()].map(day => (
            <tr key={day} className="hover:bg-gray-50">
                <td className="border w-1/12 p-2 text-center font-semibold">{(day + 1).toString().padStart(2, '0')}</td>
                {Object.keys(mealData).map(userId => (
                    <td key={userId} className="border w-1/12 p-2 cursor-pointer text-center" onClick={() => handleCellClick(userId, `${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`)}>
                        {mealData[userId].mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`] ? (
                            <div className="space-y-1">
                                <p className="text-green-500 font-semibold">Lunch: {mealData[userId].mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].lunchAvailable ? 'Yes' : 'No'}</p>
                                <p className="text-blue-500 font-semibold">Dinner: {mealData[userId].mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].dinnerAvailable ? 'Yes' : 'No'}</p>
                                <p className="text-gray-600 font-semibold">Extra Rice Lunch: {mealData[userId].mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].extraRiceLunch || 0}</p>
                                <p className="text-gray-600 font-semibold">Extra Rice Dinner: {mealData[userId].mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].extraRiceDinner || 0}</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-red-500 font-semibold">Lunch: No</p>
                                <p className="text-red-500 font-semibold">Dinner: No</p>
                                <p className="text-gray-600 font-semibold">Extra Rice Lunch: 0</p>
                                <p className="text-gray-600 font-semibold">Extra Rice Dinner: 0</p>
                            </div>
                        )}
                    </td>
                ))}
            </tr>
        ));
    };

    return (
        <div className="container mx-auto p-4 bg-gradient-to-b from-blue-200 to-purple-300">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Meal Data for {selectedMonth}</h1>
            <div className="mb-6 flex justify-center">
                <label className="mr-2 text-lg font-medium">Select Month:</label>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="table-auto border-collapse w-full bg-white shadow-lg">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="w-1/12 p-2 text-center text-lg font-semibold">Date</th>
                            {Object.keys(mealData).map(userId => (
                                <th key={userId} className="w-1/12 p-2 text-center text-lg font-semibold">{mealData[userId].name}</th>
                            ))}
                        </tr>
                    </thead>
                </table>
                <div className="overflow-y-auto max-h-96"> {/* Adjust max-h-96 to your desired maximum height */}
                    <table className="table-auto border-collapse w-full bg-white shadow-lg">
                        <tbody>
                            {renderTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedCell.userId && currentUser && currentUser.isMessManager && selectedCell.date && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div ref={formRef} className="bg-white p-6 rounded-lg shadow-lg">
                        <MealUpdateForm
                            userId={selectedCell.userId}
                            givenDate={selectedCell.date}
                            isMessmanager={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealsPage;
