// MonthManagers.jsx
import React from 'react';

const MonthManagers = ({ handleSubmit, handleMonthManagersUpdate, messManagers, users }) => {
  return (
    <form onSubmit={(e) => handleSubmit(e, 'messManager')}>
      <h2 className="text-2xl mb-4">Set Mess Managers for 12 Months</h2>
      {messManagers.map((monthManagers, monthIndex) => (
        <div key={monthIndex} className="mb-4">
          <label className="block text-left font-medium mb-2">
            Month {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][monthIndex]}
          </label>
          <div className="flex flex-wrap">
            {users.map(user => (
              <div key={user.id} className="w-1/2 mb-2">
                <input
                  type="checkbox"
                  id={`${user.id}-${monthIndex}`}
                  value={user.id}
                  checked={monthManagers.includes(user.id)}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const managerId = e.target.value;
                    const updatedManagers = isChecked
                      ? [...monthManagers, managerId]
                      : monthManagers.filter(id => id !== managerId);
                    handleMonthManagersUpdate(monthIndex, updatedManagers);
                  }}
                  className="mr-2"
                />
                <label htmlFor={`${user.id}-${monthIndex}`}>{user.name}</label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="submit" className="w-full p-2 bg-blue-500 text-white font-bold rounded mt-4">
        Save Mess Managers
      </button>
    </form>
  );
};

export default MonthManagers;
