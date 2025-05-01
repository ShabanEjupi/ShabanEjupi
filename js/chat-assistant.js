/**
 * PowerPoint Generator Chat Assistant
 * Përmirësuar me API inteligjence për përgjigje më të mira
 */
document.addEventListener('DOMContentLoaded', function() {
    // Chat elements
    const chatAssistant = document.getElementById('chatAssistant');
    const chatToggle = document.getElementById('chatToggle');
    const chatBody = document.getElementById('chatBody');
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    
    // Mënyra e funksionimit (local ose API)
    const useAPI = true; // Ndryshoje në false për të përdorur lokal
    
    // Ruaj historikun e bisedës për kontekst
    let conversationHistory = [{
        role: "system", 
        content: "Ti je një asistent ekspert për gjenerimin e prezantimeve PowerPoint. " +
                 "Ndihmo përdoruesit me ide për tema prezantimesh, këshilla për struktura, dhe sugjerime " +
                 "për përmbajtjen e slajdeve. Gjithashtu ndihmo me zgjedhjen e stileve të prezantimit që u përshtaten qëllimeve " +
                 "të tyre specifike. Përgjigju në gjuhën shqipe."
    }, {
        role: "assistant",
        content: "Përshëndetje! Jam asistenti i prezantimeve dhe mund t'ju ndihmoj të krijoni prezantime të shkëlqyera. Çfarë lloj prezantimi dëshironi të krijoni?"
    }];
    
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
        
        // Add to conversation history
        conversationHistory.push({
            role: "user",
            content: message
        });
        
        // Clear input
        chatInput.value = '';
        
        // Show typing indicator
        addTypingIndicator();
        
        // Process message based on mode
        if (useAPI) {
            processWithAPI(message);
        } else {
            // Fallback to local processing after delay
            setTimeout(() => {
                processLocalMessage(message);
            }, 800);
        }
    });
    
    // Add initial suggestions
    setTimeout(addSuggestions, 1000);
    
    /**
     * Process messages with AI API
     */
    async function processWithAPI(message) {
        try {
            const response = await fetch('/api/chat-assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    messages: conversationHistory
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // If got a response, display it
            if (data && data.response) {
                // Add AI response to conversation history
                conversationHistory.push({
                    role: "assistant",
                    content: data.response
                });
                
                // Display the response
                addChatMessage(data.response, 'assistant');
                
                // Add relevant follow-up questions
                if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                    setTimeout(() => {
                        addSuggestionChips(data.suggestions);
                    }, 1000);
                }
            } else {
                // Fallback if API response format is unexpected
                processLocalMessage(message);
            }
        } catch (error) {
            console.error('Error calling chat API:', error);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Fallback to local processing in case of error
            processLocalMessage(message);
        }
    }
    
    /**
     * Process messages locally (fallback)
     */
    function processLocalMessage(message) {
        // Simple response system based on keywords (same as before)
        const lowerMessage = message.toLowerCase();
        let response = '';
        
        // Remove typing indicator
        removeTypingIndicator();
            
        if (lowerMessage.includes('tema') || lowerMessage.includes('ide') || lowerMessage.includes('sugjer')) {
            response = `Ja disa tema inteligjente për prezantime:
            
1. **Inteligjenca Artificiale në Shërbimin e Klientit**
2. **Qytetet e Mençura: E Ardhmja e Urbanizmit**
3. **Ekonomia Digjitale dhe Kriptovalutat**
4. **Shëndetësia e Personalizuar: Mjekësia e Precizionit**
5. **Ndryshimet Klimatike dhe Inovacionet e Gjelbra**
6. **Industria 4.0 dhe Automatizimi**
7. **Siguria Kibernetike për Biznese**
8. **Lidershipi në Epokën Digjitale**
9. **Realiteti i Shtuar në Edukim**
10. **Algoritmet dhe Etika e Teknologjisë**

Cila nga këto tema do t'ju interesonte më shumë?`;
        }
        else if (lowerMessage.includes('efektiv') || lowerMessage.includes('efektive')) {
            response = 'Për një prezantim efektiv:<br>1. **Përcakto qëllimin** qartë<br>2. **Kupto audiencën** tënde<br>3. Përdor **strukturë të qartë** (hyrje, pjesë kryesore, përfundim)<br>4. Përfshij **vizuale mbështetëse**<br>5. Përdor **shembuj konkretë**<br>6. Mbaj slide-t **të thjeshta dhe të qarta**';
        }
        else if (lowerMessage.includes('stili') || lowerMessage.includes('stil')) {
            response = 'Për prezantime biznesi, stili **Profesional** ose **Korporativ** janë më të përshtatshëm. Ato kanë ngjyra të përmbajtura dhe fokus në përmbajtje serioze. Nëse do diçka më formale, zgjidhni stilin Profesional; për prezantime strategjike, stili Korporativ ka një fokus më të madh në metrika dhe analiza.';
        }
        else if (lowerMessage.includes('inteligjenc') && lowerMessage.includes('artificial')) {
            response = `**Inteligjenca Artificiale në Shërbimin e Klientit** është një temë aktuale që përfshin:

1. Roli i chatbotëve dhe asistentëve virtual
2. Personalizimi i përvojës së klientit përmes AI
3. Analitika parashikuese për nevojat e klientëve
4. Automatizimi i proceseve të shërbimit
5. Zgjidhja e shpejtë e problemeve me ndihmën e AI
6. Sfidat etike të përdorimit të AI në shërbime
7. Raste studimore të suksesshme të implementimit

Dëshironi të krijoni një prezantim për këtë temë?`;
        }
        else if (lowerMessage.includes('sa slide') || lowerMessage.includes('numri i slide')) {
            response = 'Numri ideal i slide-ve varet nga kohëzgjatja e prezantimit tuaj. Një rregull i përafërt është:<br>- Prezantim 5 minuta: **5-7 slide**<br>- Prezantim 10 minuta: **10-12 slide**<br>- Prezantim 20 minuta: **15-20 slide**<br>- Prezantim 30 minuta: **20-25 slide**<br><br>Gjithmonë më mirë më pak slide me përmbajtje cilësore sesa shumë slide të mbushura me tekst të tepërt.';
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
        
        // Add to conversation history
        conversationHistory.push({
            role: "assistant",
            content: response
        });
        
        // Display the response
        addChatMessage(response, 'assistant');
        
        // Add follow-up suggestions after delay
        setTimeout(function() {
            if (lowerMessage.includes('tema') || lowerMessage.includes('ide')) {
                addSuggestionChips([
                    'Më trego më shumë për Inteligjencën Artificiale',
                    'Si të strukturoj një prezantim për Qytetet e Mençura?',
                    'Sa slide nevojiten për temën e Ekonomisë Digjitale?'
                ]);
            } else if (lowerMessage.includes('stili')) {
                addSuggestionChips([
                    'Çfarë ka të veçantë stili Minimalist?',
                    'Cili stil është më i mirë për prezantime teknike?',
                    'Si të kombinoj stilet për më shumë impakt?'
                ]);
            } else if (lowerMessage.includes('inteligjenc')) {
                addSuggestionChips([
                    'Gjenero një strukturë prezantimi për këtë temë',
                    'Cilat janë trendet aktuale në AI?',
                    'Çfarë stili përdoret më shumë për prezantime teknologjike?'
                ]);
            } else if (lowerMessage.includes('slide')) {
                addSuggestionChips([
                    'Si ta ndaj përmbajtjen në slide?',
                    'A duhet të përfshij animacione?',
                    'Çfarë stili duhet të përdor?'
                ]);
            } else {
                addSuggestionChips([
                    'Sugjero një temë interesante',
                    'Si të krijoj një prezantim efektiv?',
                    'Cilat janë funksionet më të reja të gjeneratorit?'
                ]);
            }
        }, 1000);
    }
    
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
        formattedMessage = formattedMessage.replace(/\n/g, '<br>'); // Line breaks
        
        contentElement.innerHTML = formattedMessage;
        messageElement.appendChild(contentElement);
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Add typing indicator
     */
    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'chat-message assistant typing-indicator';
        indicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Remove typing indicator
     */
    function removeTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
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
            'Sugjero disa tema për prezantime',
            'Sa slide duhet të përmbajë një prezantim?'
        ];
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('div');
            chip.className = 'suggestion';
            chip.textContent = suggestion;
            chip.addEventListener('click', function() {
                addChatMessage(suggestion, 'user');
                
                // Add to conversation history
                conversationHistory.push({
                    role: "user",
                    content: suggestion
                });
                
                // Show typing indicator
                addTypingIndicator();
                
                // Process message based on mode
                if (useAPI) {
                    processWithAPI(suggestion);
                } else {
                    // Fallback to local processing after delay
                    setTimeout(() => {
                        processLocalMessage(suggestion);
                    }, 800);
                }
            });
            
            contentElement.appendChild(chip);
        });
        
        suggestionsElement.appendChild(contentElement);
        chatMessages.appendChild(suggestionsElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Add dynamic suggestion chips
     */
    function addSuggestionChips(suggestions) {
        if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) return;
        
        const followUpSuggestions = document.createElement('div');
        followUpSuggestions.className = 'chat-message assistant';
        
        const followContent = document.createElement('div');
        followContent.className = 'message-content';
        followContent.innerHTML = 'Dëshironi të dini më shumë për:';
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('div');
            chip.className = 'suggestion';
            chip.textContent = suggestion;
            chip.addEventListener('click', function() {
                addChatMessage(suggestion, 'user');
                
                // Add to conversation history
                conversationHistory.push({
                    role: "user",
                    content: suggestion
                });
                
                // Show typing indicator
                addTypingIndicator();
                
                // Process message based on mode
                if (useAPI) {
                    processWithAPI(suggestion);
                } else {
                    // Fallback to local processing after delay
                    setTimeout(() => {
                        processLocalMessage(suggestion);
                    }, 800);
                }
            });
            
            followContent.appendChild(chip);
        });
        
        followUpSuggestions.appendChild(followContent);
        chatMessages.appendChild(followUpSuggestions);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});