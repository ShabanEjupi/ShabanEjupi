/**
 * PowerPoint Generator Chat Assistant
 */
document.addEventListener('DOMContentLoaded', function() {
    // Chat elements
    const chatAssistant = document.getElementById('chatAssistant');
    const chatToggle = document.getElementById('chatToggle');
    const chatBody = document.getElementById('chatBody');
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    
    if (!chatAssistant || !chatToggle || !chatBody) return;
    
    // Toggle chat visibility
    chatToggle.addEventListener('click', function() {
        chatBody.classList.toggle('hidden');
        if (!chatBody.classList.contains('hidden')) {
            chatInput.focus();
        }
    });
    
    // Chat header also toggles visibility
    document.querySelector('.chat-header').addEventListener('click', function(e) {
        // Don't toggle if clicking the toggle button (already handled)
        if (e.target !== chatToggle && !chatToggle.contains(e.target)) {
            chatBody.classList.toggle('hidden');
            if (!chatBody.classList.contains('hidden')) {
                chatInput.focus();
            }
        }
    });
    
    // Handle form submissions
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addChatMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        
        // Process the message and generate response
        processUserMessage(message);
    });
    
    // Add initial suggestions
    setTimeout(addSuggestions, 1000);
    
    /**
     * Add a message to the chat
     */
    function addChatMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        
        // Format message to handle simple markdown-like formatting
        let formattedMessage = message;
        formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
        
        contentElement.innerHTML = formattedMessage;
        messageElement.appendChild(contentElement);
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Add clickable suggestion chips
     */
    function addSuggestions() {
        // Create suggestions message
        const suggestionsElement = document.createElement('div');
        suggestionsElement.className = 'chat-message assistant';
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.innerHTML = 'Ju mund të pyesni për:';
        
        // Add suggestion chips
        const suggestions = [
            'Si të krijoj një prezantim efektiv?',
            'Çfarë stili të përdor për prezantim biznesi?',
            'Sugjero një temë interesante',
            'Sa slide duhet të përmbajë një prezantim?'
        ];
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('div');
            chip.className = 'suggestion';
            chip.textContent = suggestion;
            chip.addEventListener('click', function() {
                addChatMessage(suggestion, 'user');
                processUserMessage(suggestion);
            });
            
            contentElement.appendChild(chip);
        });
        
        suggestionsElement.appendChild(contentElement);
        chatMessages.appendChild(suggestionsElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Process user messages and generate responses
     */
    function processUserMessage(message) {
        // Simple response system based on keywords
        const lowerMessage = message.toLowerCase();
        let response = '';
        
        // Adding a short typing delay for a more natural feel
        setTimeout(() => {
            if (lowerMessage.includes('efektiv') || lowerMessage.includes('efektive')) {
                response = 'Për një prezantim efektiv:<br>1. **Përcakto qëllimin** qartë<br>2. **Kupto audiencën** tënde<br>3. Përdor **strukturë të qartë** (hyrje, pjesë kryesore, përfundim)<br>4. Përfshij **vizuale mbështetëse**<br>5. Përdor **shembuj konkretë**<br>6. Mbaj slide-t **të thjeshta dhe të qarta**';
            }
            else if (lowerMessage.includes('stili') || lowerMessage.includes('stil')) {
                response = 'Për prezantime biznesi, stili **Profesional** ose **Korporativ** janë më të përshtatshëm. Ato kanë ngjyra të përmbajtura dhe fokus në përmbajtje serioze. Nëse do diçka më formale, zgjidhni stilin Profesional; për prezantime strategjike, stili Korporativ ka një fokus më të madh në metrika dhe analiza.';
            }
            else if (lowerMessage.includes('tem')) {
                response = 'Ja disa tema interesante për prezantime:<br>1. **Transformimi Digjital në Industrinë Tuaj**<br>2. **Trendet e Tregut për 2025**<br>3. **Strategjitë e Qëndrueshmërisë dhe Ndikimi i Tyre**<br>4. **Inovacioni dhe Zhvillimi i Produkteve**<br>5. **Analizë e Konkurrencës dhe Pozicionimi**<br><br>Cila prej këtyre ju intereson më shumë?';
            }
            else if (lowerMessage.includes('sa slide') || lowerMessage.includes('numri i slide')) {
                response = 'Numri ideal i slide-ve varet nga kohëzgjatja e prezantimit tuaj. Një rregull i përafërt është:<br>- Prezantim 5 minuta: **5-7 slide**<br>- Prezantim 10 minuta: **10-12 slide**<br>- Prezantim 20 minuta: **15-20 slide**<br>- Prezantim 30 minuta: **20-25 slide**<br><br>Gjithmonë më mirë më pak slide me përmbajtje cilësore sesa shumë slide të mbushura me tekst të tepërt.';
            }
            else if (lowerMessage.includes('sugjero') || lowerMessage.includes('ide')) {
                response = 'Ja disa ide për prezantime:<br>1. **Shqyrtimi i Performancës Tremujore**<br>2. **Plani Strategjik 5-Vjeçar**<br>3. **Analiza e Tregut për Produkte të Reja**<br>4. **Hyrje në Inteligjencën Artificiale**<br>5. **Përmirësimi i Shërbimit ndaj Klientit**<br>6. **Strategjitë e Marketingut Digjital**';
            }
            else if (lowerMessage.includes('faleminderit') || lowerMessage.includes('flm')) {
                response = 'Më vjen mirë që mund t\'ju ndihmoj! Keni ndonjë pyetje tjetër për prezantimin tuaj?';
            }
            else if (lowerMessage.includes('si') && lowerMessage.includes('filloj')) {
                response = 'Për të filluar një prezantim të shkëlqyer:<br>1. **Përcaktoni temën dhe qëllimin** qartë<br>2. **Bëni një listë** të pikave kryesore që doni të përcillni<br>3. **Strukturoni përmbajtjen** në hyrje, pjesë kryesore dhe përfundim<br>4. **Plotësoni formularin** në këtë faqe me temën, numrin e slide-ve dhe llojin e prezantimit<br>5. **Rishikoni dhe përshtatni** përmbajtjen e gjeneruar';
            }
            else if (lowerMessage.includes('imazhe')) {
                response = 'Sistemi ynë tani gjeneron automatikisht imazhe relevante për çdo slide bazuar në përmbajtjen dhe stilin e prezantimit! Imazhet zgjidhen duke përdorur përshkrime të gjeneruara nga AI për të gjetur fotografi që përshtaten me temën e çdo slide.';
            }
            else {
                response = 'Për të krijuar një prezantim të personalizuar:<br>1. **Zgjidhni një temë** të qartë<br>2. **Përcaktoni numrin e slide-ve** që ju nevojiten (zakonisht 5-10)<br>3. **Zgjidhni stilin** që përshtatet me qëllimin tuaj (Profesional, Kreativ, Minimalist, etj.)<br>4. **Shtoni detaje specifike** në seksionin e shënimeve shtesë<br>5. Klikoni **Gjenero Prezantim** dhe do të krijojmë sllajdet për ju!';
            }
            
            addChatMessage(response, 'assistant');
            
            // Add follow-up suggestions
            if (!lowerMessage.includes('faleminderit')) {
                setTimeout(function() {
                    const followUpSuggestions = document.createElement('div');
                    followUpSuggestions.className = 'chat-message assistant';
                    
                    const followContent = document.createElement('div');
                    followContent.className = 'message-content';
                    
                    // Different follow-up suggestions based on the context
                    const suggestions = [];
                    if (lowerMessage.includes('stili')) {
                        suggestions.push('Si ndryshojnë stilet?', 'Çfarë është stili Minimalist?');
                    } else if (lowerMessage.includes('tem')) {
                        suggestions.push('Si të strukturoj këtë temë?', 'Sa slide duhet të përdor?');
                    } else if (lowerMessage.includes('slide')) {
                        suggestions.push('Si të ndaj përmbajtjen?', 'Çfarë stili të përdor?');
                    } else {
                        suggestions.push('Si të krijoj një prezantim efektiv?', 'Sugjero një temë interesante');
                    }
                    
                    followContent.innerHTML = 'Dëshironi të dini më shumë për:';
                    
                    suggestions.forEach(suggestion => {
                        const chip = document.createElement('div');
                        chip.className = 'suggestion';
                        chip.textContent = suggestion;
                        chip.addEventListener('click', function() {
                            addChatMessage(suggestion, 'user');
                            processUserMessage(suggestion);
                        });
                        
                        followContent.appendChild(chip);
                    });
                    
                    followUpSuggestions.appendChild(followContent);
                    chatMessages.appendChild(followUpSuggestions);
                    
                    // Scroll to bottom
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
            }
        }, 800); // Delay to simulate typing
    }
});