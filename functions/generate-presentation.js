const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    // Parse request body
    const { topic, numSlides, additionalNotes, style } = JSON.parse(event.body);
    
    // Set up Hugging Face API configuration
    const API_URL = "https://api-inference.huggingface.co/models/gpt2";
    const API_KEY = process.env.API_KEY;
    
    // Create a style-specific prompt
    const stylePrompts = {
      professional: "Create a formal business presentation with clear sections and corporate terminology.",
      creative: "Create a visually engaging presentation with innovative concepts and inspirational content.",
      minimalist: "Create a clean, concise presentation with minimal text and focused key points.",
      educational: "Create an instructional presentation with clear learning objectives and educational content."
    };
    
    const styleGuidance = stylePrompts[style] || stylePrompts.professional;
    
    // Create prompt for the model
    const prompt = `${styleGuidance}
      
      Create a presentation outline on "${topic}" with ${numSlides} slides.
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
      const slides = createDefaultPresentation(topic, parseInt(numSlides), style);
      return {
        statusCode: 200,
        body: JSON.stringify({ slides }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    const slides = processGeneratedText(generatedText, parseInt(numSlides), topic, style);
    
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
    const parsedBody = event.body ? JSON.parse(event.body) : {};
    const slides = createDefaultPresentation(
      parsedBody.topic || 'Presentation', 
      parsedBody.numSlides || 5,
      parsedBody.style || 'professional'
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

function createDefaultPresentation(topic, numSlides, style = 'professional') {
  const slides = [];
  
  // Add title slide with style-specific subtitle
  slides.push({
    title: topic || "Presentation",
    subtitle: getSubtitleByStyle(style, topic),
    type: "title"
  });
  
  // Style-specific slide templates
  const slideTemplates = {
    professional: [
      { title: "Executive Summary", points: [
        "Overview of business objectives",
        "Key market opportunities",
        "Financial projections and ROI",
        "Strategic positioning and competitive advantages"
      ]},
      { title: "Market Analysis", points: [
        "Industry trends and market size",
        "Competitor landscape and positioning",
        "Target customer segments and demographics",
        "Market share opportunities and growth potential"
      ]},
      { title: "Strategic Approach", points: [
        "Core business strategy and objectives",
        "Value proposition and differentiators",
        "Go-to-market approach",
        "Key partnerships and alliances"
      ]},
      { title: "Implementation Plan", points: [
        "Project phases and milestones",
        "Resource requirements and allocation",
        "Timeline and delivery schedule",
        "Key performance indicators (KPIs)"
      ]},
      { title: "Financial Overview", points: [
        "Investment requirements and capital allocation",
        "Revenue projections and forecast models",
        "Cost structure and operational expenses",
        "Risk assessment and mitigation strategies"
      ]},
      { title: "Action Items", points: [
        "Key decisions and approvals required",
        "Team responsibilities and accountability",
        "Next steps and immediate priorities",
        "Success metrics and evaluation criteria"
      ]}
    ],
    
    creative: [
      { title: "The Big Idea", points: [
        "Introducing our creative vision",
        "Breaking conventional thinking",
        "Inspiration and concept development",
        "Unique perspectives and approaches"
      ]},
      { title: "Storytelling & Narrative", points: [
        "Creating an emotional connection",
        "Building a compelling story arc",
        "Visual and verbal communication strategies",
        "Character and audience engagement"
      ]},
      { title: "Innovation Workshop", points: [
        "Brainstorming techniques and creative exercises",
        "Challenging assumptions and limits",
        "Collaborative ideation process",
        "Transforming constraints into opportunities"
      ]},
      { title: "Visual Expression", points: [
        "Color theory and emotional impact",
        "Typography and visual hierarchy",
        "Imagery and symbolic representation",
        "Animation and movement concepts"
      ]},
      { title: "Audience Experience", points: [
        "Creating memorable moments and interactions",
        "Sensory engagement strategies",
        "Participatory and immersive elements",
        "Lasting impression and takeaways"
      ]},
      { title: "Creative Evolution", points: [
        "Iterative design process",
        "Feedback integration and refinement",
        "Creative expansion and future directions",
        "Building on successful concepts"
      ]}
    ],
    
    minimalist: [
      { title: "Purpose", points: [
        "Core objective",
        "Essential background",
        "Key value proposition"
      ]},
      { title: "Framework", points: [
        "Fundamental structure",
        "Key principles",
        "Basic methodology"
      ]},
      { title: "Focus Areas", points: [
        "Primary concentration",
        "Secondary elements",
        "Critical factors"
      ]},
      { title: "Implementation", points: [
        "Streamlined approach",
        "Essential resources",
        "Timeline basics"
      ]},
      { title: "Results", points: [
        "Expected outcomes",
        "Success metrics",
        "Value delivered"
      ]},
      { title: "Next Steps", points: [
        "Immediate actions",
        "Key responsibilities",
        "Follow-up process"
      ]}
    ],
    
    educational: [
      { title: "Learning Objectives", points: [
        "Key knowledge and skills to be acquired",
        "Competency development goals",
        "Application opportunities",
        "Assessment approach and criteria"
      ]},
      { title: "Foundational Concepts", points: [
        "Essential terminology and definitions",
        "Theoretical framework and principles",
        "Historical context and development",
        "Current state of knowledge and research"
      ]},
      { title: "Key Methods", points: [
        "Fundamental approaches and techniques",
        "Step-by-step processes",
        "Common tools and resources",
        "Best practices and guidelines"
      ]},
      { title: "Practical Applications", points: [
        "Real-world case studies and examples",
        "Implementation scenarios",
        "Problem-solving strategies",
        "Adaptation to different contexts"
      ]},
      { title: "Assessment & Practice", points: [
        "Knowledge check questions",
        "Hands-on exercises and activities",
        "Self-evaluation opportunities",
        "Application challenges"
      ]},
      { title: "Additional Resources", points: [
        "Further reading and materials",
        "Reference guides and tools",
        "Community and support options",
        "Continued learning path"
      ]}
    ],
    
    // New styles
    corporate: [
      { title: "Company Overview", points: [
        "Corporate history and milestones",
        "Mission, vision and core values",
        "Organizational structure",
        "Global presence and market position"
      ]},
      { title: "Industry Landscape", points: [
        "Current market trends and dynamics",
        "Key industry challenges and opportunities",
        "Competitive positioning analysis",
        "Regulatory considerations"
      ]},
      { title: "Strategic Initiatives", points: [
        "Key business priorities",
        "Growth and expansion strategies",
        "Innovation and digital transformation",
        "Sustainable business practices"
      ]},
      { title: "Performance Indicators", points: [
        "Financial highlights and metrics",
        "Operational efficiency measures",
        "Customer satisfaction and retention",
        "Employee engagement and productivity"
      ]},
      { title: "Future Outlook", points: [
        "Short-term and long-term objectives",
        "Market expansion opportunities",
        "Product and service roadmap",
        "Investment and resource allocation"
      ]}
    ],
    
    technical: [
      { title: "System Architecture", points: [
        "Overall system structure and components",
        "Infrastructure and deployment model",
        "Integration points and APIs",
        "Security architecture and protocols"
      ]},
      { title: "Technology Stack", points: [
        "Programming languages and frameworks",
        "Database and storage solutions",
        "Front-end technologies and UI components",
        "Third-party services and dependencies"
      ]},
      { title: "Implementation Approach", points: [
        "Development methodology",
        "Testing strategy and quality assurance",
        "Continuous integration and deployment",
        "Code management and versioning"
      ]},
      { title: "Performance Metrics", points: [
        "Response time and throughput",
        "Scalability and load handling",
        "Resource utilization",
        "Error rates and reliability measures"
      ]},
      { title: "Technical Roadmap", points: [
        "Planned feature development",
        "Technical debt resolution",
        "Upgrade and migration plans",
        "Research and innovation areas"
      ]}
    ],
    
    pitch: [
      { title: "The Problem", points: [
        "Market pain point or gap",
        "Impact on customers or businesses",
        "Current solutions and limitations",
        "Scale and scope of the problem"
      ]},
      { title: "Our Solution", points: [
        "Product/service overview",
        "Key features and benefits",
        "Unique value proposition",
        "Competitive advantages"
      ]},
      { title: "Market Opportunity", points: [
        "Target market size and growth",
        "Customer segments and profiles",
        "Market trends and timing advantages",
        "Initial traction and validation"
      ]},
      { title: "Business Model", points: [
        "Revenue streams and pricing strategy",
        "Sales and marketing approach",
        "Customer acquisition strategy",
        "Growth and scaling plans"
      ]},
      { title: "Ask & Offering", points: [
        "Investment required",
        "Use of funds and milestones",
        "Expected returns and timeline",
        "Partnership or support requested"
      ]}
    ],
    
    infographic: [
      { title: "Key Statistics", points: [
        "Primary data points and metrics",
        "Growth percentages and comparisons",
        "Historical trends and patterns",
        "Regional or demographic breakdowns"
      ]},
      { title: "Visual Timeline", points: [
        "Key milestones and events",
        "Evolution and development stages",
        "Future projections and goals",
        "Comparative historical data"
      ]},
      { title: "Process Flow", points: [
        "Step-by-step methodology",
        "Input and output elements",
        "Decision points and alternatives",
        "Feedback loops and iterations"
      ]},
      { title: "Comparison Matrix", points: [
        "Feature and benefit analysis",
        "Option evaluation criteria",
        "Strength/weakness assessment",
        "Cost-benefit relationships"
      ]},
      { title: "Data Visualization", points: [
        "Trends and patterns representation",
        "Statistical analysis findings",
        "Correlations and relationships",
        "Forecasts and projections"
      ]}
    ]
  };
  
  // Topic-specific templates for common subjects
  const topicTemplates = {
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
  
  // Select appropriate template based on style and topic
  let template = slideTemplates[style] || slideTemplates.professional;
  
  // Check if we should use a topic-specific template
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes('data sci') || lowerTopic.includes('analytics') || 
      lowerTopic.includes('machine learning') || lowerTopic.includes('ai')) {
    template = topicTemplates.dataScience;
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
    const styleTemplate = slideTemplates[style] || slideTemplates.professional;
    const extraSlide = styleTemplate[slides.length % styleTemplate.length];
    slides.push({
      title: extraSlide.title,
      content: extraSlide.points,
      type: "content"
    });
  }
  
  // Add final slide with style-appropriate closing
  slides.push({
    title: getClosingTitleByStyle(style),
    content: getClosingContentByStyle(style),
    type: "end"
  });
  
  return slides;
}

// Style-specific presentation subtitles
function getSubtitleByStyle(style, topic) {
  const subtitles = {
    professional: "Strategic Overview",
    creative: "Innovative Perspectives",
    minimalist: "Key Insights",
    educational: "Learning & Development"
  };
  return subtitles[style] || "Generated Presentation";
}

// Style-specific closing slide titles
function getClosingTitleByStyle(style) {
  const closingTitles = {
    professional: "Thank You",
    creative: "Let's Create Together",
    minimalist: "Questions?",
    educational: "Key Takeaways"
  };
  return closingTitles[style] || "Thank You";
}

// Style-specific closing slide content
function getClosingContentByStyle(style) {
  const closingContent = {
    professional: "Contact us for further information",
    creative: "Imagination is just the beginning",
    minimalist: "Thank you for your attention",
    educational: "Remember the core concepts we explored today"
  };
  return closingContent[style] || "Any questions?";
}

function processGeneratedText(text, numSlides, topic, style = 'professional') {
  // First check if we have usable content
  if (!text || text.trim().length < 50) {
    return createDefaultPresentation(topic, numSlides, style);
  }
  
  const slides = [];
  
  // Add style-specific title slide
  slides.push({
    title: topic || text.split('\n')[0].replace('Slide 1:', '').trim() || "Presentation",
    subtitle: getSubtitleByStyle(style),
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
  
  // If we don't have enough slides, add some from style-specific templates
  if (slides.length < numSlides - 1) {
    const defaultSlides = createDefaultPresentation(topic, numSlides, style);
    
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
  
  // Add style-specific final slide
  slides.push({
    title: getClosingTitleByStyle(style),
    content: getClosingContentByStyle(style),
    type: "end"
  });
  
  return slides;
}