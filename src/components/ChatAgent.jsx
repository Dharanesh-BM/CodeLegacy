import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Sparkles, Bot, Camera } from 'lucide-react';
import { sendMessageToAgent, identifyFoodFromImage } from '../services/ai';
import MealConfirmationModal from './MealConfirmationModal';
import RecipeCard from './RecipeCard';
import AddFoodModal from './AddFoodModal';

export default function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi! I'm your meal planning assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Action Handling
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Pantry Add Handling
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [addFoodData, setAddFoodData] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow animation/rendering to complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    // Call AI Service
    const response = await sendMessageToAgent(userText);
    setIsLoading(false);

    if (response.type === 'ACTION') {
      // It's a command to open the modal!
      setMessages(prev => [...prev, { role: 'model', text: "I can help with that! Please confirm the details." }]);
      setModalData(response.data);
      setShowModal(true);
    } else {
      // Normal text response
      setMessages(prev => [...prev, { role: 'model', text: response.message }]);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input for next time
    e.target.value = null;

    setMessages(prev => [...prev, { role: 'user', text: "📸 Analyzing your photo..." }]);
    setIsLoading(true);

    try {
        const reader = new FileReader();
        reader.onloadend = async () => {
            // Get Base64 only
            const base64Data = reader.result.split(',')[1];
            
            const result = await identifyFoodFromImage(base64Data);
            
            setIsLoading(false);
            
            if (result) {
               setMessages(prev => [...prev, { 
                   role: 'model', 
                   text: `That looks like ${result.dishName}!`,
                   type: 'RECIPE_RESULT', 
                   data: result 
               }]);
            } else {
               setMessages(prev => [...prev, { role: 'model', text: "I couldn't quite identify that dish. Try another angle?" }]);
            }
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error("Image processing error:", error);
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'model', text: "Sorry, there was an error processing your image." }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openAddPantryModal = (data) => {
      setAddFoodData({
          name: data.dishName,
          ingredients: data.ingredients
      });
      setShowAddFoodModal(true);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Interface Drawer/Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col sm:flex-row sm:justify-end sm:items-end sm:p-4 pointer-events-none">
          {/* Backdrop (Click to close) */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-auto sm:rounded-none" 
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Window */}
          <div className="relative z-10 pointer-events-auto w-full sm:w-[400px] h-full sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold">SmartMeal AI</h3>
                  <p className="text-xs text-blue-100">Powered by Gemini</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-none p-3' 
                        : 'text-gray-800' // wrapper for model messages
                    }`}
                  >
                     {/* Text Bubble for Model */}
                     {msg.role === 'model' && msg.type !== 'RECIPE_RESULT' && (
                         <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                             {msg.text}
                         </div>
                     )}
                     
                     {/* Text content for User or Model (if mixed) */}
                     {msg.role === 'user' && msg.text}

                     {/* Special Types */}
                     {msg.type === 'RECIPE_RESULT' && (
                         <>
                            {msg.text && (
                                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm mb-2">
                                    {msg.text}
                                </div>
                            )}
                            <RecipeCard 
                                data={msg.data} 
                                onAddToPantry={() => openAddPantryModal(msg.data)}
                            />
                         </>
                     )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    Analyzing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
               <input 
                   type="file" 
                   accept="image/*" 
                   capture="environment" 
                   ref={fileInputRef} 
                   onChange={handleImageSelect}
                   className="hidden"
               />
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-blue-600 transition-colors"
                    title="Take photo of food"
                    disabled={isLoading}
                >
                    <Camera size={20} />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask for recipe or snap a photo..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 min-w-0"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-1.5 rounded-full transition-colors ${
                    input.trim() && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-2">
                AI can make mistakes. Verify important info.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Plans */}
      <MealConfirmationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        initialData={modalData}
      />
      
      {/* Add To Pantry Modal */}
      <AddFoodModal
         isOpen={showAddFoodModal}
         onClose={() => setShowAddFoodModal(false)}
         initialData={addFoodData}
      />
    </>
  );
}
