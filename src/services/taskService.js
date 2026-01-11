import { getAccessToken } from './googleAuth';

export const addIngredientsToTasks = async (ingredientsList) => {
  const token = getAccessToken();
  
  if (!token) {
    // Rely on UI to handle the missing token state mostly, but good safety check
    console.error("No access token. Please sync.");
    return false;
  }

  // Google Tasks API doesn't support "Batch" add nicely, 
  // so we loop through and add them one by one.
  const promises = ingredientsList.map(ingredient => {
    return fetch("https://tasks.googleapis.com/tasks/v1/lists/@default/tasks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `Buy ${ingredient}`, 
        notes: "Added from SmartMeal AI"
      }),
    });
  });

  try {
    const responses = await Promise.all(promises);
    // Check if at least one failed to handle mixed results if needed, 
    // but for now return true if no exception.
    // Ideally check if all responses are ok.
    const allOk = responses.every(r => r.ok);
    if (!allOk) console.warn("Some tasks might have failed to add");
    
    return allOk;
  } catch (error) {
    console.error("Error adding tasks", error);
    return false;
  }
};
