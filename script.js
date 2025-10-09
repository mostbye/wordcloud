class AdvancedWordCloudGenerator {
    constructor() {
        this.canvas = document.getElementById('wordCloudCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.words = [];
        this.placedWords = [];
        this.particles = [];
        this.animationId = null;
        this.isAnimating = false;
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        
        this.initializeEventListeners();
        this.setupCanvas();
        this.createParticles();
    }
    
    setupCanvas() {
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.ctx.textBaseline = 'alphabetic';
    }
    
    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Main controls
        document.getElementById('generateBtn').addEventListener('click', () => this.generateWordCloud());
        document.getElementById('animateBtn').addEventListener('click', () => this.animateWordCloud());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportWordCloud());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearWordCloud());
        
        // URL fetching
        document.getElementById('fetchUrlBtn').addEventListener('click', () => this.fetchUrlText());
        
        // File upload
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Real-time controls
        document.getElementById('rotation').addEventListener('input', (e) => {
            document.getElementById('rotationValue').textContent = e.target.value + '°';
        });
        
        document.getElementById('opacity').addEventListener('input', (e) => {
            document.getElementById('opacityValue').textContent = Math.round(e.target.value * 100) + '%';
        });
        
        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
    }
    
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName + 'Tab').classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }
    
    async fetchUrlText() {
        const url = document.getElementById('urlInput').value.trim();
        const statusDiv = document.getElementById('urlStatus');
        
        if (!url) {
            this.showStatus(statusDiv, 'Please enter a URL', 'error');
            return;
        }
        
        try {
            this.showStatus(statusDiv, 'Fetching text from URL...', 'info');
            
            // Note: This would need a CORS proxy in a real implementation
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.contents) {
                document.getElementById('textInput').value = data.contents;
                this.showStatus(statusDiv, 'Text fetched successfully!', 'success');
            } else {
                throw new Error('No content found');
            }
        } catch (error) {
            this.showStatus(statusDiv, 'Failed to fetch URL content. Please try a different URL.', 'error');
        }
    }
    
    handleFileUpload(event) {
        const file = event.target.files[0];
        const statusDiv = document.getElementById('fileStatus');
        
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('textInput').value = e.target.result;
            this.showStatus(statusDiv, `File "${file.name}" loaded successfully!`, 'success');
        };
        
        reader.onerror = () => {
            this.showStatus(statusDiv, 'Failed to read file', 'error');
        };
        
        reader.readAsText(file);
    }
    
    showStatus(element, message, type) {
        element.textContent = message;
        element.className = `status-message ${type}`;
        setTimeout(() => {
            element.className = 'status-message';
        }, 5000);
    }
    
    // Advanced color schemes
    getColorScheme(scheme) {
        const schemes = {
            rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
            blue: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#1D4ED8', '#2563EB', '#1E40AF'],
            green: ['#166534', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#15803D', '#16A34A', '#22C55E'],
            red: ['#991B1B', '#DC2626', '#EF4444', '#F87171', '#FECACA', '#B91C1C', '#DC2626', '#EF4444'],
            purple: ['#7C2D12', '#A855F7', '#C084FC', '#DDD6FE', '#F3E8FF', '#9333EA', '#A855F7', '#C084FC'],
            orange: ['#C2410C', '#EA580C', '#FB923C', '#FDBA74', '#FED7AA', '#D97706', '#EA580C', '#FB923C'],
            neon: ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0080', '#8000FF', '#FF8000', '#00FF80'],
            gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
            monochrome: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF']
        };
        return schemes[scheme] || schemes.rainbow;
    }
    
    // Advanced text processing with stemming
    processText(text) {
        const cleanedText = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        // Enhanced stop words list
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
            'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
            'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
            'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'
        ]);
        
        const words = cleanedText.split(' ')
            .filter(word => word.length > 2 && !stopWords.has(word));
        
        // Simple stemming
        const stemmedWords = words.map(word => this.stemWord(word));
        
        const wordCount = {};
        stemmedWords.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        return wordCount;
    }
    
    // Simple stemming algorithm
    stemWord(word) {
        if (word.length <= 3) return word;
        
        // Remove common suffixes
        const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's', 'es'];
        for (const suffix of suffixes) {
            if (word.endsWith(suffix) && word.length > suffix.length + 2) {
                return word.slice(0, -suffix.length);
            }
        }
        
        return word;
    }
    
    // Advanced collision detection with spatial hashing
    checkCollision(x, y, width, height) {
    const margin = 10; // Even more padding for stricter collision
        
        for (const word of this.placedWords) {
            if (x - margin < word.x + word.width + margin &&
                x + width + margin > word.x - margin &&
                y - margin < word.y + word.height + margin &&
                y + height + margin > word.y - margin) {
                return true;
            }
        }
        return false;
    }
    
    // Advanced word placement algorithms
    placeWord(word, fontSize, color, layout) {
        this.ctx.font = `${fontSize}px ${document.getElementById('fontFamily').value}`;
        const metrics = this.ctx.measureText(word);
        // Use actual bounding box if available for more accurate collision
        let width = metrics.width;
        let height = fontSize;
        if ('actualBoundingBoxAscent' in metrics && 'actualBoundingBoxDescent' in metrics) {
            height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        }
        // Add extra margin to width/height for stricter collision
        width += 8;
        height += 8;

        let x, y;
    const maxAttempts = 1500; // Even more attempts for denser packing
        let attempts = 0;
        let found = false;
        let best = null;
        let minDist = Infinity;

        // Try to find the best position (closest to center, no overlap)
        while (attempts < maxAttempts) {
            switch (layout) {
                case 'spiral':
                    ({ x, y } = this.getSpiralPosition(attempts, width, height));
                    break;
                case 'grid':
                    ({ x, y } = this.getGridPosition(attempts, width, height));
                    break;
                case 'circular':
                    ({ x, y } = this.getCircularPosition(attempts, width, height));
                    break;
                default: // random
                    x = Math.random() * (this.canvasWidth - width - 10) + 5;
                    y = Math.random() * (this.canvasHeight - height - 10) + height + 5;
            }
            // Keep inside canvas
            if (x < 0) x = 0;
            if (y < height) y = height;
            if (x + width > this.canvasWidth) x = this.canvasWidth - width;
            if (y > this.canvasHeight) y = this.canvasHeight;

            if (!this.checkCollision(x, y - height, width, height)) {
                // Prefer positions closer to center
                const centerX = this.canvasWidth / 2;
                const centerY = this.canvasHeight / 2;
                const dist = Math.hypot(x + width / 2 - centerX, y - height / 2 - centerY);
                if (dist < minDist) {
                    minDist = dist;
                    best = { x, y };
                    found = true;
                }
                // If very close to center, break early
                if (dist < 20) break;
            }
            attempts++;
        }
        if (found && best) {
            const rotation = document.getElementById('rotation').value;
            const opacity = document.getElementById('opacity').value;
            this.placedWords.push({
                word: word,
                x: best.x,
                y: best.y,
                width: width,
                height: height,
                fontSize: fontSize,
                color: color,
                rotation: rotation,
                opacity: opacity,
                originalX: best.x,
                originalY: best.y,
                animationDelay: Math.random() * 1000
            });
            return true;
        }
        return false;
    }
    
    getSpiralPosition(attempt, width, height) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        // Denser spiral
        const angle = attempt * 0.18;
        const radius = 2 + attempt * 1.1;
        return {
            x: centerX + Math.cos(angle) * radius - width / 2,
            y: centerY + Math.sin(angle) * radius + height / 2
        };
    }
    
    getGridPosition(attempt, width, height) {
        const cols = Math.floor(this.canvasWidth / (width + 20));
        const row = Math.floor(attempt / cols);
        const col = attempt % cols;
        
        return {
            x: col * (width + 20) + 10,
            y: row * (height + 20) + height + 10
        };
    }
    
    getCircularPosition(attempt, width, height) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const radius = Math.min(this.canvasWidth, this.canvasHeight) / 3;
        const angle = (attempt / this.placedWords.length) * 2 * Math.PI;
        
        return {
            x: centerX + Math.cos(angle) * radius - width / 2,
            y: centerY + Math.sin(angle) * radius + height / 2
        };
    }
    
    // Particle system
    createParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > this.canvasWidth) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvasHeight) particle.vy *= -1;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = '#667eea';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    // Advanced word cloud generation
    generateWordCloud() {
        const textInput = document.getElementById('textInput').value.trim();
        if (!textInput) {
            alert('Please enter some text to generate a word cloud!');
            return;
        }
        
        this.showLoading();
        
        setTimeout(() => {
            const wordCount = this.processText(textInput);
            const maxWords = parseInt(document.getElementById('maxWords').value);
            const minFontSize = parseInt(document.getElementById('minFontSize').value);
            const maxFontSize = parseInt(document.getElementById('maxFontSize').value);
            const colorScheme = document.getElementById('colorScheme').value;
            const layout = document.getElementById('layout').value;
            
            const sortedWords = Object.entries(wordCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, maxWords);
            
            if (sortedWords.length === 0) {
                alert('No valid words found in the text. Try adding more content!');
                this.hideLoading();
                return;
            }
            
            const maxFrequency = sortedWords[0][1];
            const colors = this.getColorScheme(colorScheme);
            
            this.placedWords = [];
            
            for (const [word, frequency] of sortedWords) {
                const fontSize = this.calculateFontSize(frequency, maxFrequency, minFontSize, maxFontSize);
                const color = colors[Math.floor(Math.random() * colors.length)];
                // Only add if it fits
                const placed = this.placeWord(word, fontSize, color, layout);
                if (!placed) {
                    // If can't place, stop adding more words (prevents overlap at high density)
                    break;
                }
            }
            
            this.drawWordCloud();
            this.showWordStats(sortedWords);
            this.hideLoading();
        }, 500);
    }
    
    calculateFontSize(frequency, maxFrequency, minFontSize, maxFontSize) {
        const ratio = frequency / maxFrequency;
        return Math.round(minFontSize + (maxFontSize - minFontSize) * ratio);
    }
    
    // Advanced drawing with effects
    drawWordCloud() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw background particles
        this.drawParticles();
        
        for (const word of this.placedWords) {
            this.drawWord(word);
        }
    }
    
    drawWord(wordObj) {
        this.ctx.save();
        
        // Apply transformations
        this.ctx.translate(wordObj.x + wordObj.width / 2, wordObj.y - wordObj.height / 2);
        this.ctx.rotate((wordObj.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = wordObj.opacity;
        
        // Apply color effects
        const colorScheme = document.getElementById('colorScheme').value;
        if (colorScheme === 'neon') {
            this.ctx.shadowColor = wordObj.color;
            this.ctx.shadowBlur = 10;
        } else if (colorScheme === 'gradient') {
            const gradient = this.ctx.createLinearGradient(0, 0, wordObj.width, 0);
            gradient.addColorStop(0, wordObj.color);
            gradient.addColorStop(1, this.getColorScheme('gradient')[Math.floor(Math.random() * 6)]);
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = wordObj.color;
        }
        
        this.ctx.font = `${wordObj.fontSize}px ${document.getElementById('fontFamily').value}`;
        this.ctx.fillText(wordObj.word, -wordObj.width / 2, wordObj.height / 2);
        
        this.ctx.restore();
    }
    
    // Animation system
    animateWordCloud() {
        if (this.isAnimating) {
            this.stopAnimation();
            return;
        }
        
        this.isAnimating = true;
        document.getElementById('animateBtn').innerHTML = '<span class="btn-icon">⏹️</span> Stop Animation';
        
        const animationType = document.getElementById('animation').value;
        this.startAnimation(animationType);
    }
    
    startAnimation(type) {
        const animate = () => {
            this.updateParticles();
            
            if (type === 'particles') {
                this.drawWordCloud();
            } else {
                this.animateWords(type);
            }
            
            if (this.isAnimating) {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    animateWords(type) {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.drawParticles();
        
        const time = Date.now();
        
        this.placedWords.forEach((word, index) => {
            this.ctx.save();
            
            let x = word.x;
            let y = word.y;
            
            if (type === 'bounce') {
                const bounceTime = (time + word.animationDelay) * 0.003;
                y += Math.sin(bounceTime) * 5;
            } else if (type === 'spiral') {
                const spiralTime = (time + word.animationDelay) * 0.001;
                const radius = 10;
                x += Math.cos(spiralTime) * radius;
                y += Math.sin(spiralTime) * radius;
            } else if (type === 'fade') {
                const fadeTime = (time + word.animationDelay) * 0.002;
                this.ctx.globalAlpha = (Math.sin(fadeTime) + 1) / 2;
            }
            
            this.ctx.translate(x + word.width / 2, y - word.height / 2);
            this.ctx.rotate((word.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = word.opacity;
            this.ctx.fillStyle = word.color;
            this.ctx.font = `${word.fontSize}px ${document.getElementById('fontFamily').value}`;
            this.ctx.fillText(word.word, -word.width / 2, word.height / 2);
            
            this.ctx.restore();
        });
    }
    
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.getElementById('animateBtn').innerHTML = '<span class="btn-icon">🎬</span> Animate';
        this.drawWordCloud();
    }
    
    // Interactive features
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find clicked word
        const clickedWord = this.placedWords.find(word => 
            x >= word.x && x <= word.x + word.width &&
            y >= word.y - word.height && y <= word.y
        );
        
        if (clickedWord) {
            this.highlightWord(clickedWord);
        }
    }
    
    handleCanvasHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const hoveredWord = this.placedWords.find(word => 
            x >= word.x && x <= word.x + word.width &&
            y >= word.y - word.height && y <= word.y
        );
        
        if (hoveredWord) {
            this.canvas.style.cursor = 'pointer';
            this.highlightWord(hoveredWord);
        } else {
            this.canvas.style.cursor = 'default';
            this.drawWordCloud();
        }
    }
    
    highlightWord(word) {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.drawParticles();
        
        this.placedWords.forEach(w => {
            this.ctx.save();
            
            if (w === word) {
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 15;
                this.ctx.globalAlpha = 1;
            } else {
                this.ctx.globalAlpha = 0.3;
            }
            
            this.drawWord(w);
            this.ctx.restore();
        });
    }
    
    // Export functionality
    exportWordCloud() {
        const format = prompt('Choose export format:\n1. PNG\n2. SVG\n3. PDF', '1');
        
        switch (format) {
            case '1':
                this.exportAsPNG();
                break;
            case '2':
                this.exportAsSVG();
                break;
            case '3':
                this.exportAsPDF();
                break;
            default:
                alert('Invalid format selected');
        }
    }
    
    exportAsPNG() {
        const link = document.createElement('a');
        link.download = 'wordcloud.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    exportAsSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.canvasWidth);
        svg.setAttribute('height', this.canvasHeight);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        this.placedWords.forEach(word => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', word.x);
            text.setAttribute('y', word.y);
            text.setAttribute('font-size', word.fontSize);
            text.setAttribute('fill', word.color);
            text.setAttribute('font-family', document.getElementById('fontFamily').value);
            text.textContent = word.word;
            svg.appendChild(text);
        });
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = 'wordcloud.svg';
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    exportAsPDF() {
        // Simple PDF export using canvas
        const pdf = new jsPDF();
        const imgData = this.canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 140);
        pdf.save('wordcloud.pdf');
    }
    
    // Statistics and UI
    showWordStats(sortedWords) {
        const statsContent = document.getElementById('statsContent');
        const totalWords = sortedWords.reduce((sum, [_, count]) => sum + count, 0);
        const uniqueWords = sortedWords.length;
        const mostFrequent = sortedWords[0];
        
        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${totalWords}</div>
                    <div class="stat-label">Total Words</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${uniqueWords}</div>
                    <div class="stat-label">Unique Words</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${mostFrequent[0]}</div>
                    <div class="stat-label">Most Frequent</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${mostFrequent[1]}</div>
                    <div class="stat-label">Frequency</div>
                </div>
            </div>
            <div class="word-list">
                <h4>Top Words:</h4>
                ${sortedWords.slice(0, 10).map(([word, count], index) => `
                    <div class="word-item" onclick="this.style.background='#e3f2fd'">
                        <span class="word-text">${index + 1}. ${word}</span>
                        <span class="word-count">${count} times</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.getElementById('wordStats').classList.remove('hidden');
    }
    
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('wordCloudContainer').style.display = 'none';
        document.getElementById('wordStats').classList.add('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('wordCloudContainer').style.display = 'block';
    }
    
    clearWordCloud() {
        document.getElementById('textInput').value = '';
        document.getElementById('wordCloudContainer').style.display = 'none';
        document.getElementById('wordStats').classList.add('hidden');
        this.placedWords = [];
        this.stopAnimation();
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
}

// Initialize the advanced word cloud generator
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedWordCloudGenerator();
});