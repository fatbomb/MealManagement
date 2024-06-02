// MonthSelector.js

import React from 'react';

const MonthSelector = ({ selectedMonth, setSelectedMonth }) => {
    return (
        <div className="mb-6 flex justify-center items-center">
            <label htmlFor="monthSelect" className="mr-2 text-lg font-medium">Select Month:</label>
            <input
                id="monthSelect"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};

export default MonthSelector;
