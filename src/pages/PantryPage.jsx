import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Trash2, Plus, Soup, UtensilsCrossed } from 'lucide-react';
import MealSection from '../components/MealSection';

export default function PantryPage() {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const { currentUser } = useAuth();

  // Firestore Hook
  // Assuming structure users/{uid}/foods
  const foodsRef = currentUser ? collection(db, 'users', currentUser.uid, 'foods') : null;
  const [foodsSnapshot, loading, error] = useCollection(foodsRef);

  const foods = foodsSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const addFood = async (e) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    try {
        await addDoc(foodsRef, {
            name: name.trim(),
            mealType,
            createdAt: new Date()
        });
        setName('');
    } catch (err) {
        console.error("Error adding food:", err);
    }
  };

  const deleteFood = async (id) => {
    if (!currentUser) return;
    try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'foods', id));
    } catch (err) {
        console.error("Error deleting food:", err);
    }
  };

  const mealTypes = ['Pre-Breakfast', 'Breakfast', 'Mid-morning Snacks', 'Lunch', 'Dinner'];
  
  // Group foods
  const groupedFoods = mealTypes.reduce((acc, type) => {
    acc[type] = foods?.filter(f => f.mealType === type) || [];
    return acc;
  }, {});

  // Handle types not in list (fallback)
  const otherFoods = foods?.filter(f => !mealTypes.includes(f.mealType)) || [];
  if (otherFoods.length > 0) groupedFoods['Other'] = otherFoods;

  if (!currentUser) return <div>Please log in</div>;
  if (loading) return <div className="p-4 text-center text-gray-500">Loading your pantry...</div>;

  return (
    <div className="">
      {/* Header */}
      <div className="bg-white p-4 py-5 shadow-sm sticky top-0 z-10 flex items-center justify-center gap-2">
        <Soup className="text-blue-600" size={24} />
        <h1 className="text-xl font-bold text-gray-800">Food List</h1>
      </div>

      <div className="p-4">
        {/* Add Form */}
        <form onSubmit={addFood} className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter food name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
            />
            <div className="flex gap-2">
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block flex-1 p-2.5"
              >
                {mealTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button
                type="submit"
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-2 "
                disabled={!name.trim()}
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </div>
        </form>

        {/* List */}
        <div className="space-y-4">
          {Object.entries(groupedFoods).map(([type, items]) => (
             items.length > 0 && (
              <MealSection key={type} title={type} count={items.length}>
                {items.map(food => (
                  <div key={food.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <UtensilsCrossed size={16} className="text-gray-400" />
                      <span className="text-gray-700 font-medium">{food.name}</span>
                    </div>
                    <button
                      onClick={() => deleteFood(food.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </MealSection>
             )
          ))}
          
          {foods?.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              <p>Your pantry is empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
