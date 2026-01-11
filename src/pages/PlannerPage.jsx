import { useState } from 'react';
import Calendar from '../components/Calendar';
import DailyPlanView from '../components/DailyPlanView';

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState(null);

  // If a date is selected, show the Day View for that date
  if (selectedDate) {
      return (
          <div className="flex flex-col">
              {/* Back button or Breadcrumb could go here if needed, but the DailyPlanView has nav */}
              <div className="bg-white px-4 pt-2">
                 <button 
                   onClick={() => setSelectedDate(null)}
                   className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                 > 
                   ← Back to Month
                 </button>
              </div>
              <DailyPlanView 
                  date={selectedDate} 
                  showDateNav={true} 
                  onDateChange={setSelectedDate}
              />
          </div>
      );
  }

  // Otherwise show the Calendar
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 px-2 mt-2">Plan your meals</h1>
      <Calendar 
        selectedDate={new Date()} 
        onDateSelect={(date) => setSelectedDate(date)} 
      />
      
      <div className="mt-8 px-2 text-center text-gray-400">
        <p>Select a date to view or edit the plan.</p>
      </div>
    </div>
  );
}
