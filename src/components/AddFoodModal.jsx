import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddFoodModal({ isOpen, onClose, initialData }) {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || '');
      // Keep mealType empty as per requirements, forcing user to select
      setIngredients(initialData.ingredients || []);
    } else if (!isOpen) {
        // Reset when closed
        setName('');
        setMealType('');
        setIngredients([]);
        setCurrentIngredient('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !mealType || !currentUser) return;
    
    setLoading(true);
    try {
        const foodsRef = collection(db, 'users', currentUser.uid, 'foods');
        await addDoc(foodsRef, {
            name: name.trim(),
            mealType,
            ingredients: ingredients,
            createdAt: new Date()
        });
        onClose();
    } catch (err) {
        console.error("Error adding food:", err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
       <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-bold text-gray-800">Add to Pantry</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
               <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Paneer Butter Masala"
                  required
               />
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Meal Time</label>
               <select 
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required
               >
                 <option value="">Select Meal Time</option>
                 <option value="Pre-Breakfast">Pre-Breakfast</option>
                 <option value="Breakfast">Breakfast</option>
                 <option value="Mid-morning Snacks">Mid-morning Snacks</option>
                 <option value="Lunch">Lunch</option>
                 <option value="Dinner">Dinner</option>
               </select>
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text"
                        value={currentIngredient}
                        onChange={(e) => setCurrentIngredient(e.target.value)}
                        className="flex-1 border rounded-lg p-2 text-sm"
                        placeholder="Add ingredient..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddIngredient(e);
                            }
                        }}
                    />
                    <button type="button" onClick={handleAddIngredient} className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg">
                        <Plus size={20} />
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {ingredients.map((ing, i) => (
                        <span key={i} className="bg-gray-50 text-gray-700 text-sm px-2 py-1 rounded-md border flex items-center gap-1">
                            {ing}
                            <button type="button" onClick={() => removeIngredient(i)} className="text-gray-400 hover:text-red-500">
                                <X size={14}/>
                            </button>
                        </span>
                    ))}
                </div>
             </div>
             
             <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
             >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Save size={18} />}
                Save to Pantry
             </button>
          </form>
       </div>
    </div>
  );
}
