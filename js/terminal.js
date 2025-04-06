// Interactive Terminal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.querySelector('.terminal-output');
    
    if (!terminalInput || !terminalOutput) return;
    
    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();
            
            // Add the command to the output
            const commandLine = document.createElement('div');
            commandLine.className = 'terminal-line';
            commandLine.innerHTML = `<span class="prompt">shaban@visitor:~$</span> ${command}`;
            terminalOutput.appendChild(commandLine);
            
            // Process the command
            processCommand(command);
            
            // Clear the input
            terminalInput.value = '';
            
            // Scroll to the bottom
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    });
    
    function processCommand(command) {
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
                terminalOutput.innerHTML = '';
                return;
                
            default:
                response.innerHTML = `<div class="terminal-line"><span class="comment">Command not found: ${command}. Type 'help' for available commands.</span></div>`;
        }
        
        terminalOutput.appendChild(response);
    }
});