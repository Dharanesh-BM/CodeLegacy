import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Trash2, Plus, Soup, UtensilsCrossed, Check, X, Pencil } from 'lucide-react';
import MealSection from '../components/MealSection';

export default function PantryPage() {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMealType, setEditMealType] = useState('');
  
  // Ingredient State
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [editIngredients, setEditIngredients] = useState([]); // For edit mode
  const [editCurrentIngredient, setEditCurrentIngredient] = useState(''); 

  const { currentUser } = useAuth();

  // Firestore Hook
  const foodsRef = currentUser ? collection(db, 'users', currentUser.uid, 'foods') : null;
  const [foodsSnapshot, loading] = useCollection(foodsRef);

  const foods = foodsSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Helper Functions for Ingredients
  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleEditAddIngredient = (e) => {
    // Prevent form submission if triggered by button inside a form, though these inputs are creating their own context
    if(e) e.preventDefault();
    if (editCurrentIngredient.trim()) {
      setEditIngredients([...editIngredients, editCurrentIngredient.trim()]);
      setEditCurrentIngredient('');
    }
  };

  const removeEditIngredient = (index) => {
    setEditIngredients(editIngredients.filter((_, i) => i !== index));
  };

  const addFood = async (e) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    try {
        await addDoc(foodsRef, {
            name: name.trim(),
            mealType,
            ingredients: ingredients,
            createdAt: new Date()
        });
        setName('');
        setIngredients([]);
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
    setEditIngredients(food.ingredients || []);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditMealType('');
    setEditIngredients([]);
    setEditCurrentIngredient('');
  };

  const saveEdit = async () => {
     if (!currentUser || !editingId || !editName.trim()) return;
     try {
         await updateDoc(doc(db, 'users', currentUser.uid, 'foods', editingId), {
             name: editName.trim(),
             mealType: editMealType,
             ingredients: editIngredients
         });
         setEditingId(null);
         setEditIngredients([]);
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
            
            {/* Ingredient Input Section */}
            <div className="flex gap-2">
                 <input
                    type="text"
                    placeholder="Add ingredient (e.g. Rice, Chicken)"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') {
                            e.preventDefault();
                            handleAddIngredient(e);
                        }
                    }}
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block flex-1 p-2.5"
                 />
                <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2"
                >
                    <Plus size={18} />
                </button>
            </div>
            
            {/* Added Ingredients List */}
            {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {ingredients.map((ing, idx) => (
                        <span key={idx} className="bg-green-50 text-green-700 border border-green-200 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                            {ing}
                            <button type="button" onClick={() => removeIngredient(idx)} className="text-green-800 hover:text-red-500">
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-gray-100 mt-1">
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
                      <div className="flex flex-col gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-200 shadow-inner">
                        <div className="flex items-center gap-2">
                             <input 
                              type="text" 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="min-w-0 flex-1 bg-white border border-blue-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                              autoFocus
                            />
                            <div className="flex gap-1 shrink-0">
                                <button onClick={saveEdit} className="bg-green-100 text-green-600 p-1.5 rounded hover:bg-green-200 transition-colors border border-green-200">
                                <Check size={16} />
                                </button>
                                <button onClick={cancelEdit} className="bg-white text-gray-400 p-1.5 rounded hover:bg-gray-100 transition-colors border border-gray-200">
                                <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Edit Ingredients */}
                        <div className="flex gap-2">
                             <input 
                                type="text" 
                                placeholder="Add ingredient..."
                                value={editCurrentIngredient}
                                onChange={(e) => setEditCurrentIngredient(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        e.preventDefault();
                                        handleEditAddIngredient(e);
                                    }
                                }}
                                className="min-w-0 flex-1 bg-white border border-blue-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                             />
                             <button onClick={handleEditAddIngredient} type="button" className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-1.5 rounded transition-colors border border-blue-200">
                                 <Plus size={16}/>
                             </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                            {editIngredients.map((ing, i) => (
                                <span key={i} className="bg-white border border-blue-200 text-blue-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                    {ing}
                                    <button onClick={() => removeEditIngredient(i)} className="text-blue-300 hover:text-red-400"><X size={10}/></button>
                                </span>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-1">
                        <div 
                          className="flex flex-col gap-0.5 flex-1 cursor-pointer"
                          onClick={() => startEdit(food)}
                        >
                          <div className="flex items-center gap-2">
                              <UtensilsCrossed size={14} className="text-gray-400" />
                              <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">{food.name}</span>
                              <Pencil size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {food.ingredients && food.ingredients.length > 0 && (
                            <div className="flex flex-wrap gap-1 ml-6">
                                {food.ingredients.map((ing, idx) => (
                                    <span key={idx} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 rounded-sm">
                                        {ing}
                                    </span>
                                ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFood(food.id);
                          }}
                          className="text-gray-300 hover:text-red-500 p-1.5 rounded transition-colors"
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
            <div className="text-center text-gray-400 mt-10 flex flex-col items-center">
              <Soup size={48} className="mb-2 opacity-20"/>
              <p>Your pantry is empty.</p>
              <p className="text-sm">Add some meals to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}