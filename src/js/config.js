/// src/js/config.js

console.log("Loading config.js (Hardcoded Mode)...");

// 1. SUPABASE KEYS (Hardcoded for stability)
export const SUPABASE_URL = "https://oannlpewujcnmbzzvklu.supabase.co"; 
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbm5scGV3dWpjbm1ienp2a2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzQwMDQsImV4cCI6MjA2MTcxMDAwNH0.2hKaOLPYsRh6p1CQFfLYqpTo2Cz1WuQa4Y5n0AIoNPE";

// 2. EMAIL KEYS
export const EMAIL_SERVICE_ID = "service_rrotpos";  
export const EMAIL_TEMPLATE_ID = "template_b1rhpqe"; 
export const EMAIL_PUBLIC_KEY = "q-cEhuh-4Xkk7iodE";

// 3. SAFETY CHECK
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("CRITICAL: Keys are empty even after hardcoding.");
} else {
    console.log("Keys loaded successfully.");
}