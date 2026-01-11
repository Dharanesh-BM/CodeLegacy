import { getAccessToken, requestCalendarPermission } from './googleAuth';

// Helper to define meal times
const MEAL_TIMES = {
  "Pre-Breakfast": "06:30:00",
  "Breakfast": "08:00:00",
  "Mid-morning Snacks": "11:00:00",
  "Lunch": "13:00:00",
  "Dinner": "20:00:00",
  "Snack": "16:00:00"
};

export const addMealToCalendar = async (mealPlan) => {
  const token = getAccessToken();
  
  if (!token) {
    // Optionally trigger the permission request automatically or return false
    console.warn("No access token. User needs to enable sync.");
    // requestCalendarPermission(); // This effectively interrupts flow, better to let UI handle "Enable" action
    return false;
  }

  // 1. Construct the Start and End time
  // mealPlan.date is "2023-10-25"
  const time = MEAL_TIMES[mealPlan.mealType] || "12:00:00";
  const startDateTime = new Date(`${mealPlan.date}T${time}`);
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 minutes later

  // 2. Build the Event Object
  const event = {
    summary: `🍽️ ${mealPlan.mealType}: ${mealPlan.name || mealPlan.foodName}`,
    description: "Planned via SmartMeal AI",
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // User's local time
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };

  // 3. Send Request to Google API
  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Meal added to calendar!", data.id);
      return data.id; // Return the Event ID
    } else {
      console.error("Failed to add to calendar", await response.json());
      // Handle 401 (Auth Error) - Token might be expired
      if (response.status === 401) {
          // Token expired, maybe invalidate it logic here
          console.log("Token expired or invalid");
      }
      return null;
    }
  } catch (error) {
    console.error("Network error", error);
    return null;
  }
};

export const deleteMealFromCalendar = async (eventId) => {
  const token = getAccessToken();
  if (!token || !eventId) return false;

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.ok || response.status === 404) { // 404 means already deleted, count as success
      console.log("Meal deleted from calendar!");
      return true;
    } else {
      console.error("Failed to delete from calendar", await response.json());
      return false;
    }
  } catch (error) {
    console.error("Network error during delete", error);
    return false;
  }
};
