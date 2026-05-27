/**
 * OpenRouter Client Integration for HAC 🐴
 *
 * Calls the OpenRouter API to generate conversational responses from HAC.
 * Automatically enforces a structured JSON response for onboarding details.
 */

const DEFAULT_MODEL = "meta/llama-3.1-70b-instruct";

/**
 * Calls OpenRouter to get HAC's next reply and extract user profile data.
 *
 * @param {Array<{role: string, content: string}>} messages - Chat history
 * @returns {Promise<{reply: string, extracted_profile: object, onboarding_completed: boolean}>}
 */
export async function getHacOnboardingResponse(messages) {
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL || DEFAULT_MODEL;

  // Fallback / Mock Response if API key is not configured
  if (!apiKey) {
    console.warn("[HAC] NVIDIA_API_KEY is not configured. Returning mock response.");
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    
    return {
      reply: `[DEMO MODE 🐴] Yo! I see you typing: "${lastUserMessage}". However, my brain (NVIDIA_API_KEY) isn't plugged in yet! Add your NVIDIA NIM API key to your .env.local file so we can actually chat. For now, let's pretend I roasted your skills. 😏`,
      extracted_profile: {
        display_name: "Hacker",
        experience_level: "beginner",
        skills: ["HTML", "JavaScript"],
        interests: ["AI/ML"],
        travel_willingness: "online_only",
        team_preference: "looking_for_team"
      },
      onboarding_completed: false
    };
  }

  const systemPrompt = `You are HAC 🐴, a witty, cheeky, slightly edgy tech-savvy horse mascot who is also a legendary hacker.
You are onboarding a new user onto HAC (the ultimate hackathon finder).
Your goal is to guide the user through a fun conversation to collect their profile information.

DO NOT ASK FOR ALL DETAILS AT ONCE. Ask questions one or two at a time, reacting to the user's inputs with playful roasts, sarcastic horse puns, or witty Deadpool-style comments. Be conversational, not a boring form!

Required details to gather:
1. display_name: Their nickname or what they want you to call them.
2. experience_level: Must resolve to one of: 'beginner', 'intermediate', or 'veteran'.
3. skills: Array of technical skills (languages, frameworks, designs, e.g. React, Python, Figma).
4. interests: Array of areas of interest (e.g. AI/ML, Web3, Social Good, Mobile Dev).
5. travel_willingness: Must resolve to one of: 'online_only', 'local', or 'willing_to_travel'.
6. team_preference: Must resolve to one of: 'solo', 'looking_for_team', or 'has_team'.

You MUST return your response as a valid JSON object with the following structure:
{
  "reply": "Your witty, conversational response to the user as HAC",
  "extracted_profile": {
    "display_name": "string (or null if not gathered yet)",
    "experience_level": "beginner | intermediate | veteran (or null if not gathered yet)",
    "skills": ["array of strings (empty array if not gathered yet)"],
    "interests": ["array of strings (empty array if not gathered yet)"],
    "travel_willingness": "online_only | local | willing_to_travel (or null if not gathered yet)",
    "team_preference": "solo | looking_for_team | has_team (or null if not gathered yet)"
  },
  "onboarding_completed": true/false
}

Only set "onboarding_completed" to true when you have successfully collected or inferred ALL 6 pieces of information.
Double check that you ALWAYS output valid JSON matching this schema and nothing else. No markdown surrounding the JSON.`;

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from NVIDIA");
    }

    try {
      // Parse the JSON returned by the model
      const parsedData = JSON.parse(content.trim());
      return {
        reply: parsedData.reply || "Neigh! I got lost in the stables. What did you say?",
        extracted_profile: parsedData.extracted_profile || {},
        onboarding_completed: !!parsedData.onboarding_completed,
      };
    } catch (parseError) {
      console.error("[HAC] JSON Parse error from NVIDIA response:", content, parseError);
      // Fallback if model failed to output valid JSON
      return {
        reply: content, // use raw text if it wasn't JSON
        extracted_profile: {},
        onboarding_completed: false,
      };
    }
  } catch (error) {
    console.error("[HAC] NVIDIA completion error:", error);
    return {
      reply: `Neigh! Something broke in my horse brain: "${error.message}". Let's try again in a second.`,
      extracted_profile: {},
      onboarding_completed: false,
    };
  }
}


/**
 * Calls NVIDIA NIM API to get HAC's reply for the persistent in-app chat.
 * This is the general-purpose chat (not onboarding). HAC is context-aware
 * and can answer questions about hackathons, give advice, etc.
 *
 * @param {Array<{role: string, content: string}>} messages - Chat history
 * @param {object} [userProfile] - Optional user profile for context
 * @returns {Promise<{reply: string}>}
 */
export async function getHacChatResponse(messages, userProfile = null) {
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    console.warn("[HAC] NVIDIA_API_KEY is not configured. Returning mock response.");
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";

    return {
      reply: `[DEMO MODE 🐴] You said: "${lastUserMessage}". My brain (NVIDIA_API_KEY) isn't plugged in yet! Add your API key to .env.local. For now, here's a free tip: the best hackathon project is the one that WORKS during the demo. Revolutionary, I know. 😏`,
    };
  }

  let contextBlock = "";
  if (userProfile) {
    contextBlock = `\n\nCurrent user context:
- Name: ${userProfile.display_name || "Unknown"}
- Skills: ${userProfile.skills?.join(", ") || "Unknown"}
- Interests: ${userProfile.interests?.join(", ") || "Unknown"}
- Experience: ${userProfile.experience_level || "Unknown"}
- Team preference: ${userProfile.team_preference || "Unknown"}`;
  }

  const systemPrompt = `You are HAC 🐴, a witty, cheeky, slightly edgy tech-savvy horse mascot. You are the AI assistant inside HAC — the ultimate hackathon finder app.

Your personality: Deadpool-lite meets Silicon Valley bro. You use horse puns sparingly, roast gently, and give genuinely helpful advice with swagger. Keep responses concise (2-4 sentences usually, unless the user asks for detail).

You help users with:
- Hackathon advice (prep, pitching, team building, winning strategies)
- Technical guidance (what to build, what stack to use)
- Motivation and encouragement (with your trademark snark)
- Questions about the HAC app itself
- General coding/tech chat

Rules:
- Stay in character as HAC the horse mascot at all times
- Be helpful but entertaining — never boring
- If asked something outside your scope, deflect with humor
- Use emoji sparingly (1-2 per message max)
- Format responses as plain text, no JSON wrapper
- You can use **bold** and \`code\` markdown${contextBlock}`;

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-20), // Keep last 20 messages for context
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return {
      reply: content || "Neigh! My brain glitched. Try again? 🐴",
    };
  } catch (error) {
    console.error("[HAC] Chat completion error:", error);
    return {
      reply: `Stable connection lost! 🐴 Error: "${error.message}". Give me a sec and try again.`,
    };
  }
}

