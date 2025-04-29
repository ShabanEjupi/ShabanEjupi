/* filepath: c:\xampp\htdocs\CustomsITPortfolio\js\pptgen.js */
document.addEventListener('DOMContentLoaded', function() {
    // Zbato gjuhën e ruajtur përpara çdo inicializimi
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        // Përdor gjuhën e ruajtur nga localStorage
        currentLanguage = savedLanguage;
        updateLanguageUI();
        updateContent();
    }

    // Initialize the form
    const form = document.getElementById('pptGenForm');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultContainer = document.getElementById('result-container');
    const previewSlides = document.getElementById('preview-slides');
    const downloadBtn = document.getElementById('download-pptx');
    const startOverBtn = document.getElementById('start-over');
    
    // Store generated presentation data
    let generatedPresentation = null;
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const topic = document.getElementById('presentation-topic').value;
        const numSlides = document.getElementById('num-slides').value;
        const style = document.getElementById('presentation-style').value;
        const notes = document.getElementById('additional-notes').value;
        
        // Show loading
        form.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
        
        try {
            // Generate presentation
            generatedPresentation = await generatePresentation(topic, numSlides, style, notes);
            
            // Render preview
            renderPreview(generatedPresentation);
            
            // Hide loading, show result
            loadingIndicator.classList.add('hidden');
            resultContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Error generating presentation:', error);
            showNotification('error', 'Failed to generate presentation. Please try again.');
            
            // Reset UI
            loadingIndicator.classList.add('hidden');
            form.classList.remove('hidden');
        }
    });
    
    // Download button
    downloadBtn.addEventListener('click', function() {
        if (generatedPresentation) {
            downloadPresentation(generatedPresentation);
        }
    });
    
    // Start over button
    if (startOverBtn) {
        startOverBtn.addEventListener('click', function() {
            // Reset form
            form.reset();
            
            // Reset UI
            resultContainer.classList.add('hidden');
            form.classList.remove('hidden');
            
            // Clear preview
            previewSlides.innerHTML = '';
            generatedPresentation = null;
        });
    }
});

/**
 * Generate a presentation based on user input
 */
async function generatePresentation(topic, numSlides, style, notes) {
    // Show user we're connecting to AI services
    console.log("Connecting to AI models...");
    
    try {
        // First, generate text content using GPT or similar model
        const contentData = await generateContentFromPrompt(topic, numSlides, notes, style);
        
        // Then, generate images for slides if needed
        const slidesWithImages = await addImagesToSlides(contentData, style);
        
        // Format the final presentation structure
        return {
            title: topic,
            style: style,
            slides: slidesWithImages
        };
    } catch (error) {
        console.error("Error generating presentation:", error);
        
        // Fallback to mock data if AI generation fails
        console.log("Falling back to mock data generation");
        return {
            title: topic,
            style: style,
            slides: generateMockSlides(topic, parseInt(numSlides), style)
        };
    }
}

/**
 * Function to generate text content from the AI service
 */
