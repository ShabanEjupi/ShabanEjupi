const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    // Parse request body
    const { topic, numSlides, additionalNotes } = JSON.parse(event.body);
    
    // Set up Hugging Face API configuration
    const API_URL = "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct";
    const API_KEY = process.env.API_KEY || "hf_xxxxxxxxxxxxxxxxxxxxxxx"; // Replace with your actual token
    
    // Create prompt for the model
    const prompt = `Create a professional presentation outline on "${topic}" with ${numSlides} slides.
      Additional notes: ${additionalNotes || 'None'}
      
      For each slide, provide a title and 3-5 bullet points.
      Include an introduction slide and a thank you slide at the end.
      
      Format your response as follows:
      
      Slide 1: [Title]
      - Point 1
      - Point 2
      - Point 3
      
      Slide 2: [Title]
      ...and so on.`;
    
    // Call Hugging Face API
    const response = await axios({
      method: 'POST',
      url: API_URL,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          return_full_text: false
        }
      },
      responseType: 'json'
    });
    
    // Process the response into slides
    const generatedText = response.data[0].generated_text || "";
    const slides = processGeneratedText(generatedText, parseInt(numSlides));
    
    // Return the result
    return {
      statusCode: 200,
      body: JSON.stringify({ slides }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate presentation', message: error.message }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};

function processGeneratedText(text, numSlides) {
  const slides = [];
  
  // Add title slide
  slides.push({
    title: text.split('\n')[0].replace('Slide 1:', '').trim(),
    subtitle: "Generated Presentation",
    type: "title"
  });
  
  // Parse slide content
  const slideRegex = /Slide\s+(\d+):\s+([^\n]+)([\s\S]*?)(?=Slide\s+\d+:|$)/g;
  let matches;
  let slideCount = 1;
  
  while ((matches = slideRegex.exec(text)) !== null && slides.length < numSlides - 1) {
    if (slideCount === 1) {
      // We already added the first slide as title
      slideCount++;
      continue;
    }
    
    const slideTitle = matches[2].trim();
    const slideContent = matches[3].trim();
    
    // Extract bullet points
    const bulletPoints = slideContent
      .split('\n')
      .map(line => line.trim().replace(/^[\s-•*]+/, '').trim())
      .filter(line => line.length > 0);
    
    slides.push({
      title: slideTitle,
      content: bulletPoints,
      type: "content"
    });
    
    slideCount++;
  }
  
  // If we don't have enough slides, add some generic ones
  while (slides.length < numSlides - 1) {
    slides.push({
      title: `Key Point ${slides.length}`,
      content: ["Important information will be added here."],
      type: "content"
    });
  }
  
  // Add final thank you slide
  slides.push({
    title: "Thank You",
    content: "Any questions?",
    type: "end"
  });
  
  return slides;
}