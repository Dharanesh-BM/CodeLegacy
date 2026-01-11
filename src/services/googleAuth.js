
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1066058503322-9g600hvh6215r64d5k0721245465.apps.googleusercontent.com"; // Fallback or Env variable
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient;
let accessToken = null;

// 1. Initialize the Google Identity Client (Run this once on App load)
export const initGoogleClient = () => {
  // Try to load from localStorage first
  const storedToken = localStorage.getItem('google_access_token');
  const storedExpiry = localStorage.getItem('google_token_expiry');
  
  if (storedToken && storedExpiry) {
      if (Date.now() < parseInt(storedExpiry)) {
          accessToken = storedToken;
          console.log("Restored valid Google Token");
      } else {
          console.log("Stored token expired");
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('google_token_expiry');
      }
  }

  if (typeof window !== 'undefined' && window.google) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        accessToken = tokenResponse.access_token;
        const expiresIn = tokenResponse.expires_in; // Seconds
        const expiryTime = Date.now() + (expiresIn * 1000);
        
        localStorage.setItem('google_access_token', accessToken);
        localStorage.setItem('google_token_expiry', expiryTime.toString());

        console.log("Access Token Received");
        // Dispatch custom event so UI knows we are ready
        window.dispatchEvent(new Event('google-token-received'));
      },
    });
  } else {
    // Retry if script not loaded yet
    setTimeout(initGoogleClient, 1000);
  }
};

// 2. Request the token (Call this when user clicks "Enable Calendar Sync")
export const requestCalendarPermission = () => {
  if (tokenClient) {
      // Prompt option to select account
      tokenClient.requestAccessToken({ prompt: 'consent' }); 
  } else {
      console.error("Google Token Client not initialized");
      initGoogleClient(); // Try initializing again
  }
};

// 3. Export the token for other files to use
export const getAccessToken = () => {
  // Double check expiry on retrieval
  const storedExpiry = localStorage.getItem('google_token_expiry');
  if (storedExpiry && Date.now() > parseInt(storedExpiry)) {
      accessToken = null;
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_token_expiry');
  }
  return accessToken;
};

export const isCalendarConnected = () => !!getAccessToken();

export const checkTokenStatus = () => {
    const token = getAccessToken();
    if (!token) return 'missing';
    return 'valid';
};
