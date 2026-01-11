import { useState, useEffect } from 'react';
import Calendar from '../components/Calendar';
import DailyPlanView from '../components/DailyPlanView';
import { requestCalendarPermission, isCalendarConnected } from '../services/googleAuth';
import { Calendar as CalendarIcon, AlertTriangle, X } from 'lucide-react';

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSyncAlert, setShowSyncAlert] = useState(false);

  useEffect(() => {
    // Check if we need to sync
    if (!isCalendarConnected()) {
        setShowSyncAlert(true);
    } else {
        setShowSyncAlert(false);
    }
    
    // Listen for successful token reception to hide alert
    const handleTokenReceived = () => setShowSyncAlert(false);
    window.addEventListener('google-token-received', handleTokenReceived);
    return () => window.removeEventListener('google-token-received', handleTokenReceived);
  }, []);

  const handleEnableCalendar = () => {
    requestCalendarPermission();
  };

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
      {showSyncAlert && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-start gap-3 relative animate-fade-in">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                  <h4 className="text-sm font-semibold text-orange-800">Calendar Sync Paused</h4>
                  <p className="text-xs text-orange-700 mt-1">
                      Your Google access token has expired. Connect again to sync meals.
                  </p>
                  <button 
                      onClick={handleEnableCalendar}
                      className="mt-2 text-xs bg-orange-100 text-orange-700 font-medium px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                  >
                      Connect Now
                  </button>
              </div>
              <button 
                  onClick={() => setShowSyncAlert(false)}
                  className="text-gray-400 hover:text-gray-600"
              >
                  <X size={16} />
              </button>
          </div>
      )}

      <div className="flex justify-between items-center mb-6 px-2 mt-2">
         <h1 className="text-2xl font-bold text-gray-800">Plan your meals</h1>
         <button 
          onClick={handleEnableCalendar}
          className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
              showSyncAlert ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
          title="Enable Calendar Sync"
        >
          <CalendarIcon size={14} />
          <span>{showSyncAlert ? 'Reconnect' : 'Sync'}</span>
        </button>
      </div>
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
