document.addEventListener('DOMContentLoaded', function() {
    // ===== CORE FUNCTIONALITY =====
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
    
    switch(command) {
        case 'help':
            response.innerHTML = `
                <div class="terminal-line">Available commands:</div>
                <div class="terminal-line">- <span class="keyword">help</span>: Show this help menu</div>
                <div class="terminal-line">- <span class="keyword">about</span>: Learn about me</div>
                <div class="terminal-line">- <span class="keyword">skills</span>: View my technical skills</div>
                <div class="terminal-line">- <span class="keyword">contact</span>: Get my contact information</div>
                <div class="terminal-line">- <span class="keyword">projects</span>: List my projects</div>
                <div class="terminal-line">- <span class="keyword">clear</span>: Clear the terminal</div>
            `;
            break;
            
        case 'about':
            response.innerHTML = `
                <div class="terminal-line"><span class="function">whoami</span></div>
                <div class="terminal-line">I'm a software developer from Kosovo with experience in</div>
                <div class="terminal-line">developing apps and systems that solve real-world problems.</div>
                <div class="terminal-line">Currently studying Computer Science at University "Hasan Prishtina" in Prishtina.</div>
            `;
            break;
            
        case 'skills':
            response.innerHTML = `
                <div class="terminal-line"><span class="variable">Programming:</span> Java, JavaScript, Python, C#, PHP</div>
                <div class="terminal-line"><span class="variable">Frameworks:</span> React, Node.js, Flutter, Laravel, Express</div>
                <div class="terminal-line"><span class="variable">Databases:</span> PostgreSQL, MongoDB, MySQL, Firebase</div>
                <div class="terminal-line"><span class="variable">Tools:</span> Git, Docker, AWS, REST APIs</div>
            `;
            break;
            
        case 'contact':
            response.innerHTML = `
                <div class="terminal-line"><span class="string">Email:</span> shaban.ejupi@student.uni-pr.edu</div>
                <div class="terminal-line"><span class="string">Phone:</span> (+383) 45 601 379</div>
                <div class="terminal-line"><span class="string">Location:</span> Podujevë, Kosovo</div>
                <div class="terminal-line"><span class="string">LinkedIn:</span> https://www.linkedin.com/in/shaban-ejupi-406b94214/</div>
                <div class="terminal-line"><span class="string">GitHub:</span> https://github.com/ShabanEjupi/</div>
            `;
            break;
            
        case 'projects':
            response.innerHTML = `
                <div class="terminal-line"><span class="function">1.</span> <span class="keyword">EtinUP Platform:</span> Platform for education and innovation</div>
                <div class="terminal-line"><span class="function">2.</span> <span class="keyword">Prizren Park App:</span> Smart parking application</div>
                <div class="terminal-line"><span class="function">3.</span> <span class="keyword">E-commerce website:</span> Online shop with MVC architecture</div>
                <div class="terminal-line"><span class="function">4.</span> <span class="keyword">KoreaDrive KS:</span> Car dealership website</div>
                <div class="terminal-line"><span class="function">5.</span> <span class="keyword">Violeta Hasani Portfolio:</span> Personal portfolio website</div>
                <div class="terminal-line"><span class="function">6.</span> <span class="keyword">AI Image Generation:</span> Generate images with AI models</div>
                <div class="terminal-line"><span class="function">7.</span> <span class="keyword">AI Chatbot:</span> Intelligent conversational assistant</div>
            `;
            break;
            
        case 'clear':
            output.innerHTML = '';
            return;
            
        default:
            response.innerHTML = `<div class="terminal-line"><span class="comment">Command not found: ${command}. Type 'help' for available commands.</span></div>`;
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
    // Pre-fill the subject field with CV request
    const subjectField = document.getElementById('subject');
    if (subjectField) {
        subjectField.value = "CV Request";
    }
    
    // Pre-fill the message field
    const messageField = document.getElementById('message');
    if (messageField) {
        messageField.value = "Hello Shaban,\n\nI'm interested in your professional experience and would like to request a copy of your CV.\n\nThank you.";
    }
    
    // Focus the contact form
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showNotification('info', 'Please complete the contact form to request my CV.');
}