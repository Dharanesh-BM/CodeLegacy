import { useState, useEffect } from 'react';
import { X, ShoppingCart, Loader, CheckCircle } from 'lucide-react'; // Added CheckCircle for success state?
import { addIngredientsToTasks } from '../services/taskService';

export default function IngredientModal({ isOpen, onClose, ingredients, mealName }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error'

  // Reset selected state when modal opens
  useEffect(() => {
    if (isOpen) {
        setSelected(ingredients || []); // Default select all
        setStatus(null);
    }
  }, [isOpen, ingredients]);

  // Don't render if not open
  if (!isOpen) return null;

  const toggleIngredient = (ing) => {
    if (selected.includes(ing)) {
        setSelected(selected.filter(i => i !== ing));
    } else {
        setSelected([...selected, ing]);
    }
  };

  const handleAddToTasks = async () => {
      if (selected.length === 0) return;
      setLoading(true);
      setStatus(null);
      
      const result = await addIngredientsToTasks(selected);
      
      setLoading(false);
      if (result) {
          setStatus('success');
          // Close after a short delay
          setTimeout(() => {
              onClose();
          }, 1500);
      } else {
          setStatus('error');
      }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                    <ShoppingCart size={18} className="text-blue-600"/>
                </div>
                Shopping List
             </h3>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                <X size={20}/>
             </button>
        </div>
        
        <div className="p-5">
           <div className="mb-4">
               <h4 className="text-sm font-semibold text-gray-700">{mealName}</h4>
               <p className="text-xs text-gray-500">Select items to add to your Google Tasks</p>
           </div>
           
           <div className="flex flex-col gap-2 mb-6 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
               {ingredients?.map((ing, idx) => (
                   <label key={idx} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selected.includes(ing) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border-gray-200'}`}>
                       <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes(ing) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                           {selected.includes(ing) && <CheckCircle size={12} className="text-white" />}
                       </div>
                       <input 
                          type="checkbox" 
                          checked={selected.includes(ing)}
                          onChange={() => toggleIngredient(ing)}
                          className="hidden" // Hiding default checkbox for custom styling
                       />
                       <span className={`text-sm ${selected.includes(ing) ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{ing}</span>
                   </label>
               ))}
               {(!ingredients || ingredients.length === 0) && (
                   <div className="text-center py-6 bg-gray-50 rounded-lg dashed-border">
                        <ShoppingCart size={32} className="mx-auto text-gray-300 mb-2"/>
                        <p className="text-gray-400 text-sm">No ingredients found for this meal.</p>
                   </div>
               )}
           </div>
           
           {status === 'success' && (
               <div className="mb-4 text-green-700 bg-green-50 p-3 rounded-lg text-sm flex items-center gap-2 justify-center border border-green-100">
                   <div className="bg-green-100 p-1 rounded-full"><CheckCircle size={14} /></div>
                   Successfully added to Google Tasks!
               </div>
           )}
           
            {status === 'error' && (
               <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm text-center border border-red-100">
                   Failed to add tasks. Please ensure you have synced with Google.
               </div>
           )}

           <div className="flex gap-3 pt-2">
               <button 
                  onClick={onClose} 
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
               </button>
               <button 
                  onClick={handleAddToTasks} 
                  disabled={loading || selected.length === 0}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm font-medium shadow-sm shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader className="animate-spin" size={18}/> : 'Add to Tasks'}
               </button>
           </div>
        </div>
      </div>
    </div>
  );
}