import { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar as CalendarIcon, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { addMealToCalendar } from '../services/calendarService';

export default function MealConfirmationModal({ isOpen, onClose, initialData }) {
    const [mealName, setMealName] = useState('');
    const [mealType, setMealType] = useState('Breakfast');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default Today
    const [loading, setLoading] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (initialData) {
            setMealName(initialData.mealName || '');
            setMealType(initialData.mealTime || 'Breakfast');
            setIngredients(initialData.ingredients || []);
            // Date handling could be improved if the AI extracted it, 
            // but for now we default to today as per instructions not including date in JSON
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;
    const handleConfirm = async () => {
        if (!mealName || !mealType || !date || !currentUser) return;
        setLoading(true);

        try {
            // 1. Find or Create Food in Firebase
            const foodsRef = collection(db, 'users', currentUser.uid, 'foods');
            const q = query(foodsRef, where('name', '==', mealName));
            const querySnapshot = await getDocs(q);
            
            let foodId;
            let foodData;

            if (!querySnapshot.empty) {
                // Found existing food
                const doc = querySnapshot.docs[0];
                foodId = doc.id;
                foodData = doc.data();
            } else {
                // Add new food to Pantry (Master List)
                const newFoodData = {
                    name: mealName,
                    mealType: mealType,
                    ingredients: ingredients,
                    createdAt: new Date()
                };
                const docRef = await addDoc(foodsRef, newFoodData);
                foodId = docRef.id;
                foodData = newFoodData;
            }

            // 2. Add to Google Calendar (Optional, best effort)
            let googleEventId = null;
            try {
                googleEventId = await addMealToCalendar({
                    date: date,
                    mealType: mealType,
                    name: mealName,
                    foodName: mealName
                });
            } catch (calError) {
                console.warn("Failed to add to calendar", calError);
            }

            // 3. Add to Plan in Firebase
            await addDoc(collection(db, 'users', currentUser.uid, 'plans'), {
                date: date,
                mealType: mealType,
                foodId: foodId,
                name: mealName,
                ingredients: foodData.ingredients || [],
                isCompleted: false,
                googleEventId: googleEventId || null 
            });

            // 4. Close
            onClose();
            // Optional: Show success toast/message
        } catch (error) {
            console.error("Failed to save meal", error);
        } finally {
            setLoading(false);
        }
    };  

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <div className="bg-green-100 p-1.5 rounded-lg">
                            <Utensils size={18} className="text-green-600"/>
                        </div>
                        Confirm Meal
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                        <X size={20}/>
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Meal Name</label>
                        <input 
                            type="text" 
                            value={mealName} 
                            onChange={(e) => setMealName(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">When?</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                                <input 
                                    type="date" 
                                    value={date} 
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-9 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Meal Time</label>
                            <div className="relative">
                                <Clock className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                                <select 
                                    value={mealType} 
                                    onChange={(e) => setMealType(e.target.value)}
                                    className="w-full pl-9 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none bg-white"
                                >
                                    <option>Breakfast</option>
                                    <option>Lunch</option>
                                    <option>Dinner</option>
                                    <option>Snack</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {ingredients.length > 0 && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Guessed Ingredients</label>
                            <div className="flex flex-wrap gap-2">
                                {ingredients.map((ing, i) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200">
                                        {ing}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg mt-2 flex items-center justify-center gap-2 transition-colors"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Confirm & Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
