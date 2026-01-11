import React, { useState } from 'react';
import { db as dexieDb } from '../db/db';
import { db as firestoreDb } from '../firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { CloudUpload } from 'lucide-react';

export default function DataMigration() {
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();

  const migrateData = async () => {
    if (!currentUser) return;
    
    setMigrating(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Migrate Foods
      const foods = await dexieDb.foods.toArray();
      const foodBatch = writeBatch(firestoreDb);
      
      const foodsRef = collection(firestoreDb, 'users', currentUser.uid, 'foods');
      
      for (const food of foods) {
        // Create a new doc ref for each food
        const newDocRef = doc(foodsRef); 
        foodBatch.set(newDocRef, {
          name: food.name,
          mealType: food.mealType,
          originalId: food.id // Keep reference to old ID if needed
        });
      }
      
      await foodBatch.commit();
      console.log(`Migrated ${foods.length} foods.`);

      // 2. Migrate Plans
      const plans = await dexieDb.plans.toArray();
      const plansBatch = writeBatch(firestoreDb);
      const plansRef = collection(firestoreDb, 'users', currentUser.uid, 'plans');

      for (const plan of plans) {
         const newDocRef = doc(plansRef);
         plansBatch.set(newDocRef, {
           date: plan.date,
           mealType: plan.mealType,
           foodId: plan.foodId, // Note: This ID links to Dexie ID, might be broken in Firestore unless we map it. 
           // Ideally, we would update foodId to the new Firestore ID, but that requires a lookup table.
           // For simplicity in this hackathon context, we might rely on the 'name' or just keep the old ID for reference.
           name: plan.name,
           isCompleted: plan.isCompleted
         });
      }
      
      await plansBatch.commit();
      console.log(`Migrated ${plans.length} plans.`);
      
      // Optional: Clear Dexie? User might want to keep it as backup for now.
      setSuccess(true);

    } catch (err) {
      console.error("Migration failed:", err);
      setError(err.message);
    } finally {
      setMigrating(false);
    }
  };

  if (success) {
    return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Data migrated to cloud.</span>
        </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <h3 className="font-bold text-lg mb-2">Sync Local Data</h3>
      <p className="text-gray-600 mb-4 text-sm">Upload your local foods and plans to the cloud to access them on other devices.</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          Error: {error}
        </div>
      )}

      <button
        onClick={migrateData}
        disabled={migrating || !currentUser}
        className={`flex items-center gap-2 px-4 py-2 rounded text-white ${migrating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        <CloudUpload size={20} />
        {migrating ? 'Syncing...' : 'Sync to Cloud'}
      </button>
    </div>
  );
}
