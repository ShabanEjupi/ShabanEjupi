document.addEventListener('DOMContentLoaded', function() {
    // Force scroll to top on page load
    window.scrollTo(0, 0);
    
    // Prevent auto-focus on terminal input when page loads
    const terminalInput = document.getElementById('terminalInput');
    if (terminalInput) {
        terminalInput.removeAttribute('autofocus');
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('show');
        menuToggle.classList.toggle('active');
    });

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav ul li a, .footer-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Close mobile menu if open
                    if (nav.classList.contains('show')) {
                        nav.classList.remove('show');
                        menuToggle.classList.remove('active');
                    }
                    
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
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Contact form handling
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
                alert('Please fill in all fields');
                return;
            }
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Here you would normally send the form data to a server
            // For demonstration, we'll just show a success message
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Add animation for project cards
    const projectCards = document.querySelectorAll('.project-card');
    const observerOptions = {
        threshold: 0.3,
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

    // Matrix animation
    const canvas = document.getElementById('matrix');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Reduce animation framerate
    const FPS = 15;
    let lastFrameTime = 0;
    
    // Reduce density of drops
    const fontSize = 10;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const columns = Math.floor(canvas.width / fontSize) / 2; // Half as many columns
    
    const drops = [];
    for(let i = 0; i < columns; i++) {
        drops[i] = 1;
    }
    
    function draw(currentTime) {
        // Only render if enough time has passed (fps limiting)
        if (currentTime - lastFrameTime < 1000 / FPS) {
            requestAnimationFrame(draw);
            return;
        }
        
        lastFrameTime = currentTime;
        
        // More transparent background = less redrawing
        ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0f0';
        ctx.font = fontSize + 'px monospace';
        
        for(let i = 0; i < drops.length; i++) {
            // Draw only half the characters
            if (i % 2 === 0) {
                const text = String.fromCharCode(Math.floor(Math.random() * 128));
                ctx.fillText(text, i * fontSize * 2, drops[i] * fontSize);
            }
            
            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
        
        requestAnimationFrame(draw);
    }
    
    // Stop animation when tab is not visible to save resources
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            cancelAnimationFrame(draw);
        } else {
            requestAnimationFrame(draw);
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
    
    requestAnimationFrame(draw);
});

function requestCV() {
    // Pre-fill the subject field with CV request
    const subjectField = document.getElementById('subject');
    if (subjectField) {
        subjectField.value = "CV Request";
    }
    
    // Pre-fill the message field with a professional request
    const messageField = document.getElementById('message');
    if (messageField) {
        messageField.value = "Hello Shaban,\n\nI'm interested in your professional experience and would like to request a copy of your CV.\n\nThank you.";
    }
    
    // Optionally show a tooltip
    alert("Please complete the contact form to request my CV.");
}