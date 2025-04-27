// Define the currentLanguage at the top of the file
let currentLanguage = 'sq'; // Default language

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language switcher FIRST - before anything else
    initLanguageSwitcher();
    
    // Force scroll to top on page load
    window.scrollTo(0, 0);
    
    // Initialize navigation
    initNavigation();
    
    // Initialize matrix background with reduced performance impact
    initMatrix();
    
    // Initialize terminal if exists
    initTerminal();
    
    // Initialize form handling
    initContactForm();
    
    // Add animation for project cards (using Intersection Observer for performance)
    initProjectAnimations();
});

// ===== LANGUAGE SWITCHER FUNCTIONS =====
function initLanguageSwitcher() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    if (langParam && (langParam === 'en' || langParam === 'sq')) {
        currentLanguage = langParam;
        localStorage.setItem('language', langParam);
    } else {
        currentLanguage = localStorage.getItem('language') || 'sq';
    }

    updateLanguageUI();
    updateContent();
    setupLanguageOptions();
    updatePageLinks();
}

function setupLanguageOptions() {
    const langOptions = document.querySelectorAll('.lang-option');

    langOptions.forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            localStorage.setItem('languageManuallySet', 'true');
        });
    });
}

function updatePageLinks() {
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');

        // Skip links that are null, anchors, or already have lang parameter
        if (!href || href.startsWith('#') || href.includes('?lang=')) {
            return;
        }

        // Only modify HTML page links
        if (href.includes('.html')) {
            link.setAttribute('href', `${href}?lang=${currentLanguage}`);
        }
    });
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Update URL with language parameter (for SEO)
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
    
    // Update UI
    updateLanguageUI();
    
    // Update content
    updateContent();
    
    // Update links to preserve language
    updatePageLinks();
    
    // Dispatch an event for language change
    const event = new Event('languageChanged');
    document.dispatchEvent(event);
}

function updateLanguageUI() {
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        if (option.getAttribute('data-lang') === currentLanguage) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
            
            // Update document title if this is the title element
            if (element.tagName === 'TITLE') {
                document.title = translations[currentLanguage][key];
            }
        }
    });
    
    // Also update the title directly in case the querySelector doesn't catch it
    const titleElement = document.querySelector('title');
    if (titleElement) {
        const titleKey = titleElement.getAttribute('data-i18n');
        if (titleKey && translations[currentLanguage][titleKey]) {
            document.title = translations[currentLanguage][titleKey];
        }
    }
}

// ===== NAVIGATION FUNCTIONS =====
function initNavigation() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('show');
            menuToggle.classList.toggle('active');
        });
    }

    // Header scroll effect
    const header = document.querySelector('header');
    if (header) {
        // Throttle scroll events for better performance
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            lastScrollY = window.scrollY;
            
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    if (lastScrollY > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                
                ticking = true;
            }
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav ul li a, .footer-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') && this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Close mobile menu if open
                    if (nav && nav.classList.contains('show')) {
                        nav.classList.remove('show');
                        if (menuToggle) menuToggle.classList.remove('active');
                    }
                    
                    // Smooth scroll
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Update active navigation link
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });

    // Active menu indicator based on scroll position
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        // Optimize scroll handling with requestAnimationFrame
        let lastScrollPosition = 0;
        let scrollTicking = false;
        
        window.addEventListener('scroll', function() {
            lastScrollPosition = window.scrollY;
            
            if (!scrollTicking) {
                window.requestAnimationFrame(function() {
                    updateActiveNav(lastScrollPosition, sections, navLinks);
                    scrollTicking = false;
                });
                
                scrollTicking = true;
            }
        });
    }
}

