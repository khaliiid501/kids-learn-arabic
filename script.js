// App State
let currentMode = 'letters';
let lettersData = [];
let numbersData = [];
let currentIndex = 0;
let visitedItems = new Set();

// DOM Elements
const lettersBtn = document.getElementById('letters-btn');
const numbersBtn = document.getElementById('numbers-btn');
const lettersSection = document.getElementById('letters-section');
const numbersSection = document.getElementById('numbers-section');
const lettersGrid = document.getElementById('letters-grid');
const numbersGrid = document.getElementById('numbers-grid');
const currentCharacter = document.getElementById('current-character');
const characterName = document.getElementById('character-name');
const characterExample = document.getElementById('character-example');
const playSound = document.getElementById('play-sound');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Control buttons
const playAllLetters = document.getElementById('play-all-letters');
const randomLetter = document.getElementById('random-letter');
const playAllNumbers = document.getElementById('play-all-numbers');
const randomNumber = document.getElementById('random-number');

// Audio synthesis for pronunciation
const synth = window.speechSynthesis;

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    initializeDisplay();
});

// Load data from JSON files
async function loadData() {
    try {
        const [lettersResponse, numbersResponse] = await Promise.all([
            fetch('./data/letters.json'),
            fetch('./data/numbers.json')
        ]);
        
        lettersData = await lettersResponse.json();
        numbersData = await numbersResponse.json();
        
        generateLettersGrid();
        generateNumbersGrid();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback data in case JSON files are not accessible
        lettersData = [
            { character: 'ا', name: 'أَلِف', examples: 'أَسَد - أَرَز', position: 1 },
            { character: 'ب', name: 'بَاء', examples: 'بَطَة - بَيْت', position: 2 },
            { character: 'ت', name: 'تَاء', examples: 'تُفَّاح - تِمْسَاح', position: 3 }
        ];
        numbersData = [
            { character: '١', name: 'وَاحِد', examples: 'قَلَم وَاحِد', value: 1 },
            { character: '٢', name: 'اِثْنَان', examples: 'عَيْنَان', value: 2 },
            { character: '٣', name: 'ثَلاَثَة', examples: 'ثَلاَث تُفَّاحَات', value: 3 }
        ];
        generateLettersGrid();
        generateNumbersGrid();
    }
}

// Setup event listeners
function setupEventListeners() {
    lettersBtn.addEventListener('click', () => switchMode('letters'));
    numbersBtn.addEventListener('click', () => switchMode('numbers'));
    
    playSound.addEventListener('click', speakCurrentCharacter);
    
    playAllLetters.addEventListener('click', playAllSequentially);
    randomLetter.addEventListener('click', () => selectRandomItem('letters'));
    playAllNumbers.addEventListener('click', playAllSequentially);
    randomNumber.addEventListener('click', () => selectRandomItem('numbers'));
}

// Switch between letters and numbers mode
function switchMode(mode) {
    currentMode = mode;
    visitedItems.clear();
    
    // Update navigation
    lettersBtn.classList.toggle('active', mode === 'letters');
    numbersBtn.classList.toggle('active', mode === 'numbers');
    
    // Update sections
    lettersSection.classList.toggle('active', mode === 'letters');
    numbersSection.classList.toggle('active', mode === 'numbers');
    
    // Reset and update display
    currentIndex = 0;
    updateDisplay();
    updateProgress();
}

// Generate letters grid
function generateLettersGrid() {
    lettersGrid.innerHTML = '';
    lettersData.forEach((letter, index) => {
        const card = createCharacterCard(letter, index, 'letter');
        lettersGrid.appendChild(card);
    });
}

// Generate numbers grid
function generateNumbersGrid() {
    numbersGrid.innerHTML = '';
    numbersData.forEach((number, index) => {
        const card = createCharacterCard(number, index, 'number');
        numbersGrid.appendChild(card);
    });
}

// Create character card element
function createCharacterCard(item, index, type) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.index = index;
    card.dataset.type = type;
    
    card.innerHTML = `
        <span class="character">${item.character}</span>
        <span class="name">${item.name}</span>
    `;
    
    card.addEventListener('click', () => {
        selectCharacter(index);
        animateCard(card);
    });
    
    return card;
}

// Select character by index
function selectCharacter(index) {
    currentIndex = index;
    visitedItems.add(index);
    updateDisplay();
    updateProgress();
    updateActiveCard();
}

// Update the main display
function updateDisplay() {
    const currentData = currentMode === 'letters' ? lettersData : numbersData;
    const item = currentData[currentIndex];
    
    if (item) {
        currentCharacter.textContent = item.character;
        characterName.textContent = item.name;
        characterExample.textContent = item.examples;
    }
}

// Update progress bar
function updateProgress() {
    const totalItems = currentMode === 'letters' ? lettersData.length : numbersData.length;
    const visitedCount = visitedItems.size;
    const percentage = (visitedCount / totalItems) * 100;
    
    progressFill.style.width = `${percentage}%`;
    
    const modeText = currentMode === 'letters' ? 'حرف' : 'رقم';
    progressText.textContent = `${visitedCount} / ${totalItems} ${modeText}`;
}

// Update active card styling
function updateActiveCard() {
    const currentGrid = currentMode === 'letters' ? lettersGrid : numbersGrid;
    const cards = currentGrid.querySelectorAll('.character-card');
    
    cards.forEach((card, index) => {
        card.classList.toggle('active', index === currentIndex);
    });
}

// Initialize display
function initializeDisplay() {
    updateDisplay();
    updateProgress();
    updateActiveCard();
}

