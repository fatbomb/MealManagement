import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const Meals = () => {
    const [tab, setTab] = useState('single');
    const [singleDate, setSingleDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [singleDateData, setSingleDateData] = useState(null);
    const [rangeData, setRangeData] = useState(null);
    const [totalRangeData,setTotalRangeData] = useState(null);
    

    useEffect(() => {
        const fetchSingleDateData = async () => {
            const usersRef = collection(firestore, 'users');
            const usersSnapshot = await getDocs(usersRef);
        
            let totalLunches = 0;
            let totalExtraRiceLunch = 0;
            let totalDinners = 0;
            let totalExtraRiceDinner = 0;
        
            const promises = usersSnapshot.docs.map(async (userDoc) => {
                const userId = userDoc.id;
                const mealsRef = collection(firestore, 'users', userId, 'meals');
                const querySnapshot = await getDocs(mealsRef);

                querySnapshot.forEach((mealDoc) => {
                    const mealDate = mealDoc.id;
                    if (mealDate === singleDate.toISOString().substring(0, 10)) {
                        const mealData = mealDoc.data();
                        totalLunches += mealData.lunchAvailable ? 1 : 0;
                        totalExtraRiceLunch += (mealData.lunchAvailable ? 1 : 0) + (mealData.extraRiceLunch || 0);
                        totalDinners += mealData.dinnerAvailable ? 1 : 0;
                        totalExtraRiceDinner += (mealData.dinnerAvailable ? 1 : 0) + (mealData.extraRiceDinner || 0);
                    }
                });
            });

            await Promise.all(promises);

            setSingleDateData({ totalLunches, totalExtraRiceLunch, totalDinners, totalExtraRiceDinner });
        };
        
        fetchSingleDateData();
        
    }, [singleDate]);

    useEffect(() => {
        const fetchRangeData = async () => {
            const usersRef = collection(firestore, 'users');
            const usersSnapshot = await getDocs(usersRef);
        
            let rangeData = [];
            let totalRangeData = {
                totalLunches: 0,
                totalExtraRiceLunch: 0,
                totalDinners: 0,
                totalExtraRiceDinner: 0
            };
        
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                let totalLunches = 0;
                let totalExtraRiceLunch = 0;
                let totalDinners = 0;
                let totalExtraRiceDinner = 0;
        
                const dateString = d.toISOString().substring(0, 10);
        
                const promises = usersSnapshot.docs.map(async (userDoc) => {
                    const userId = userDoc.id;
                    const mealsRef = collection(firestore, 'users', userId, 'meals');
                    const querySnapshot = await getDocs(mealsRef);
        
                    querySnapshot.forEach((mealDoc) => {
                        const mealDate = mealDoc.id;
                        if (mealDate === dateString) {
                            const mealData = mealDoc.data();
                            totalLunches += mealData.lunchAvailable ? 1 : 0;
                            totalExtraRiceLunch += (mealData.lunchAvailable ? 1 : 0) + (mealData.extraRiceLunch || 0);
                            totalDinners += mealData.dinnerAvailable ? 1 : 0;
                            totalExtraRiceDinner += (mealData.dinnerAvailable ? 1 : 0) + (mealData.extraRiceDinner || 0);
                        }
                    });
                });
        
                await Promise.all(promises);
        
                // Add daily totals to the range data
                rangeData.push({ date: dateString, totalLunches, totalExtraRiceLunch, totalDinners, totalExtraRiceDinner });
        
                // Add daily totals to the totalRangeData
                totalRangeData.totalLunches += totalLunches;
                totalRangeData.totalExtraRiceLunch += totalExtraRiceLunch;
                totalRangeData.totalDinners += totalDinners;
                totalRangeData.totalExtraRiceDinner += totalExtraRiceDinner;
            }
        
            // Set the total values for the entire range
            setTotalRangeData(totalRangeData);
        
            // Set the range data
            setRangeData(rangeData);
        };
        
        fetchRangeData();
        
    }, [startDate, endDate]);

    const singleDateGraphData = {
        labels: ['Single Date'],
        datasets: [
            {
                label: 'Lunches',
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
                hoverBorderColor: 'rgba(255, 99, 132, 1)',
                data: [singleDateData?.totalLunches || 0],
            },
            {
                label: 'Rice (Lunch)',
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
                hoverBorderColor: 'rgba(54, 162, 235, 1)',
                data: [singleDateData?.totalExtraRiceLunch || 0],
            },
            {
                label: 'Dinners',
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(255, 206, 86, 0.8)',
                hoverBorderColor: 'rgba(255, 206, 86, 1)',
                data: [singleDateData?.totalDinners || 0],
            },
            {
                label: 'Rice (Dinner)',
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
                hoverBorderColor: 'rgba(75, 192, 192, 1)',
                data: [singleDateData?.totalExtraRiceDinner || 0],
            },
        ],
    };
    
    const rangeGraphData = {
        labels: rangeData?.map(data => data.date) || [],
        datasets: [
            {
                label: 'Lunches',
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
                hoverBorderColor: 'rgba(255, 99, 132, 1)',
                data: rangeData?.map(data => data.totalLunches) || [],
            },
            {
                label: 'Rice (Lunch)',
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
                hoverBorderColor: 'rgba(54, 162, 235, 1)',
                data: rangeData?.map(data => data.totalExtraRiceLunch) || [],
            },
            {
                label: 'Dinners',
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(255, 206, 86, 0.8)',
                hoverBorderColor: 'rgba(255, 206, 86, 1)',
                data: rangeData?.map(data => data.totalDinners) || [],
            },
            {
                label: 'Rice (Dinner)',
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
                hoverBorderColor: 'rgba(75, 192, 192, 1)',
                data: rangeData?.map(data => data.totalExtraRiceDinner) || [],
            },
        ],
    };
    

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-200 to-blue-200 p-8">
            <div>
                <ul className="flex border-b mb-4">
                    <li className={`mr-2 ${tab === 'single' ? 'border-b-2 border-blue-500' : ''}`}>
                        <button className="p-2" onClick={() => setTab('single')}>Single Date</button>
                    </li>
                    <li className={`mr-2 ${tab === 'range' ? 'border-b-2 border-blue-500' : ''}`}>
                        <button className="p-2" onClick={() => setTab('range')}>Range of Dates</button>
                    </li>
                </ul>
                {tab === 'single' && (
                    <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className='flex gap-2'>
                    <h2 className=" font-semibold mb-2">Select a Date</h2>
                    <DatePicker 
                        selected={singleDate} 
                        onChange={date => setSingleDate(date)} 
                        className="mb-4 w-full px-2 border border-gray-300 rounded"
                    />
                    </div>
                    
                    <div className=" p-4 bg-gray-100 rounded-lg">
                        <p className="mb-2 text-gray-700">Total Lunches: <span className="font-bold">{singleDateData?.totalLunches || 0}</span></p>
                        <p className="mb-2 text-gray-700">Total Rices for Lunch: <span className="font-bold">{singleDateData?.totalExtraRiceLunch || 0}</span></p>
                        <p className="mb-2 text-gray-700">Total Dinners: <span className="font-bold">{singleDateData?.totalDinners || 0}</span></p>
                        <p className="mb-2 text-gray-700">Total Rices for Dinner: <span className="font-bold">{singleDateData?.totalExtraRiceDinner || 0}</span></p>
                    </div>
                    <div className="mt-3">
                        <Bar data={singleDateGraphData} />
                    </div>
                </div>
                
                )}
                {tab === 'range' && (
                    <div>
                    <div className="flex gap-5 mb-4">
                        <div className='flex gap-1'> 
                            <h2 className='font-semibold'>Starting Date </h2>
                            <DatePicker selected={startDate} onChange={date => setStartDate(date)} className="mb-2  w-full px-2 border border-gray-300 rounded" />
                        </div>
                        <div className='flex gap-1'>
                            <h2 className='font-semibold'>Ending Date </h2>
                            <DatePicker selected={endDate} onChange={date => setEndDate(date)} className="mb-2 w-full px-2 border border-gray-300 rounded"/>
                        </div>
                    </div>
                    
                    {/* Display total values */}
                    <div className="flex flex-col mb-4">
                        <div className=" p-4 bg-gray-100 rounded-lg">
                            <p>Total Number of Lunches: <span className="font-bold">{totalRangeData.totalLunches}</span></p>
                            <p>Total Number of Rices for Lunch: <span className="font-bold">{totalRangeData.totalExtraRiceLunch}</span></p>
                            <p>Total Number of Dinners: <span className="font-bold">{totalRangeData.totalDinners}</span></p>
                            <p>Total Number of Rices for Dinner: <span className="font-bold">{totalRangeData.totalExtraRiceDinner}</span></p>
                        </div>
                        <div>
                            <Bar data={rangeGraphData} />
                        </div>
                    </div>
                    
                    {/* Display individual data */}
                    <div className="mt-4">
                        {rangeData?.map((data, index) => (
                            <div key={index} className="mb-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p className="text-lg font-semibold mb-2">Date: <span className="font-normal">{data.date}</span></p>
                                <p className="mb-1 text-gray-700">Total Number of Lunches: <span className="font-bold">{data.totalLunches}</span></p>
                                <p className="mb-1 text-gray-700">Total Number of Extra Rices for Lunch: <span className="font-bold">{data.totalExtraRiceLunch}</span></p>
                                <p className="mb-1 text-gray-700">Total Number of Dinners: <span className="font-bold">{data.totalDinners}</span></p>
                                <p className="mb-1 text-gray-700">Total Number of Extra Rices for Dinner: <span className="font-bold">{data.totalExtraRiceDinner}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
                
                )}
            </div>
        </div>
    );
};

export default Meals;

