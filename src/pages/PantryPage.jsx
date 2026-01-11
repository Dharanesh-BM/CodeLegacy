import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, updateDoc, doc, query } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Trash2, Plus, Soup, UtensilsCrossed, Check, X, Pencil } from 'lucide-react';
import MealSection from '../components/MealSection';

export default function PantryPage() {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMealType, setEditMealType] = useState('');
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

  const startEdit = (food) => {
    setEditingId(food.id);
    setEditName(food.name);
    setEditMealType(food.mealType);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditMealType('');
  };

  const saveEdit = async () => {
     if (!currentUser || !editingId || !editName.trim()) return;
     try {
         await updateDoc(doc(db, 'users', currentUser.uid, 'foods', editingId), {
             name: editName.trim(),
             mealType: editMealType
         });
         setEditingId(null);
     } catch(err) {
         console.error("Error updating food:", err);
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
                  <div key={food.id} className="group">
                    {editingId === food.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-gray-50 border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="text-green-500 hover:text-green-700 p-1">
                          <Check size={18} />
                        </button>
                        <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-1">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => startEdit(food)}
                        >
                          <UtensilsCrossed size={16} className="text-gray-400" />
                          <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">{food.name}</span>
                          <Pencil size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFood(food.id);
                          }}
                          className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
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
