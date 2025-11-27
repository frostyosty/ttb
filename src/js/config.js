/// src/js/config.js

console.log("🔍 DEBUG: Loading config.js...");

// 1. Safe Access Helper
// This prevents the "Cannot read properties of undefined" crash
const getEnv = (key) => {
    try {
        // Check if Vite injected the env object
        if (import.meta && import.meta.env) {
            const val = import.meta.env[key];
            console.log(`🔍 DEBUG: Found ${key}?`, val ? "YES (Hidden)" : "NO");
            return val;
        } else {
            console.error("❌ DEBUG: import.meta.env is MISSING. App is not running in Vite context.");
            return null;
        }
    } catch (e) {
        console.error("❌ DEBUG: Critical Error reading env:", e);
        return null;
    }
};

// 2. Export Keys (Using the helper)
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_KEY = getEnv('VITE_SUPABASE_KEY');

// 3. Email Keys (Hardcoded is fine, or use env if you set them up in Vercel)
export const EMAIL_SERVICE_ID = "service_rrotpos";  
export const EMAIL_TEMPLATE_ID = "template_b1rhpqe"; 
export const EMAIL_PUBLIC_KEY = "q-cEhuh-4Xkk7iodE";

// 4. Check for Critical Missing Keys
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("⚠️ WARNING: Supabase Keys are missing. Database connection will fail.");
    // You might want to trigger a manual alert here to see it on mobile
    // alert("Config Error: Missing API Keys");
}