async function generateContentFromPrompt(topic, numSlides, additionalNotes, style) {
    try {
        console.log("Calling AI text generation service...");
        
        const response = await fetch('/.netlify/functions/generate-presentation', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                topic: topic,
                numSlides: numSlides,
                additionalNotes: additionalNotes,
                style: style // Add style parameter
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result.slides;
    } catch (error) {
        console.error("Error generating presentation content:", error);
        // Fallback to mock content with style
        return generateMockContentData(topic, numSlides, style);
    }
}

/**
 * Generate mock content data as fallback
 */
function generateMockContentData(topic, numSlides, style) {
    const slides = [];
    
    // Style-specific subtitles
    const styleSubtitles = {
        professional: "Strategic Overview",
        creative: "Innovative Perspectives",
        minimalist: "Key Insights",
        educational: "Learning & Development"
    };
    
    // Title slide
    slides.push({
        title: topic,
        subtitle: styleSubtitles[style] || "Generated Presentation",
        type: "title"
    });
    
    // Style-specific sections
    const styleSections = {
        professional: [
            "Executive Summary",
            "Market Analysis",
            "Strategic Approach",
            "Implementation Plan",
            "Financial Overview",
            "Action Items"
        ],
        creative: [
            "The Big Idea",
            "Storytelling & Narrative",
            "Innovation Workshop",
            "Visual Expression",
            "Audience Experience",
            "Creative Evolution"
        ],
        minimalist: [
            "Purpose",
            "Framework",
            "Focus Areas",
            "Implementation",
            "Results",
            "Next Steps"
        ],
        educational: [
            "Learning Objectives",
            "Foundational Concepts",
            "Key Methods",
            "Practical Applications",
            "Assessment & Practice",
            "Additional Resources"
        ]
    };
    
    // Select the appropriate sections based on style
    const mockSections = styleSections[style] || [
        "Introduction and Overview",
        "Key Features and Benefits",
        "Market Analysis",
        "Implementation Strategy",
        "Budget Considerations",
        "Timeline and Milestones",
        "Risk Assessment",
        "Conclusions and Next Steps"
    ];
    
    // Use mockSections to create style-appropriate content slides
    for (let i = 1; i < numSlides - 1; i++) {
        const sectionTitle = mockSections[(i - 1) % mockSections.length];
        slides.push({
            title: sectionTitle,
            content: generateStructuredPoints(sectionTitle, style, 3 + Math.floor(Math.random() * 3)),
            type: "content"
        });
    }
    
    // Style-specific closing slide
    const closingTitles = {
        professional: "Thank You",
        creative: "Let's Create Together",
        minimalist: "Questions?",
        educational: "Key Takeaways"
    };
    
    const closingContent = {
        professional: "Contact us for further information",
        creative: "Imagination is just the beginning",
        minimalist: "Thank you for your attention",
        educational: "Remember the core concepts we explored today"
    };
    
    // Add final slide
    slides.push({
        title: closingTitles[style] || "Thank You",
        content: closingContent[style] || "Any questions?",
        type: "end"
    });
    
    return slides;
}

/**
 * Generate more structured bullet points based on section title and style
 */
function generateStructuredPoints(sectionTitle, style, count) {
    // Different content based on style and section type
    const styleContentMap = {
        professional: {
            "Executive Summary": [
                "Overview of business objectives",
                "Key market opportunities",
                "Financial projections and ROI",
                "Strategic positioning and competitive advantages",
                "Critical success factors"
            ],
            "Market Analysis": [
                "Industry trends and market size",
                "Competitor landscape and positioning",
                "Target customer segments and demographics",
                "Market share opportunities and growth potential",
                "SWOT analysis highlights"
            ],
            // Add more sections as needed
        },
        minimalist: {
            "Purpose": [
                "Core objective",
                "Essential background",
                "Key value proposition",
                "Main stakeholders"
            ],
            "Framework": [
                "Fundamental structure",
                "Key principles",
                "Basic methodology",
                "Critical components"
            ],
            // Add more sections as needed
        }
        // Add more styles as needed
    };
    
    // Try to get style-specific content for the section
    const styleContent = styleContentMap[style] && styleContentMap[style][sectionTitle];
    
    // Fall back to the original content map if style-specific content not found
    if (styleContent) {
        return getRandomPoints(styleContent, count);
    }
    
    // Original content organized by section title
    const contentBySection = {
        // Your existing content map
        "Introduction and Overview": [
            "Overview of the project scope and objectives",
            "Background information and context",
            "Expected outcomes and deliverables",
            "Key stakeholders involved in the project",
            "Alignment with organizational goals"
        ],
        // Add other sections as in your original code
    };
    
    // Get relevant points or use default
    const relevantPoints = contentBySection[sectionTitle] || [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
        "Sed do eiusmod tempor incididunt ut labore et dolore",
        "Ut enim ad minim veniam, quis nostrud exercitation",
        "Duis aute irure dolor in reprehenderit in voluptate",
        "Excepteur sint occaecat cupidatat non proident"
    ];
    
    return getRandomPoints(relevantPoints, count);
}

/**
 * Helper function to get random points from an array
 */
function getRandomPoints(points, count) {
    // Get random points
    const selectedPoints = [];
    const selectedIndices = new Set();
    
    while (selectedPoints.length < Math.min(count, points.length)) {
        const randomIndex = Math.floor(Math.random() * points.length);
        if (!selectedIndices.has(randomIndex)) {
            selectedIndices.add(randomIndex);
            selectedPoints.push(points[randomIndex]);
        }
    }
    
    return selectedPoints;
}

/**
 * Process text into slide structure
 */
function processGeneratedText(generatedText, numSlides) {
    // Logic to parse generated text into slide content
    const slides = [];
    
    // Parse the generated text and create slides
    // This is a simplistic approach - you'd want more robust parsing in production
    const sections = generatedText.split(/\d+\.\s/).filter(s => s.trim());
    
    // Create title slide
    slides.push({
        title: sections[0] || "Presentation Title",
        subtitle: "Generated with AI",
        type: "title"
    });
    
    // Create content slides
    for (let i = 1; i < Math.min(sections.length, numSlides - 1); i++) {
        const section = sections[i];
        const title = section.split('\n')[0] || `Section ${i}`;
        const content = section.split('\n').slice(1).filter(line => line.trim());
        
        slides.push({
            title: title,
            content: content,
            type: "content"
        });
    }
    
    // If we need more slides, generate extras
    while (slides.length < numSlides - 1) {
        slides.push({
            title: `Additional Point ${slides.length}`,
            content: ["Additional content can be added here."],
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

/**
 * Add images to slides using Stable Diffusion or similar models
 */
async function addImagesToSlides(slides, style) {
    // For each content slide, we could generate a relevant image
    // This is optional and would require additional API calls
    
    return slides.map((slide, index) => {
        // Add style-specific background
        slide.background = getStyleBackground(style, index);
        return slide;
    });
}

/**
 * Generate mock slide data for preview
 */
function generateMockSlides(topic, count, style) {
    const slides = [];
    
    // Title slide
    slides.push({
        title: topic,
        subtitle: "Generated Presentation",
        type: "title",
        background: getStyleBackground(style, 0)
    });
    
    // Content slides
    for (let i = 1; i < count; i++) {
        if (i === count - 1) {
            // Last slide is "Thank You"
            slides.push({
                title: "Thank You",
                content: "Any questions?",
                type: "end",
                background: getStyleBackground(style, i)
            });
        } else {
            // Generate a content slide
            slides.push({
                title: `Section ${i}`,
                content: generateLoremPoints(3 + Math.floor(Math.random() * 3)),
                type: "content",
                background: getStyleBackground(style, i)
            });
        }
    }
    
    return slides;
}

/**
 * Get background color/image based on style
 */
function getStyleBackground(style, index) {
    const styles = {
        professional: [
            'linear-gradient(135deg, #2c3e50, #34495e)',
            'linear-gradient(135deg, #34495e, #2c3e50)'
        ],
        creative: [
            'linear-gradient(135deg, #ff7e5f, #feb47b)',
            'linear-gradient(135deg, #fc466b, #3f5efb)'
        ],
        minimalist: [
            'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
            'linear-gradient(135deg, #e0eafc, #cfdef3)'
        ],
        educational: [
            'linear-gradient(135deg, #3494e6, #ec6ead)',
            'linear-gradient(135deg, #11998e, #38ef7d)'
        ]
    };
    
    const styleColors = styles[style] || styles.professional;
    return styleColors[index % styleColors.length];
}

/**
 * Generate lorem ipsum bullet points
 */
function generateLoremPoints(count) {
    const loremPoints = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit",
        "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet"
    ];
    
    // Get random points
    const points = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * loremPoints.length);
        points.push(loremPoints[randomIndex]);
    }
    
    return points;
}

/**
 * Render slides preview
 */
function renderPreview(presentation) {
    const previewSlides = document.getElementById('preview-slides');
    previewSlides.innerHTML = '';
    
    presentation.slides.forEach((slide, index) => {
        const slidePreview = document.createElement('div');
        slidePreview.className = 'preview-slide';
        slidePreview.style.background = slide.background;
        
        // Create slide content preview
        const slideContent = document.createElement('div');
        slideContent.className = 'slide-content';
        slideContent.innerHTML = `
            <div style="padding: 15px; color: white; text-align: center; height: 100%;">
                <h3 style="font-size: 14px; margin-bottom: 8px;">${slide.title}</h3>
                ${slide.type === 'content' ? '<div style="font-size: 8px; text-align: left;">• • • • •</div>' : ''}
            </div>
        `;
        
        const slideNumber = document.createElement('div');
        slideNumber.className = 'slide-number';
        slideNumber.textContent = index + 1;
        
        slidePreview.appendChild(slideContent);
        slidePreview.appendChild(slideNumber);
        previewSlides.appendChild(slidePreview);
    });
}

/**
 * Download the presentation as PPTX file
 */
function downloadPresentation(presentation) {
    // Create a new presentation
    const pptx = new PptxGenJS();
    
    // Set properties
    pptx.author = 'AI PowerPoint Generator';
    pptx.company = 'Shaban Ejupi';
    pptx.revision = '1';
    pptx.subject = presentation.title;
    pptx.title = presentation.title;
    
    // Add slides
    presentation.slides.forEach(slide => {
        const newSlide = pptx.addSlide();
        
        // Set background
        newSlide.background = { color: slide.background.includes('gradient') ? '#2c3e50' : slide.background };
        
        // Add content based on slide type
        if (slide.type === 'title') {
            // Title slide
            newSlide.addText(slide.title, { 
                x: 1, y: 1, w: '100%', h: 2, 
                fontSize: 44, 
                color: 'FFFFFF', 
                bold: true,
                align: 'center'
            });
            
            newSlide.addText(slide.subtitle, { 
                x: 1, y: 3.5, w: '100%', h: 1, 
                fontSize: 28, 
                color: 'FFFFFF', 
                align: 'center'
            });
            
            // Add generated by text
            newSlide.addText('Generated by AI PowerPoint Generator', { 
                x: 1, y: 5, w: '100%', h: 0.5, 
                fontSize: 16, 
                color: 'CCCCCC', 
                align: 'center'
            });
        } 
        else if (slide.type === 'content') {
            // Content slide
            newSlide.addText(slide.title, { 
                x: 0.5, y: 0.5, w: '100%', h: 1, 
                fontSize: 32, 
                color: 'FFFFFF', 
                bold: true
            });
            
            // Add bullet points
            slide.content.forEach((point, i) => {
                newSlide.addText(point, { 
                    x: 0.7, y: 1.8 + (i * 0.7), w: '90%', h: 0.5, 
                    fontSize: 18, 
                    color: 'FFFFFF',
                    bullet: { type: 'bullet' }
                });
            });
        } 
        else if (slide.type === 'end') {
            // Thank you slide
            newSlide.addText(slide.title, { 
                x: 1, y: 2, w: '100%', h: 2, 
                fontSize: 60, 
                color: 'FFFFFF', 
                bold: true,
                align: 'center'
            });
            
            newSlide.addText(slide.content, { 
                x: 1, y: 4, w: '100%', h: 1, 
                fontSize: 24, 
                color: 'FFFFFF', 
                align: 'center'
            });
        }
    });
    
    // Save the presentation
    pptx.writeFile({ fileName: `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx` });
}

/**
 * Load example template
 */
function loadExample(templateType) {
    const topicInput = document.getElementById('presentation-topic');
    const styleSelect = document.getElementById('presentation-style');
    const slidesInput = document.getElementById('num-slides');
    
    // Set form values based on template
    switch(templateType) {
        case 'business':
            topicInput.value = "Quarterly Business Strategy";
            styleSelect.value = "professional";
            slidesInput.value = "7";
            break;
        case 'education':
            topicInput.value = "Introduction to Machine Learning";
            styleSelect.value = "educational";
            slidesInput.value = "8";
            break;
        case 'proposal':
            topicInput.value = "Project Proposal: Mobile App Development";
            styleSelect.value = "creative";
            slidesInput.value = "6";
            break;
    }
    
    // Scroll to form
    document.getElementById('pptGenForm').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show notification
 */
function showNotification(type, message) {
    // Use global notification function if exists
    if (window.showNotification) {
        window.showNotification(type, message);
    } else {
        alert(message);
    }
}