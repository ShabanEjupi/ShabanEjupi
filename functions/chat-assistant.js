const axios = require('axios');

exports.handler = async (event, context) => {
  // Kontrolloni metodën e kërkesës
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Parsoni trupin e kërkesës
    const payload = JSON.parse(event.body);
    const messages = payload.messages || [];

    // Kontrolloni nëse kemi mesazhe të vlefshme
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid messages format" })
      };
    }

    // Vendosni API URL dhe çelësin bazuar në variablat e mjedisit
    const API_URL = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      throw new Error("Missing API key in environment variables");
    }

    // Formatoni mesazhet për API-në
    const apiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Sigurohuni që të kemi një mesazh sistemi nëse nuk është i pari
    if (apiMessages.length > 0 && apiMessages[0].role !== "system") {
      apiMessages.unshift({
        role: "system",
        content: "Ti je një asistent ekspert për gjenerimin e prezantimeve PowerPoint. " +
                "Ndihmo përdoruesit me ide për tema prezantimesh, këshilla për struktura, dhe sugjerime " +
                "për përmbajtjen e slajdeve. Gjithashtu ndihmo me zgjedhjen e stileve të prezantimit që u përshtaten qëllimeve " +
                "të tyre specifike. Përgjigju në gjuhën shqipe."
      });
    }

    // Thirrja në OpenAI API
    const response = await axios({
      method: 'POST',
      url: API_URL,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: "gpt-4-turbo", // Ose modelin që dëshironi të përdorni
        messages: apiMessages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        presence_penalty: 0.2,
        frequency_penalty: 0.5,
        functions: [
          {
            name: "generate_follow_up_suggestions",
            description: "Generate 2-3 follow-up questions or suggestions based on the conversation",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "List of 2-3 follow-up suggestions in Albanian language"
                }
              },
              required: ["suggestions"]
            }
          }
        ],
        function_call: "auto"
      },
      timeout: 10000 // 10 sekonda timeout
    });

    // Merrni përgjigjen nga API
    const result = response.data;
    let assistantMessage = "";
    let suggestions = [];
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      // Nxjerr përgjigjen e asistentit
      assistantMessage = result.choices[0].message.content || "";
      
      // Kontrollo nëse kemi thirrje funksioni për sugjerime pasuese
      if (result.choices[0].message.function_call && 
          result.choices[0].message.function_call.name === "generate_follow_up_suggestions") {
        try {
          const functionArgs = JSON.parse(result.choices[0].message.function_call.arguments);
          suggestions = functionArgs.suggestions || [];
        } catch (e) {
          console.error("Error parsing function arguments:", e);
        }
      }
    }

    // Kthe përgjigjen dhe sugjerimet
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        response: assistantMessage,
        suggestions: suggestions
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error("Error:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "An error occurred while processing your request.",
        details: error.message
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};