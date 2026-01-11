import React from 'react';
import { Coffee, Sunrise, Cookie, Utensils, Moon, Plus, Trash2 } from 'lucide-react';

export const getMealConfig = (type) => {
  switch (type) {
    case 'Pre-Breakfast':
    case 'Pre-Workout':
      return { icon: Coffee, color: 'border-yellow-500', iconColor: 'text-gray-700' };
    case 'Breakfast':
      return { icon: Sunrise, color: 'border-yellow-400', iconColor: 'text-gray-700' };
    case 'Snack':
    case 'Mid-morning Snacks':
      return { icon: Cookie, color: 'border-green-400', iconColor: 'text-gray-700' };
    case 'Lunch':
      return { icon: Utensils, color: 'border-blue-500', iconColor: 'text-gray-700' };
    case 'Dinner':
      return { icon: Moon, color: 'border-purple-500', iconColor: 'text-gray-700' };
    default:
      return { icon: Utensils, color: 'border-gray-300', iconColor: 'text-gray-700' };
  }
};

export default function MealSection({ title, count, children, onAdd, showAddButton = false }) {
  const { icon: Icon, color, iconColor } = getMealConfig(title);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4`}>
       {/* Left Border Wrapper */}
      <div className={`flex border-l-4 ${color}`}>
        <div className="flex-1 p-4 min-w-0">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                <Icon size={20} className={iconColor} />
                <h3 className="font-bold text-gray-800">{title}</h3>
             </div>
             {showAddButton ? (
               <button 
                 onClick={onAdd}
                 className="bg-blue-50 text-blue-500 p-1.5 rounded-full hover:bg-blue-100 transition-colors"
               >
                 <Plus size={18} />
               </button>
             ) : (
                <span className="text-sm text-gray-500">{count} items</span>
             )}
          </div>
          
          <div className="space-y-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
