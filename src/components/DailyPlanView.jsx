import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Soup, UtensilsCrossed, Check, Plus, X, Trash2 } from 'lucide-react';
import MealSection from './MealSection';

export default function DailyPlanView({ date, title, showDateNav = false, onDateChange, readOnly = false }) {
  const dateString = date.toISOString().split('T')[0];
  const { currentUser } = useAuth();
  
  // Plans Ref
  const plansRef = currentUser ? query(
      collection(db, 'users', currentUser.uid, 'plans'), 
      where('date', '==', dateString)
  ) : null;
  const [plansSnapshot, plansLoading] = useCollection(plansRef);
  
  const plans = plansSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState(null);

  // Foods Ref (for Modal)
  const foodsRef = (currentUser && activeMealType) ? query(
      collection(db, 'users', currentUser.uid, 'foods'),
      where('mealType', '==', activeMealType)
  ) : null;
  const [foodsSnapshot] = useCollection(foodsRef);

  const availableFoods = foodsSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const mealTypes = ['Pre-Breakfast', 'Breakfast', 'Mid-morning Snacks', 'Lunch', 'Dinner'];

  const handlePrevDay = () => onDateChange && onDateChange(subDays(date, 1));
  const handleNextDay = () => onDateChange && onDateChange(addDays(date, 1));

  const openAddModal = (type) => {
    setActiveMealType(type);
    setModalOpen(true);
  };

  const addToPlan = async (food) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'users', currentUser.uid, 'plans'), {
      date: dateString,
      mealType: activeMealType,
      foodId: food.id,
      name: food.name,
      isCompleted: false
    });
    setModalOpen(false);
  };

  const toggleComplete = async (plan) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid, 'plans', plan.id), { 
        isCompleted: !plan.isCompleted 
    });
  };

  const deletePlan = async (e, id) => {
      e.stopPropagation();
      if (!currentUser) return;
      if(window.confirm('Remove this meal?')) {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'plans', id));
      }
  }

  if (plansLoading) return <div className="p-4 text-center text-gray-400">Loading plan...</div>;

  return (
    <div className="">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
           <Soup className="text-blue-600" size={24} />
           <h1 className="text-xl font-bold text-gray-800">{showDateNav ? "Daily Planner" : "Today's Meals"}</h1>
        </div>
        
        {showDateNav ? (
            <div className="flex flex-col items-center">
                <div className="flex items-center justify-between w-full px-8 mb-1">
                   <button onClick={handlePrevDay} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                     <ChevronLeft size={20} />
                   </button>
                   <div className="flex items-center text-blue-500 font-medium text-sm gap-2">
                     <span className="text-lg">📅</span> {format(date, "MMM d, yyyy")}
                   </div>
                   <button onClick={handleNextDay} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                     <ChevronRight size={20} />
                   </button>
                </div>
                <h2 className="text-xl font-bold text-black">Plan for {format(date, "EEEE")}</h2>
            </div>
        ) : (
            <div className="text-center">
                 <p className="text-gray-500 text-sm">{format(date, "EEEE, MMMM d")}</p>
            </div>
        )}
      </div>

      <div className="p-4 space-y-2">
         {mealTypes.map(type => {
             const items = plans?.filter(p => p.mealType === type) || [];
             
             return (
                 <MealSection 
                    key={type} 
                    title={type} 
                    count={items.length} 
                    showAddButton={!readOnly} // Allow adding only if not readonly mode? Actually Planner allows adding.
                    onAdd={() => openAddModal(type)}
                 >
                    {items.length === 0 ? (
                        <p className="text-gray-400 text-sm py-1">No meals planned</p>
                    ) : (
                        <div className="space-y-3">
                            {items.map(item => (
                                <div 
                                  key={item.id} 
                                  onClick={() => toggleComplete(item)}
                                  className="flex items-center justify-between group cursor-pointer"
                                >
                                   <div className="flex items-center gap-3">
                                      <div className={`
                                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                                        ${item.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'}
                                      `}>
                                        {item.isCompleted && <Check size={12} className="text-white" />}
                                      </div>
                                      <span className={`text-gray-700 font-medium ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                                        {item.name}
                                      </span>
                                   </div>
                                   
                                   <button 
                                      onClick={(e) => deletePlan(e, item.id)}
                                      className="text-gray-400 hover:text-red-500 p-2 rounded-full active:bg-red-50 active:text-red-500 transition-colors"
                                      aria-label="Delete meal"
                                   >
                                      <Trash2 size={18} />
                                   </button>
                                </div>
                            ))}
                        </div>
                    )}
                 </MealSection>
             );
         })}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Add to {activeMealType}</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-2 flex-1 scrollbar-hide">
              <div className="space-y-1">
                {availableFoods?.map(food => (
                  <button
                    key={food.id}
                    onClick={() => addToPlan(food)}
                    className="w-full text-left p-3 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100 flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-500">
                            <UtensilsCrossed size={16} />
                        </div>
                        <span className="font-medium text-gray-700">{food.name}</span>
                    </div>
                    <div className="bg-blue-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={14} />
                    </div>
                  </button>
                ))}
                {availableFoods?.length === 0 && (
                  <div className="text-center p-8 text-gray-500">
                    <p className="mb-2">No foods found for {activeMealType}.</p>
                    <a href="/pantry" className="text-blue-600 font-medium hover:underline">Add foods to Pantry first</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
