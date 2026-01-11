import Dexie from 'dexie';

export const db = new Dexie('SmartMealDB');

db.version(1).stores({
  foods: '++id, name, mealType', // Master List
  plans: '++id, date, mealType, foodId, [date+mealType]' // Daily Schedule, added compound index for faster querying
});

db.on('populate', () => {
  db.foods.bulkAdd([
    { name: 'Oats', mealType: 'Breakfast' },
    { name: 'Eggs', mealType: 'Breakfast' },
    { name: 'Toast', mealType: 'Breakfast' },
    { name: 'Rice', mealType: 'Lunch' },
    { name: 'Chicken Breast', mealType: 'Lunch' },
    { name: 'Broccoli', mealType: 'Lunch' },
    { name: 'Pasta', mealType: 'Dinner' },
    { name: 'Salmon', mealType: 'Dinner' },
    { name: 'Salad', mealType: 'Dinner' },
    { name: 'Apple', mealType: 'Snack' },
    { name: 'Almonds', mealType: 'Snack' },
    { name: 'Yogurt', mealType: 'Snack' },
    { name: 'Protein Shake', mealType: 'Pre-Workout' },
    { name: 'Banana', mealType: 'Pre-Workout' }
  ]);
});
