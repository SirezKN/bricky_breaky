class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            
            // Create synthesized sounds
            this.createSounds();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    createSounds() {
        // Define sound presets
        this.soundPresets = {
            hit: { frequency: 400, duration: 0.1, type: 'square', volume: 0.3 },
            brickBreak: { frequency: 800, duration: 0.15, type: 'sawtooth', volume: 0.4 },
            powerUp: { frequency: 600, duration: 0.3, type: 'sine', volume: 0.5 },
            gameOver: { frequency: 200, duration: 0.5, type: 'triangle', volume: 0.5 },
            levelComplete: { frequency: 1000, duration: 0.4, type: 'sine', volume: 0.5 },
            loseLife: { frequency: 150, duration: 0.3, type: 'sawtooth', volume: 0.4 }
        };
    }

    playSound(soundName) {
        if (!this.enabled || !this.initialized || !this.soundPresets[soundName]) return;

        const preset = this.soundPresets[soundName];
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = preset.type;
        oscillator.frequency.setValueAtTime(preset.frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(preset.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + preset.duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + preset.duration);
    }

    playComboSound(comboLevel) {
        if (!this.enabled || !this.initialized) return;

        const baseFreq = 400;
        const frequency = baseFreq + (comboLevel * 100);
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}