// Animate card on click
function animateCard(card) {
    card.classList.add('bounce');
    setTimeout(() => {
        card.classList.remove('bounce');
    }, 600);
}

// Speak current character
function speakCurrentCharacter() {
    const currentData = currentMode === 'letters' ? lettersData : numbersData;
    const item = currentData[currentIndex];
    
    if (item && synth) {
        // Cancel any ongoing speech
        synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(item.name);
        utterance.lang = 'ar-SA'; // Arabic (Saudi Arabia)
        utterance.rate = 0.7;
        utterance.pitch = 1.2;
        
        // Add visual feedback
        playSound.classList.add('playing');
        
        utterance.onend = () => {
            playSound.classList.remove('playing');
        };
        
        utterance.onerror = () => {
            playSound.classList.remove('playing');
            // Fallback: just show visual feedback
            setTimeout(() => playSound.classList.remove('playing'), 1000);
        };
        
        synth.speak(utterance);
    }
}

// Play all items sequentially
async function playAllSequentially() {
    const currentData = currentMode === 'letters' ? lettersData : numbersData;
    
    for (let i = 0; i < currentData.length; i++) {
        selectCharacter(i);
        speakCurrentCharacter();
        
        // Wait for speech to complete or timeout
        await new Promise(resolve => {
            const timeout = setTimeout(resolve, 2000);
            
            if (synth) {
                const checkSpeech = setInterval(() => {
                    if (!synth.speaking) {
                        clearInterval(checkSpeech);
                        clearTimeout(timeout);
                        resolve();
                    }
                }, 100);
            }
        });
        
        // Brief pause between items
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Select random item
function selectRandomItem(mode) {
    if (mode && mode !== currentMode) {
        switchMode(mode);
    }
    
    const currentData = currentMode === 'letters' ? lettersData : numbersData;
    const randomIndex = Math.floor(Math.random() * currentData.length);
    
    selectCharacter(randomIndex);
    speakCurrentCharacter();
    
    // Add special animation for random selection
    const currentGrid = currentMode === 'letters' ? lettersGrid : numbersGrid;
    const randomCard = currentGrid.children[randomIndex];
    if (randomCard) {
        animateCard(randomCard);
    }
}

// Keyboard navigation
document.addEventListener('keydown', (event) => {
    const currentData = currentMode === 'letters' ? lettersData : numbersData;
    
    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
            event.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentData.length - 1;
            selectCharacter(prevIndex);
            break;
            
        case 'ArrowLeft':
        case 'ArrowDown':
            event.preventDefault();
            const nextIndex = currentIndex < currentData.length - 1 ? currentIndex + 1 : 0;
            selectCharacter(nextIndex);
            break;
            
        case ' ':
        case 'Enter':
            event.preventDefault();
            speakCurrentCharacter();
            break;
            
        case 'r':
        case 'R':
            event.preventDefault();
            selectRandomItem();
            break;
            
        case 'l':
        case 'L':
            event.preventDefault();
            switchMode('letters');
            break;
            
        case 'n':
        case 'N':
            event.preventDefault();
            switchMode('numbers');
            break;
    }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}, false);

document.addEventListener('touchend', (event) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;
    
    // Minimum swipe distance
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            const currentData = currentMode === 'letters' ? lettersData : numbersData;
            
            if (deltaX > 0) {
                // Swipe left (next item)
                const nextIndex = currentIndex < currentData.length - 1 ? currentIndex + 1 : 0;
                selectCharacter(nextIndex);
            } else {
                // Swipe right (previous item)
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentData.length - 1;
                selectCharacter(prevIndex);
            }
        }
    }
    
    // Reset touch coordinates
    touchStartX = 0;
    touchStartY = 0;
}, false);

// Auto-play feature (optional)
let autoPlayInterval = null;

function toggleAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    } else {
        autoPlayInterval = setInterval(() => {
            const currentData = currentMode === 'letters' ? lettersData : numbersData;
            const nextIndex = currentIndex < currentData.length - 1 ? currentIndex + 1 : 0;
            selectCharacter(nextIndex);
            speakCurrentCharacter();
        }, 3000);
    }
}

// Accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
    // Add ARIA labels
    lettersBtn.setAttribute('aria-label', 'تبديل إلى تعلم الحروف');
    numbersBtn.setAttribute('aria-label', 'تبديل إلى تعلم الأرقام');
    playSound.setAttribute('aria-label', 'تشغيل النطق');
    
    // Add keyboard navigation hints
    const helpText = document.createElement('div');
    helpText.style.cssText = 'position: fixed; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 1000; display: none;';
    helpText.innerHTML = `
        <strong>اختصارات لوحة المفاتيح:</strong><br>
        ← → للتنقل<br>
        مسطرة أو Enter للنطق<br>
        R للعشوائي<br>
        L للحروف، N للأرقام
    `;
    document.body.appendChild(helpText);
    
    // Show help on first visit
    setTimeout(() => {
        helpText.style.display = 'block';
        setTimeout(() => helpText.style.display = 'none', 5000);
    }, 2000);
});

// Error handling for audio
window.addEventListener('error', (event) => {
    if (event.target.tagName === 'AUDIO') {
        console.warn('Audio playback failed, using text-to-speech fallback');
    }
});

// Performance optimization: Lazy loading for large datasets
function optimizePerformance() {
    // Implement virtual scrolling for large character sets if needed
    const grids = [lettersGrid, numbersGrid];
    
    grids.forEach(grid => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        });
        
        Array.from(grid.children).forEach(card => {
            observer.observe(card);
        });
    });
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', optimizePerformance);