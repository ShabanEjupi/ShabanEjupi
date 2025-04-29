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
 * Add images to slides using predefined imagery and icons
 */
async function addImagesToSlides(slides, style) {
    // Define icon families for different presentation styles
    const iconSets = {
        professional: ['chart-line', 'handshake', 'briefcase', 'building', 'award', 'users', 'file-contract', 'chart-pie'],
        creative: ['lightbulb', 'palette', 'comments', 'camera', 'magic', 'pencil-ruler', 'shapes', 'paint-brush'],
        minimalist: ['check', 'list', 'cube', 'square', 'circle', 'arrow-right', 'tasks', 'columns'],
        educational: ['book', 'graduation-cap', 'chalkboard-teacher', 'brain', 'puzzle-piece', 'microscope', 'atom', 'flask'],
        corporate: ['landmark', 'chart-bar', 'analytics', 'money-bill', 'project-diagram', 'sitemap', 'certificate'],
        technical: ['code', 'server', 'database', 'network-wired', 'laptop-code', 'cogs', 'wifi', 'shield-alt'],
        pitch: ['rocket', 'bullseye', 'chart-line', 'money-bill-wave', 'handshake', 'users', 'search-dollar'],
        infographic: ['chart-pie', 'chart-bar', 'chart-area', 'analytics', 'percentage', 'poll', 'table', 'sort-amount-up']
    };
    
    // Repository of stock images by slide style and title keywords
    const imageKeywords = {
        professional: {
            "executive summary": "business-meeting",
            "market analysis": "market-graph",
            "strategic": "strategy-chess",
            "implementation": "project-management", 
            "financial": "financial-report",
            "action": "business-action"
        },
        creative: {
            "big idea": "creative-bulb", 
            "storytelling": "storytelling",
            "innovation": "innovation",
            "visual": "design-tools",
            "audience": "audience",
            "evolution": "growth-plant"
        },
        minimalist: {
            "purpose": "minimal-goal",
            "framework": "minimal-structure",
            "focus": "minimal-target",
            "implementation": "minimal-steps",
            "results": "minimal-chart",
            "next steps": "minimal-arrow"
        },
        educational: {
            "learning": "education-book",
            "concepts": "concept-map",
            "methods": "methodology",
            "applications": "application",
            "assessment": "assessment-test",
            "resources": "resources-library"
        },
        corporate: {
            "company": "corporate-building",
            "industry": "industry",
            "strategic": "strategy",
            "performance": "performance-metrics",
            "future": "future-vision"
        },
        technical: {
            "system": "system-architecture",
            "technology": "tech-stack",
            "implementation": "code-screen",
            "performance": "speed-metrics",
            "technical": "technical-blueprint"
        },
        pitch: {
            "problem": "problem-solution",
            "solution": "solution-key",
            "market": "market-growth",
            "business": "business-model",
            "ask": "investment-funding"
        },
        infographic: {
            "statistics": "data-charts",
            "timeline": "timeline",
            "process": "process-flow",
            "comparison": "comparison-scales",
            "visualization": "data-visualization"
        }
    };
    
    // Process each slide with appropriate visual elements
    return slides.map((slide, index) => {
        // Set style-specific background
        slide.background = getStyleBackground(style, index);
        
        // Skip icon/image for title and end slides 
        if (slide.type === 'content') {
            // Select icon based on style and position in presentation
            const iconFamily = iconSets[style] || iconSets.professional;
            const iconIndex = index % iconFamily.length;
            slide.icon = iconFamily[iconIndex];
            
            // Try to find a relevant image based on slide title
            const images = imageKeywords[style] || imageKeywords.professional;
            
            // Search for keywords in slide title
            let slideImage = null;
            const lowerTitle = slide.title.toLowerCase();
            
            Object.keys(images).forEach(keyword => {
                if (lowerTitle.includes(keyword)) {
                    slideImage = images[keyword];
                }
            });
            
            // If no specific match found, use a default based on index
            if (!slideImage) {
                const imageOptions = Object.values(images);
                slideImage = imageOptions[index % imageOptions.length];
            }
            
            slide.image = `images/${style}/${slideImage}.jpg`;
        }
        
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
        
        // Get gradient colors for this slide's background
        const gradientColors = parseGradient(slide.background);
        
        // Set background with gradient if available, otherwise use solid color
        if (gradientColors.length >= 2) {
            newSlide.background = { 
                color: gradientColors[0], // Fallback solid color
                gradient: {
                    type: 'linear',
                    color1: gradientColors[0],
                    color2: gradientColors[1],
                    angle: 135
                }
            };
        } else {
            newSlide.background = { color: '#2c3e50' };
        }
        
        // Add content based on slide type
        if (slide.type === 'title') {
            // Title slide with enhanced design elements
            
            // Add background shape for visual interest
            newSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                x: 0, y: 0, w: '100%', h: '100%',
                fill: { type: 'solid', color: '000000', alpha: 10 },
                line: { type: 'none' }
            });
            
            // Add title
            newSlide.addText(slide.title, { 
                x: 1, y: 1.5, w: '100%', h: 2, 
                fontSize: 50, 
                color: 'FFFFFF', 
                bold: true,
                align: 'center',
                shadow: { type: 'outer', angle: 45, blur: 5, color: '000000', opacity: 0.3 }
            });
            
            // Add subtitle with style
            newSlide.addText(slide.subtitle, { 
                x: 1, y: 3.8, w: '100%', h: 1, 
                fontSize: 28, 
                color: 'FFFFFF', 
                align: 'center',
                italic: true
            });
            
            // Add decorative element (line)
            newSlide.addShape(pptx.shapes.LINE, {
                x: 4, y: 3.5, w: 2, h: 0,
                line: { color: 'FFFFFF', width: 1 }
            });
            
            // Add generated by text
            newSlide.addText('Generated by AI PowerPoint Generator', { 
                x: 1, y: 5.5, w: '100%', h: 0.5, 
                fontSize: 14, 
                color: 'CCCCCC', 
                align: 'center'
            });
        } 
        else if (slide.type === 'content') {
            // Content slide with image and icon
            
            // Add slide title with accent bar
            newSlide.addText(slide.title, { 
                x: 0.5, y: 0.3, w: '70%', h: 0.8, 
                fontSize: 32, 
                color: 'FFFFFF', 
                bold: true
            });
            
            // Add accent bar next to title
            newSlide.addShape(pptx.shapes.RECTANGLE, {
                x: 0.5, y: 1.1, w: 2, h: 0.1,
                fill: { color: 'FFFFFF', alpha: 80 }
            });
            
            // Add icon if available using a placeholder box
            if (slide.icon) {
                newSlide.addText(`[${slide.icon}]`, { 
                    x: 8, y: 0.3, w: 1, h: 0.8, 
                    fontSize: 16, 
                    color: 'FFFFFF',
                    align: 'center',
                    fontFace: 'Font Awesome 5 Free'
                });
            }
            
            // Try to add image if provided (in actual implementation, would check if file exists)
            // Here we add a placeholder rectangle
            newSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                x: 7, y: 1.8, w: 2.5, h: 2,
                fill: { color: 'FFFFFF', alpha: 15 },
                line: { color: 'FFFFFF', width: 1, alpha: 30 },
                shadow: { type: 'outer', angle: 45, blur: 5, color: '000000', opacity: 0.3 }
            });
            
            // Add image placeholder text
            newSlide.addText(`Image: ${slide.title}`, { 
                x: 7, y: 2.4, w: 2.5, h: 0.8, 
                fontSize: 9, 
                color: 'FFFFFF',
                align: 'center',
                bold: false,
                italic: true
            });
            
            // Add bullet points with enhanced styling
            slide.content.forEach((point, i) => {
                newSlide.addText(point, { 
                    x: 0.7, y: 1.8 + (i * 0.7), w: '60%', h: 0.6, 
                    fontSize: 18, 
                    color: 'FFFFFF',
                    bullet: { type: 'bullet' },
                    shadow: { type: 'outer', angle: 45, blur: 3, color: '000000', opacity: 0.2 }
                });
            });
        } 
        else if (slide.type === 'end') {
            // Enhanced Thank you slide
            
            // Add decorative top shape
            newSlide.addShape(pptx.shapes.RECTANGLE, {
                x: 0, y: 0, w: '100%', h: 0.5,
                fill: { color: 'FFFFFF', alpha: 15 }
            });
            
            // Add decorative bottom shape
            newSlide.addShape(pptx.shapes.RECTANGLE, {
                x: 0, y: 5.5, w: '100%', h: 0.5,
                fill: { color: 'FFFFFF', alpha: 15 }
            });
            
            // Add centered circle behind text
            newSlide.addShape(pptx.shapes.OVAL, {
                x: 3.5, y: 1.5, w: 3, h: 3,
                fill: { color: 'FFFFFF', alpha: 10 },
                line: { color: 'FFFFFF', width: 2, alpha: 30 }
            });
            
            // Add title with emphasis
            newSlide.addText(slide.title, { 
                x: 1, y: 2, w: '100%', h: 2, 
                fontSize: 60, 
                color: 'FFFFFF', 
                bold: true,
                align: 'center',
                shadow: { type: 'outer', angle: 45, blur: 8, color: '000000', opacity: 0.3 }
            });
            
            // Add content with style
            newSlide.addText(slide.content, { 
                x: 1, y: 4, w: '100%', h: 1, 
                fontSize: 24, 
                color: 'FFFFFF', 
                align: 'center',
                italic: true
            });
            
            // Add contact information (optional)
            if (presentation.contactInfo) {
                newSlide.addText(presentation.contactInfo, { 
                    x: 1, y: 5, w: '100%', h: 0.5, 
                    fontSize: 14, 
                    color: 'CCCCCC', 
                    align: 'center'
                });
            }
        }
    });
    
    // Save the presentation
    pptx.writeFile({ fileName: `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx` });
}

/**
 * Helper function to parse gradient colors from CSS
 */
function parseGradient(gradientStr) {
    const colors = [];
    if (typeof gradientStr === 'string' && gradientStr.includes('linear-gradient')) {
        // Simple regex to extract colors
        const matches = gradientStr.match(/#[0-9a-f]{6}|rgba?\([^)]+\)/gi);
        if (matches && matches.length >= 2) {
            return matches;
        }
    }
    return ['#2c3e50', '#34495e']; // Default colors if parsing fails
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