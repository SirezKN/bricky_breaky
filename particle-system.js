class Particle {
    constructor(x, y, vx, vy, color, size, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.gravity = 0.15;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += this.gravity * deltaTime;
        this.lifetime -= deltaTime;
        return this.lifetime > 0;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.lifetime / this.maxLifetime);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(deltaTime) {
        this.particles = this.particles.filter(particle => particle.update(deltaTime));
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    createExplosion(x, y, color = '#ffff00', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = 2 + Math.random() * 3;
            const lifetime = 30 + Math.random() * 20;
            
            this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
        }
    }

    createTrail(x, y, color = '#00ffff') {
        for (let i = 0; i < 3; i++) {
            const vx = (Math.random() - 0.5) * 1;
            const vy = (Math.random() - 0.5) * 1;
            const size = 1 + Math.random() * 2;
            const lifetime = 10 + Math.random() * 10;
            
            this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
        }
    }

    createPowerUpCollect(x, y) {
        const colors = ['#ff00ff', '#00ff00', '#ffff00', '#00ffff'];
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 2 + Math.random() * 4;
            const lifetime = 40 + Math.random() * 20;
            
            this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
        }
    }

    createBrickBreak(x, y, brickColor) {
        for (let i = 0; i < 15; i++) {
            const vx = (Math.random() - 0.5) * 4;
            const vy = Math.random() * -3 - 1;
            const size = 1 + Math.random() * 3;
            const lifetime = 20 + Math.random() * 20;
            
            this.particles.push(new Particle(x, y, vx, vy, brickColor, size, lifetime));
        }
    }

    clear() {
        this.particles = [];
    }
}