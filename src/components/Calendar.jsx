import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';

export default function Calendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const isSelected = isSameDay(day, new Date(selectedDate));
      const isCurrentMonth = isSameMonth(day, monthStart);

      days.push(
        <div
          className={`col-span-1 flex justify-center py-2 cursor-pointer`}
          key={day}
          onClick={() => onDateSelect(cloneDay)}
        >
          <div className={`
             w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
             ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
             ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100'}
          `}>
            {formattedDate}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1" key={day}>
        {days}
      </div>
    );
    days = [];
  }

  // Weekday Headers
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <span className="text-xl font-bold text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <div className="flex gap-4">
           <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full">
             <ChevronLeft size={20} className="text-gray-600" />
           </button>
           <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full">
             <ChevronRight size={20} className="text-gray-600" />
           </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div className="text-center text-xs font-semibold text-gray-500 py-1" key={day}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {rows}
      </div>
    </div>
  );
}
