const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    // Parse request body
    const { topic, numSlides, additionalNotes } = JSON.parse(event.body);
    
    // Set up Hugging Face API configuration
    // Alternative approach - try a different model better suited for text generation
    const API_URL = "https://api-inference.huggingface.co/models/gpt2";
    const API_KEY = process.env.API_KEY;
    
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
          max_length: 512,
          temperature: 0.7,
          do_sample: true
        }
      },
      responseType: 'json'
    });
    
    // Process the response into slides
    let generatedText = '';
    if (response.data && Array.isArray(response.data)) {
      generatedText = response.data[0]?.generated_text || '';
    } else if (response.data && response.data.generated_text) {
      generatedText = response.data.generated_text;
    } else {
      console.log('Unexpected API response format:', response.data);
      generatedText = createDefaultPresentation(topic, numSlides);
    }
    
    const slides = processGeneratedText(generatedText, parseInt(numSlides), topic);
    
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
    
    // Create fallback content if API fails
    const slides = createDefaultPresentation(
      event.body ? JSON.parse(event.body).topic : 'Presentation', 
      event.body ? JSON.parse(event.body).numSlides : 5
    );
    
    // Return fallback content instead of error
    return {
      statusCode: 200,
      body: JSON.stringify({ slides }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};

function createDefaultPresentation(topic, numSlides) {
  const slides = [];
  
  // Add title slide
  slides.push({
    title: topic || "Presentation",
    subtitle: "Generated Presentation",
    type: "title"
  });
  
  // Common slide structures based on topic
  const slideTemplates = {
    general: [
      { title: "Introduction", points: [
        "Overview of the topic",
        "Importance and relevance",
        "Key objectives of this presentation"
      ]},
      { title: "Key Concepts", points: [
        "Definition of important terms",
        "Core principles and methodologies",
        "Historical context and development"
      ]},
      { title: "Applications", points: [
        "Practical use cases",
        "Industry examples",
        "Benefits and advantages"
      ]},
      { title: "Challenges & Solutions", points: [
        "Common obstacles and difficulties",
        "Strategies to overcome challenges",
        "Best practices and recommendations"
      ]},
      { title: "Future Directions", points: [
        "Emerging trends and innovations",
        "Predictions for future developments",
        "Opportunities for growth and expansion"
      ]}
    ],
    dataScience: [
      { title: "Introduction to Data Science", points: [
        "Definition and scope of data science",
        "Intersection of statistics, programming and domain expertise",
        "The data science lifecycle and process"
      ]},
      { title: "Key Components", points: [
        "Data collection and preprocessing",
        "Exploratory data analysis and visualization",
        "Machine learning algorithms and modeling",
        "Evaluation and deployment"
      ]},
      { title: "Tools and Technologies", points: [
        "Programming languages (Python, R)",
        "Data visualization libraries",
        "Machine learning frameworks",
        "Big data technologies"
      ]},
      { title: "Applications and Use Cases", points: [
        "Predictive analytics in business",
        "Natural language processing applications",
        "Computer vision and image recognition",
        "Recommendation systems"
      ]},
      { title: "Future of Data Science", points: [
        "Emerging trends in AI and machine learning",
        "Ethics and responsible data science",
        "Career opportunities and skills development",
        "Industry adoption and transformation"
      ]}
    ]
  };
  
  // Select appropriate template based on topic
  let template = slideTemplates.general;
  if (topic.toLowerCase().includes('data') || 
      topic.toLowerCase().includes('analytics') || 
      topic.toLowerCase().includes('machine learning')) {
    template = slideTemplates.dataScience;
  }
  
  // Add content slides
  for (let i = 0; i < Math.min(template.length, numSlides - 2); i++) {
    slides.push({
      title: template[i].title,
      content: template[i].points,
      type: "content"
    });
  }
  
  // If we need more slides, add from general template
  while (slides.length < numSlides - 1) {
    const extraSlide = slideTemplates.general[slides.length % slideTemplates.general.length];
    slides.push({
      title: extraSlide.title,
      content: extraSlide.points,
      type: "content"
    });
  }
  
  // Add final slide
  slides.push({
    title: "Thank You",
    content: "Any questions?",
    type: "end"
  });
  
  return slides;
}

function processGeneratedText(text, numSlides, topic) {
  // First check if we have usable content
  if (!text || text.trim().length < 50) {
    return createDefaultPresentation(topic, numSlides);
  }
  
  const slides = [];
  
  // Add title slide
  slides.push({
    title: topic || text.split('\n')[0].replace('Slide 1:', '').trim() || "Presentation",
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
      content: bulletPoints.length > 0 ? bulletPoints : ["Important information about " + slideTitle],
      type: "content"
    });
    
    slideCount++;
  }
  
  // If we don't have enough slides, add some from templates
  if (slides.length < numSlides - 1) {
    const defaultSlides = createDefaultPresentation(topic, numSlides);
    
    // Skip the title slide from default slides
    while (slides.length < numSlides - 1) {
      const slideIndex = slides.length; // Including the title slide
      if (slideIndex < defaultSlides.length - 1) { // -1 to exclude the thank you slide
        slides.push(defaultSlides[slideIndex]);
      } else {
        break;
      }
    }
  }
  
  // Add final thank you slide
  slides.push({
    title: "Thank You",
    content: "Any questions?",
    type: "end"
  });
  
  return slides;
}