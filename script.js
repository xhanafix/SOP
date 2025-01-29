class SOPGenerator {
    constructor() {
        this.form = document.getElementById('sopForm');
        this.taskInput = document.getElementById('taskInput');
        this.outputSection = document.getElementById('outputSection');
        this.sopContent = document.getElementById('sopContent');
        this.copyBtn = document.getElementById('copyBtn');
        this.printBtn = document.getElementById('printBtn');
        this.apiForm = document.getElementById('apiForm');
        this.apiKeyInput = document.getElementById('apiKey');
        this.resetApiBtn = document.getElementById('resetApiBtn');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.loadingText = document.getElementById('loadingText');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.elapsedTimeEl = document.getElementById('elapsedTime');
        this.remainingTimeEl = document.getElementById('remainingTime');
        this.estimatedTotalTime = 30; // estimated seconds for completion
        this.wittyMessages = [
            "Brewing the perfect SOP... ☕",
            "Teaching AI to write procedures... 📚",
            "Organizing chaos into steps... 🎯",
            "Making bureaucracy fun... 🎪",
            "Turning coffee into SOPs... ⚡",
            "Adding a pinch of best practices... 🧂",
            "Sprinkling some organization magic... ✨",
            "Consulting the procedure gods... 🙏",
            "Translating human tasks to robot language... 🤖",
            "Making sure every step is step-shaped... 📐"
        ];
        
        // Check for stored API key
        const storedApiKey = localStorage.getItem('openRouterApiKey');
        if (storedApiKey) {
            this.apiKeyInput.value = storedApiKey;
        }
        
        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Add share button references
        this.shareButtons = {
            facebook: document.querySelector('.share-btn.facebook'),
            twitter: document.querySelector('.share-btn.twitter'),
            whatsapp: document.querySelector('.share-btn.whatsapp'),
            telegram: document.querySelector('.share-btn.telegram')
        };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.printBtn.addEventListener('click', () => this.printSOP());
        this.apiForm.addEventListener('submit', (e) => this.handleApiKeySave(e));
        this.resetApiBtn.addEventListener('click', () => this.resetApiKey());
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        
        // Add share button event listeners
        Object.entries(this.shareButtons).forEach(([platform, button]) => {
            if (button) {
                button.addEventListener('click', () => {
                    console.log(`Sharing to ${platform}`);
                    this.shareToSocial(platform);
                });
            }
        });
    }

    handleApiKeySave(e) {
        e.preventDefault();
        const apiKey = this.apiKeyInput.value.trim();
        
        if (!apiKey) {
            alert('Please enter an API key');
            return;
        }

        localStorage.setItem('openRouterApiKey', apiKey);
        alert('API key saved successfully!');
    }

    resetApiKey() {
        localStorage.removeItem('openRouterApiKey');
        this.apiKeyInput.value = '';
        alert('API key has been reset');
    }

    async handleSubmit(e) {
        e.preventDefault();
        const task = this.taskInput.value.trim();
        
        if (!task) {
            alert('Please enter a task or objective');
            return;
        }

        if (!localStorage.getItem('openRouterApiKey')) {
            alert('Please save your API key first');
            return;
        }

        this.showLoading();
        try {
            this.startTimer();
            await this.simulateProgress();
            const sop = await this.generateSOP(task);
            this.displaySOP(sop);
        } catch (error) {
            console.error('Error generating SOP:', error);
            alert(error.message || 'Failed to generate SOP. Please try again.');
        }
        this.hideLoading();
    }

    async simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90; // Cap at 90% until actual completion
            this.updateLoadingProgress(progress);
        }, 500);

        // Change witty message every 2 seconds
        const messageInterval = setInterval(() => {
            const randomMessage = this.wittyMessages[Math.floor(Math.random() * this.wittyMessages.length)];
            this.loadingText.textContent = randomMessage;
        }, 2000);

        // Store intervals to clear them later
        this.activeIntervals = [interval, messageInterval];
    }

    updateLoadingProgress(progress) {
        this.loadingProgress.style.width = `${progress}%`;
        this.loadingProgress.setAttribute('aria-valuenow', progress);
    }

    async generateSOP(task) {
        const apiKey = localStorage.getItem('openRouterApiKey');
        
        if (!apiKey) {
            throw new Error('Please save your API key first');
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'SOP Generator'
            },
            body: JSON.stringify({
                model: 'google/learnlm-1.5-pro-experimental:free',
                messages: [{
                    role: 'user',
                    content: `Create a detailed Standard Operating Procedure (SOP) for the following task: ${task}. 
                    
Please format the response exactly as follows:

Title: [Clear title for the procedure]

Objective: [Concise statement of the purpose]

Scope: [Who this procedure applies to and what it covers]

Procedure:
- [First step]
- [Second step]
- [Additional steps...]

References:
- [Relevant reference 1]
- [Relevant reference 2]
- [Additional references if any]`
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || 'Failed to generate SOP');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    displaySOP(sop) {
        this.sopContent.innerHTML = this.formatSOP(sop);
        this.outputSection.style.display = 'block';
    }

    formatSOP(sop) {
        // First, split the content into sections
        const sections = sop.split('\n').reduce((acc, line) => {
            line = line.trim();
            if (!line) return acc;
            
            // Detect section headers (more flexible detection)
            if (line.toLowerCase().includes('title:') || line.match(/^title\s*[-:]/i)) {
                acc.title = line.replace(/^title\s*[-:]/i, '').replace(':', '').trim();
            } else if (line.toLowerCase().includes('objective:') || line.match(/^objective\s*[-:]/i)) {
                acc.objective = line.replace(/^objective\s*[-:]/i, '').replace(':', '').trim();
            } else if (line.toLowerCase().includes('scope:') || line.match(/^scope\s*[-:]/i)) {
                acc.scope = line.replace(/^scope\s*[-:]/i, '').replace(':', '').trim();
            } else if (line.toLowerCase().includes('procedure') || line.toLowerCase().includes('steps')) {
                acc.currentSection = 'procedure';
            } else if (line.toLowerCase().includes('reference')) {
                acc.currentSection = 'references';
            } else if (acc.currentSection === 'procedure') {
                // Handle numbered or bulleted steps
                const stepText = line.replace(/^[\d.-]\s*/, '').trim();
                if (stepText) {
                    if (!acc.procedure) acc.procedure = [];
                    acc.procedure.push(stepText);
                }
            } else if (acc.currentSection === 'references') {
                // Handle any type of reference format
                const refText = line.replace(/^[-*•]\s*/, '').trim();
                if (refText) {
                    if (!acc.references) acc.references = [];
                    acc.references.push(refText);
                }
            } else {
                // Capture content that might be part of the current section
                if (acc.currentSection === 'procedure' && line) {
                    if (!acc.procedure) acc.procedure = [];
                    acc.procedure.push(line);
                } else if (acc.currentSection === 'references' && line) {
                    if (!acc.references) acc.references = [];
                    acc.references.push(line);
                }
            }
            return acc;
        }, {});

        // Create HTML structure with checkboxes for procedures
        return `
            <div class="sop-table">
                <table>
                    <tbody>
                        <tr>
                            <th>Title</th>
                            <td>${sections.title || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Objective</th>
                            <td>${sections.objective || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Scope</th>
                            <td>${sections.scope || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Procedure</th>
                            <td>
                                ${sections.procedure && sections.procedure.length > 0 ? 
                                    `<div class="procedure-list">
                                        ${sections.procedure.map((step, index) => `
                                            <div class="procedure-item">
                                                <label class="checkbox-container">
                                                    <input type="checkbox" class="step-checkbox">
                                                    <span class="checkmark"></span>
                                                    <span class="step-number">${index + 1}.</span>
                                                    <span class="step-text">${step}</span>
                                                </label>
                                            </div>
                                        `).join('')}
                                    </div>` 
                                    : 'N/A'}
                            </td>
                        </tr>
                        <tr>
                            <th>References</th>
                            <td>
                                ${sections.references && sections.references.length > 0 ? 
                                    `<ul>${sections.references.map(ref => `<li>${ref}</li>`).join('')}</ul>` 
                                    : 'N/A'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.sopContent.innerText);
            alert('SOP copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        }
    }

    printSOP() {
        window.print();
    }

    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.outputSection.style.display = 'none';
        this.updateLoadingProgress(0);
        this.loadingText.textContent = this.wittyMessages[0];
    }

    hideLoading() {
        // Clear any active intervals
        if (this.activeIntervals) {
            this.activeIntervals.forEach(interval => clearInterval(interval));
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        // Set progress to 100% before hiding
        this.updateLoadingProgress(100);
        setTimeout(() => {
            this.loadingSpinner.style.display = 'none';
            // Reset timer display
            this.elapsedTimeEl.textContent = '0:00';
            this.remainingTimeEl.textContent = '~30 sec';
        }, 500);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    startTimer() {
        let elapsedSeconds = 0;
        this.timerInterval = setInterval(() => {
            elapsedSeconds++;
            const remainingSeconds = Math.max(0, this.estimatedTotalTime - elapsedSeconds);
            
            // Update elapsed time
            const elapsedMinutes = Math.floor(elapsedSeconds / 60);
            const elapsedRemainder = elapsedSeconds % 60;
            this.elapsedTimeEl.textContent = `${elapsedMinutes}:${elapsedRemainder.toString().padStart(2, '0')}`;
            
            // Update remaining time
            if (remainingSeconds > 0) {
                const remainingMinutes = Math.floor(remainingSeconds / 60);
                const remainingRemainder = remainingSeconds % 60;
                this.remainingTimeEl.textContent = 
                    `~${remainingMinutes}:${remainingRemainder.toString().padStart(2, '0')}`;
            } else {
                this.remainingTimeEl.textContent = 'Finishing up...';
            }
        }, 1000);
    }

    shareToSocial(platform) {
        try {
            // Get the SOP content
            const title = this.sopContent.querySelector('td').textContent.trim();
            const text = `Check out this SOP: ${title}`;
            const url = window.location.href;

            let shareUrl;
            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                    break;
                default:
                    console.error('Unknown platform:', platform);
                    return;
            }

            // Open share dialog
            if (shareUrl) {
                const windowFeatures = 'width=550,height=450,resizable=yes,scrollbars=yes,status=yes';
                window.open(shareUrl, 'share', windowFeatures);
            }
        } catch (error) {
            console.error('Error sharing to social media:', error);
            alert('Failed to share. Please try again.');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new SOPGenerator();
}); 