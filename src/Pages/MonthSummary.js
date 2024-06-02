import React, { useState, useEffect, useRef } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import MealUpdateForm from '../Components/MealUpdateForm';
import MonthSelector from '../Components/MonthSelector';

const MealsPage = () => {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [mealData, setMealData] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedCell, setSelectedCell] = useState({ userId: null, date: null });
    // const [mealsEnabled, setMealsEnabled] = useState(true); // Toggle switch for meals
    const formRef = useRef(null);
    const [cellMinWidth, setCellMinWidth] = useState('150px'); // Minimum width for table cells
    const [maxHeight, setMaxHeight] = useState('');

    useEffect(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
        const defaultMonth = `${currentYear}-${currentMonth}`;
        setSelectedMonth(defaultMonth);
    }, []);
    useEffect(() => {
        // Calculate the screen height minus 200px
        const screenHeight = window.innerHeight;
        const calculatedMaxHeight = screenHeight - 220;

        // Set the state with the calculated max height
        setMaxHeight(`${calculatedMaxHeight}px`);

        // Update the max height when the window is resized
        const handleResize = () => {
            const updatedScreenHeight = window.innerHeight;
            const updatedMaxHeight = updatedScreenHeight - 220;
            setMaxHeight(`${updatedMaxHeight}px`);
        };

        window.addEventListener('resize', handleResize);

        // Clean up event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
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
            <tr key={day} className={day % 2 === 0 ? 'bg-gradient-to-r from-purple-100 to-gray-100' : 'bg-gradient-to-r from-blue-100 to-purple-100'}>
                <td className="border w-1/12 p-2 text-center font-semibold" style={{ minWidth: cellMinWidth }}>{(day + 1).toString().padStart(2, '0')}</td>
                {Object.keys(mealData).map(userId => (
                    <td key={userId} className="border w-1/12 p-2 cursor-pointer text-center" onClick={() => handleCellClick(userId, `${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`)}>
                        {mealData[userId]?.mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`] ? (
                            <div className="flex flex-wrap">
                                <div className="rounded-lg flex flex-auto justify-center items-center gap-2 border border-gray-200 p-2 w-full mb-1">
                                    <p className="font-semibold">Lunch:</p>
                                    <div className={`bg-gradient-to-r ${mealData[userId]?.mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].lunchAvailable ? 'from-green-200 to-blue-200' : 'from-red-300 to-yellow-100'} px-2 py-1 rounded-lg flex justify-center items-center`}>
                                        {mealData[userId]?.mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].lunchAvailable ? 'Yes' : 'No'}
                                    </div>
                                </div>
                                <div className="rounded-lg flex flex-auto justify-center items-center gap-2 border border-gray-200 p-2 w-full mb-1">
                                    <p className="font-semibold">Dinner:</p>
                                    <div className={`bg-gradient-to-r ${mealData[userId]?.mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].dinnerAvailable ? 'from-green-200 to-blue-200' : 'from-red-300 to-yellow-100'} px-2 py-1 rounded-lg flex justify-center items-center`}>
                                        {mealData[userId]?.mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].dinnerAvailable ? 'Yes' : 'No'}
                                    </div>
                                </div>
                                <div className="rounded-lg flex flex-auto justify-center items-center gap-2 border border-gray-200 p-2 w-full mb-1">
                                    <p className="font-semibold">Rice Lunch:</p>
                                    <div className={`bg-gradient-to-r ${mealData[userId]?.mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].extraRiceLunch ? 'from-green-200 to-blue-200' : 'from-red-300 to-yellow-100'} px-3.5 py-1 rounded-lg flex justify-center items-center`}>
                                        {mealData[userId]?.mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].extraRiceLunch || 0}
                                    </div>
                                </div>
                                <div className="rounded-lg flex flex-auto justify-center items-center gap-2 border border-gray-200 p-2 w-full mb-1">
                                    <p className="font-semibold">Rice Dinner:</p>
                                    <div className={`bg-gradient-to-r ${mealData[userId]?.mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].extraRiceDinner ? 'from-green-200 to-blue-200' : 'from-red-300 to-yellow-100'} px-3.5 py-1 rounded-lg flex justify-center items-center`}>
                                        {mealData[userId]?.mealData[`${selectedMonth}-${(day + 1).toString().padStart(2, '0')}`].extraRiceDinner || 0}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap">
                                <div className="rounded-lg border flex flex-auto gap-2 justify-center items-center border-gray-200 p-2 w-full mb-1">
                                    <p className="font-semibold">Lunch:</p>
                                    <div className="bg-gradient-to-r  from-red-300 to-yellow-100 px-2 py-1 rounded-lg flex justify-center items-center">
                                        No
                                    </div>
                                </div>
                                <div className="rounded-lg flex flex-auto justify-center items-center gap-2 border border-gray-200 p-2 w-full mb-1">
                                    <p className="font-semibold">Dinner:</p>
                                    <div className="bg-gradient-to-r from-red-300 to-yellow-100 px-2 py-1 rounded-lg flex justify-center items-center">
                                        No
                                    </div>
                                </div>
                                <div className="rounded-lg flex flex-auto gap-2 justify-center items-center border border-gray-200 p-2 w-full mb-1">
                                    <p className="font-semibold">Rice Lunch:</p>
                                    <div className="bg-gradient-to-r  from-red-300 to-yellow-100 px-3.5 py-1 rounded-lg flex justify-center items-center">
                                        0
                                    </div>
                                </div>
                                <div className="rounded-lg flex flex-auto justify-center items-center gap-2 border border-gray-200 p-2 w-full mb-1">
                                    <p className="font-semibold">Rice Dinner:</p>
                                    <div className="bg-gradient-to-r  from-red-300 to-yellow-100 px-3.5 py-1 rounded-lg flex justify-center items-center">
                                        0
                                    </div>
                                </div>
                            </div>
                        )}
                    </td>
                ))}
            </tr>
        ));
    };
    return (
        <div className="mx-auto p-4 bg-gradient-to-b from-blue-200 to-purple-300">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Meal Data for {selectedMonth}</h1>
            <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
            <div className="overflow-x-auto "style={{ maxHeight: maxHeight }}>
                <table className="table-auto border-collapse bg-white shadow-lg">
                    <thead className="sticky top-0 z-10"style={{ backgroundImage: 'linear-gradient( 111.4deg, rgba(7,7,9,1) 6.5%, rgba(27,24,113,1) 93.2%)', color: 'white' }}>
                        <tr>
                            <th className="w-36 p-2 text-center text-lg font-semibold" style={{ minWidth: '150px' }}>Date</th>
                            {Object.keys(mealData).map(userId => (
                                <th key={userId} className="w-36 md:w-1/12 p-2 text-center text-lg font-semibold min-w-max" style={{ minWidth: '130px' }}>
                                    {mealData[userId].name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="max-h-96 overflow-y-auto">
                        {renderTableRows()}
                    </tbody>
                </table>
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
}

export default MealsPage;
