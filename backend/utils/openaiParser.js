const OpenAI = require('openai');
require('dotenv').config();

const parsePrompt = async (prompt) => {
    try {
        let apiKey = process.env.OPENAI_API_KEY;

        // Support for indirect key reference (e.g. OPENAI_API_KEY=KEY -> process.env.KEY)
        if (apiKey === 'KEY' && process.env.KEY) {
            apiKey = process.env.KEY;
        }

        if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'KEY') {
            console.warn("OpenAI API Key missing or invalid. Using mock data.");
            throw new Error("Missing OpenAI API Key"); // Throw to trigger catch block for mock data
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://openrouter.ai/api/v1",
        });

        const systemPrompt = `
      Extract the following fields from the user's invoice request and return them as a JSON object.
      Do not include any markdown formatting (like \`\`\`json). Just return the raw JSON string.

      CURRENT DATE: ${new Date().toISOString().split('T')[0]}

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
        console.error("OpenAI Parsing Error or Missing Key:", error.message);
        // Returning a mock response if API Key is missing or fails (for robust testing)
        console.warn("Using mock data due to missing/invalid OpenAI Key");
        return {
            clientName: "Mock Client Ltd",
            serviceDescription: "Mock Service (OpenAI Key Missing)",
            baseAmount: 1000,
            gstPercentage: 18,
            dueDate: new Date().toISOString()
        };
    }
};

module.exports = { parsePrompt };