function updateActiveNav(scrollPos, sections, navLinks) {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPos >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===== MATRIX ANIMATION (OPTIMIZED) =====
function initMatrix() {
    const canvas = document.getElementById('matrix');
    if (!canvas) return;
    
    // Don't run matrix animation on mobile devices
    if (window.innerWidth < 768) {
        canvas.style.display = 'none';
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Performance optimizations
    const FPS = 10; // Lower FPS for better performance
    let lastFrameTime = 0;
    
    // Reduce density of characters
    const fontSize = 10;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Even fewer columns for better performance
    const columns = Math.floor(canvas.width / fontSize) / 3; 
    
    const drops = [];
    for(let i = 0; i < columns; i++) {
        drops[i] = 1;
    }
    
    // Limit the character set to improve performance
    const chars = '01';
    const charArray = chars.split('');
    
    function draw(currentTime) {
        // Only render if enough time has passed (fps limiting)
        if (currentTime - lastFrameTime < 1000 / FPS) {
            requestAnimationFrame(draw);
            return;
        }
        
        lastFrameTime = currentTime;
        
        // More transparent background = less redrawing
        ctx.fillStyle = 'rgba(0, 0, 0, 0.01)'; // More transparent
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0f0';
        ctx.font = fontSize + 'px monospace';
        
        // Draw fewer characters
        for(let i = 0; i < drops.length; i++) {
            // Draw only 1/3 of the characters each frame
            if (i % 3 === 0) {
                const text = charArray[Math.floor(Math.random() * charArray.length)];
                ctx.fillText(text, i * fontSize * 3, drops[i] * fontSize);
            
                if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                
                drops[i]++;
            }
        }
        
        requestAnimationFrame(draw);
    }
    
    // Stop animation when tab is not visible
    let animationFrame;
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            animationFrame = requestAnimationFrame(draw);
        }
    });
    
    // Throttle resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }, 200);
    });
    
    // Start animation
    animationFrame = requestAnimationFrame(draw);
}

// ===== TERMINAL FUNCTIONALITY =====
function initTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.querySelector('.terminal-output');
    
    if (!terminalInput || !terminalOutput) return;
    
    // Prevent auto-focus on terminal input when page loads
    terminalInput.removeAttribute('autofocus');
    
    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();
            
            // Add the command to the output
            const commandLine = document.createElement('div');
            commandLine.className = 'terminal-line';
            commandLine.innerHTML = `<span class="prompt">shaban@visitor:~$</span> ${command}`;
            terminalOutput.appendChild(commandLine);
            
            // Process the command
            processCommand(command, terminalOutput);
            
            // Clear the input
            terminalInput.value = '';
            
            // Scroll to the bottom
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    });
}

function processCommand(command, output) {
    const response = document.createElement('div');
    response.className = 'command-response';
    
    // Always accept these commands in both languages
    const universalCommands = {
        'help': 'help',
        'about': 'about',
        'skills': 'skills',
        'contact': 'contact',
        'projects': 'projects',
        'clear': 'clear'
    };
    
    // Convert command to lowercase for case-insensitive matching
    const lowerCommand = command.toLowerCase();
    
    // Determine which command to execute
    let commandToExecute = lowerCommand;
    
    // First check if it's one of our universal commands
    if (universalCommands[lowerCommand]) {
        commandToExecute = lowerCommand;
    }
    
    switch(commandToExecute) {
        case 'help':
            response.innerHTML = `
                <div class="terminal-line">${translations[currentLanguage]['terminal.welcome']}</div>
                <div class="terminal-line">- <span class="keyword">help</span>: ${translations[currentLanguage]['terminal.cmd.help.desc']}</div>
                <div class="terminal-line">- <span class="keyword">about</span>: ${translations[currentLanguage]['terminal.cmd.about.desc']}</div>
                <div class="terminal-line">- <span class="keyword">skills</span>: ${translations[currentLanguage]['terminal.cmd.skills.desc']}</div>
                <div class="terminal-line">- <span class="keyword">contact</span>: ${translations[currentLanguage]['terminal.cmd.contact.desc']}</div>
                <div class="terminal-line">- <span class="keyword">projects</span>: ${translations[currentLanguage]['terminal.cmd.projects.desc']}</div>
                <div class="terminal-line">- <span class="keyword">clear</span>: ${translations[currentLanguage]['terminal.cmd.clear.desc']}</div>
            `;
            break;
            
        case 'about':
            response.innerHTML = `
                <div class="terminal-line"><span class="function">whoami</span></div>
                <div class="terminal-line">${translations[currentLanguage]['about.description1']}</div>
                <div class="terminal-line">${translations[currentLanguage]['about.description2']}</div>
                <div class="terminal-line">${translations[currentLanguage]['about.description3']}</div>
            `;
            break;
            
        case 'skills':
            response.innerHTML = `
                <div class="terminal-line"><span class="function">${translations[currentLanguage]['skills.title']}</span></div>
                <div class="terminal-line"><span class="keyword">${translations[currentLanguage]['skills.languages']}:</span> Java, JavaScript, Python, Dart, PHP</div>
                <div class="terminal-line"><span class="keyword">${translations[currentLanguage]['skills.frameworks']}:</span> React, Node.js, Flutter, Laravel, Express</div>
                <div class="terminal-line"><span class="keyword">${translations[currentLanguage]['skills.databases']}:</span> PostgreSQL, MongoDB, MySQL, Firebase, SQL Server</div>
                <div class="terminal-line"><span class="keyword">${translations[currentLanguage]['skills.tools']}:</span> Git, Docker, REST APIs, GitHub, AWS</div>
            `;
            break;
            
        case 'contact':
            response.innerHTML = `
                <div class="terminal-line"><span class="function">${translations[currentLanguage]['contact.title']}</span></div>
                <div class="terminal-line"><span class="keyword">Email:</span> shaban.ejupi@student.uni-pr.edu</div>
                <div class="terminal-line"><span class="keyword">${translations[currentLanguage]['contact.form.phone'] || 'Phone'}:</span> (+383) 45 601 379</div>
                <div class="terminal-line"><span class="keyword">${translations[currentLanguage]['contact.form.location'] || 'Location'}:</span> Podujevë, Kosovo</div>
                <div class="terminal-line"><span class="keyword">LinkedIn:</span> linkedin.com/in/shaban-ejupi-406b94214/</div>
                <div class="terminal-line"><span class="keyword">GitHub:</span> github.com/ShabanEjupi/</div>
            `;
            break;
            
        case 'projects':
            response.innerHTML = `
                <div class="terminal-line"><span class="function">${translations[currentLanguage]['projects.title']}</span></div>
                <div class="terminal-line">1. <span class="keyword">${translations[currentLanguage]['projects.koreadrive.title']}</span> - ${translations[currentLanguage]['projects.koreadrive.description']}</div>
                <div class="terminal-line">2. <span class="keyword">${translations[currentLanguage]['projects.violeta.title']}</span> - ${translations[currentLanguage]['projects.violeta.description']}</div>
                <div class="terminal-line">3. <span class="keyword">${translations[currentLanguage]['projects.aigen.title']}</span> - ${translations[currentLanguage]['projects.aigen.description']}</div>
                <div class="terminal-line">4. <span class="keyword">${translations[currentLanguage]['projects.chatbot.title']}</span> - ${translations[currentLanguage]['projects.chatbot.description']}</div>
                <div class="terminal-line">5. <span class="keyword">${translations[currentLanguage]['projects.etinup.title']}</span> - ${translations[currentLanguage]['projects.etinup.description']}</div>
            `;
            break;
            
        case 'clear':
            output.innerHTML = '';
            return;
            
        default:
            response.innerHTML = `<div class="terminal-line"><span class="comment">${translations[currentLanguage]['terminal.cmd.notfound'] || 'Command not found:'} ${command}. ${translations[currentLanguage]['terminal.cmd.tryhelp'] || "Type 'help' for available commands."}</span></div>`;
    }
    
    output.appendChild(response);
}

