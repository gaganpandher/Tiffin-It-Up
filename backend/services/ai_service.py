import os
from groq import Groq
import json

# Initialize the Groq client. It will automatically look for the GROQ_API_KEY environment variable.
# We set a dummy key to prevent crashes on startup if the key is missing during local development.
# The user will need to provide the actual key in the .env file.
api_key = os.getenv("GROQ_API_KEY", "dummy_key")
client = Groq(api_key=api_key)

def get_meal_recommendations(user_profile: dict, order_history: list, available_meals: list) -> list:
    """
    Calls the Groq API (Llama 3 8B) to generate meal recommendations based on user data.
    """
    if api_key == "dummy_key":
        print("WARNING: GROQ_API_KEY is missing. Returning fallback dummy recommendations.")
        # Return fallback dummy data if API key is not configured
        if available_meals:
            return available_meals[:3] # Just return the first 3 as a fallback
        return []

    # Construct the context for the AI
    prompt_context = f"""
    You are a culinary AI assistant for 'Tiffin It Up', a meal delivery platform.
    Your task is to recommend exactly 3 meals from the available catalog based on the user's profile and history.
    
    USER PROFILE:
    {json.dumps(user_profile, indent=2)}
    
    RECENT ORDER HISTORY (Themes/Preferences):
    {json.dumps(order_history, indent=2)}
    
    AVAILABLE MEAL CATALOG (JSON array of meal objects):
    {json.dumps(available_meals, indent=2)}

    INSTRUCTIONS:
    1. Analyze the user's dietary preferences (e.g., veg/non-veg, spice level).
    2. Check their order history to see what types of food they enjoy.
    3. Select the 3 most relevant meals from the 'AVAILABLE MEAL CATALOG'.
    4. You MUST output ONLY a valid JSON array containing the EXACT 'id' integers of the 3 recommended meals. 
    5. Do not include any markdown formatting, explanations, or additional text. Just the raw JSON array (e.g., [1, 5, 12]).
    """

    try:
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are a precise JSON-only recommendation engine."},
                {"role": "user", "content": prompt_context}
            ],
            temperature=0.3, # Low temperature for more deterministic/logical choices
            max_tokens=100, # We only need a short JSON array
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Safely parse the JSON response
        try:
            # Strip potential markdown code block artifacts just in case
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            recommended_ids = json.loads(response_text)
            
            if not isinstance(recommended_ids, list):
                raise ValueError("AI response is not a list")
                
            # Filter the available meals to only include the recommended ones
            recommendations = [meal for meal in available_meals if meal['id'] in recommended_ids]
            
            # Fallback if AI hallucinated IDs
            if not recommendations:
                return available_meals[:3]
                
            return recommendations
            
        except json.JSONDecodeError:
            print(f"Failed to parse AI response: {response_text}")
            return available_meals[:3] # Fallback
            
    except Exception as e:
        print(f"Groq API Error: {e}")
        return available_meals[:3] # Fallback on error

def generate_chef_insights(historical_orders: dict, subscription_trends: dict) -> str:
    """
    Calls Groq API to generate a brief, actionable insights paragraph for the chef.
    """
    if api_key == "dummy_key":
        return "You have a solid base of weekly subscriptions. Expect strong demand for your signature dishes this week. Keep up the great work!"

    prompt_context = f"""
    You are a culinary business analyst for 'Tiffin It Up'.
    Your task is to analyze a chef's recent metrics and provide a short, actionable, and encouraging business insight paragraph (max 3 sentences).
    
    METRICS (Pre-Aggregated SQL Data):
    - Historical Orders (Last 7 Days): {json.dumps(historical_orders)}
    - Active Subscriptions: {json.dumps(subscription_trends)}
    
    INSTRUCTIONS:
    1. Identify the most popular item or category.
    2. Suggest an actionable tip (e.g., 'Stock up on paneer for the weekend').
    3. Output ONLY the insight text. No markdown, no greetings. Keep it under 3 sentences.
    """

    try:
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are a concise, professional culinary business analyst."},
                {"role": "user", "content": prompt_context}
            ],
            temperature=0.6,
            max_tokens=150,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq API Error generating insights: {e}")
        return "Unable to load insights at this time. Please check back later."
