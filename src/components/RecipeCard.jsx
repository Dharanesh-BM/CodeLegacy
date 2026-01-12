import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function RecipeCard({ data, onAddToPantry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden my-2 max-w-sm w-full">
      <div className="bg-orange-50 p-4 border-b border-orange-100">
        <h3 className="font-bold text-gray-800 text-lg">{data.dishName}</h3>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ingredients</h4>
          <div className="flex flex-wrap gap-2">
            {data.ingredients.map((ing, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full border border-gray-200">
                {ing}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
           <button 
             onClick={() => setExpanded(!expanded)}
             className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
           >
             {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
             {expanded ? "Hide Recipe" : "View Recipe"}
           </button>
           
           {expanded && (
             <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
               {data.recipe}
             </div>
           )}
        </div>

        <button 
          onClick={onAddToPantry}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Add to Pantry
        </button>
      </div>
    </div>
  );
}
