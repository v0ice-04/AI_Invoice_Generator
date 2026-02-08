const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env[process.env.OPENAI_API_KEY] || process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const parsePrompt = async (prompt) => {
    try {
        const systemPrompt = `
      Extract the following fields from the user's invoice request and return them as a JSON object.
      Do not include any markdown formatting (like \`\`\`json). Just return the raw JSON string.

      Fields to extract:
      - clientName (string): The name of the client or company.
      - serviceDescription (string): A brief description of the service provided.
      - baseAmount (number): The cost of the service before tax.
      - gstPercentage (number): The GST percentage (e.g., 18). If not specified, try to infer or default to 0.
      - dueDate (string, optional): The due date in ISO format (YYYY-MM-DD) if mentioned. If "today" or similar, use current date.

      Example Input: "Create invoice for website development worth ₹45,000 for ABC Pvt Ltd with 18% GST."
      Example Output:
      {
        "clientName": "ABC Pvt Ltd",
        "serviceDescription": "Website development",
        "baseAmount": 45000,
        "gstPercentage": 18,
        "dueDate": null
      }
    `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            model: "gpt-3.5-turbo",
            temperature: 0.1,
        });

        const content = completion.choices[0].message.content;
        // Clean up potential markdown code blocks if the model ignores instructions
        const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedContent);
    } catch (error) {
        console.error("OpenAI Parsing Error:", error);
        // Returning a mock response if API Key is missing or fails (for robust testing)
        if (error.message.includes('401') || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            console.warn("Using mock data due to missing/invalid OpenAI Key");
            return {
                clientName: "Mock Client Ltd",
                serviceDescription: "Mock Service (OpenAI Key Missing)",
                baseAmount: 1000,
                gstPercentage: 18,
                dueDate: new Date().toISOString()
            };
        }
        throw new Error("Failed to parse prompt with AI");
    }
};

module.exports = { parsePrompt };