// ===== CONTACT FORM =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !subject || !message) {
                showNotification('error', 'Please fill in all fields');
                return;
            }
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('error', 'Please enter a valid email address');
                return;
            }
            
            // Show loading indicator
            const submitButton = contactForm.querySelector('button[type="submit"]');
            if (!submitButton) return;
            
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            
            // Collect form data
            const formData = { name, email, subject, message };
            
            // Send data to your serverless function
            fetch('/.netlify/functions/contact', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                // Show success message
                if (data.success) {
                    showNotification('success', 'Message sent successfully! I will get back to you soon.');
                    contactForm.reset();
                } else {
                    showNotification('error', data.message || 'Failed to send message. Please try again.');
                }
            })
            .catch(error => {
                showNotification('error', 'An error occurred. Please try again later.');
                console.error('Error:', error);
            })
            .finally(() => {
                // Restore button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
}

// ===== PROJECT ANIMATIONS =====
function initProjectAnimations() {
    const projectCards = document.querySelectorAll('.project-card');
    if (!projectCards.length) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    projectCards.forEach(card => {
        observer.observe(card);
    });
}

// ===== UTILITY FUNCTIONS =====
function showNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);
}

function requestCV() {
    // Get current language
    const lang = currentLanguage || 'en';
    
    // Pre-fill the subject field with CV request
    const subjectField = document.getElementById('subject');
    if (subjectField) {
        subjectField.value = translations[lang]['cv.request.subject'] || "CV Request";
    }
    
    // Pre-fill the message field
    const messageField = document.getElementById('message');
    if (messageField) {
        messageField.value = translations[lang]['cv.request.message'] || 
            "Hello Shaban,\n\nI'm interested in your professional experience and would like to request a copy of your CV.\n\nThank you.";
    }
    
    // Focus the contact form
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    const notificationMessage = translations[lang]['notification.cv.request'] || 
        "Please complete the contact form to request my CV.";
    showNotification('info', notificationMessage);
}