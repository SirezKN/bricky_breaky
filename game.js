class Ball {
    constructor(x, y, radius, speed, color = '#00ffff') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.vx = speed;
        this.vy = -speed;
        this.color = color;
        this.trail = [];
        this.maxTrailLength = 10;
    }

    update(deltaTime, canvas) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Wall collisions
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            this.vx = -this.vx;
            this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        }
        if (this.y - this.radius <= 0) {
            this.vy = -this.vy;
            this.y = this.radius;
        }

        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    draw(ctx) {
        // Draw trail
        this.trail.forEach((point, index) => {
            ctx.save();
            ctx.globalAlpha = index / this.trail.length * 0.5;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.radius * (index / this.trail.length), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw ball with glow
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = this.speed;
        this.vy = -this.speed;
        this.trail = [];
    }
}

class Paddle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 8;
        this.color = '#ff00ff';
        this.targetX = x;
    }

    update(deltaTime, canvas) {
        // Smooth movement towards target
        const dx = this.targetX - this.x;
        this.x += dx * 0.2;

        // Keep paddle within bounds
        this.x = Math.max(this.width / 2, Math.min(canvas.width - this.width / 2, this.x));
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        // Draw neon edges
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.restore();
    }

    moveTo(x) {
        this.targetX = x;
    }
}

class Brick {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.health = type.health;
        this.destroyed = false;
        this.animation = 0;
    }

    hit() {
        this.health--;
        this.animation = 10;
        if (this.health <= 0) {
            this.destroyed = true;
            return true;
        }
        return false;
    }

    update(deltaTime) {
        if (this.animation > 0) {
            this.animation -= deltaTime;
        }
    }

    draw(ctx) {
        if (this.destroyed) return;

        const shake = this.animation > 0 ? (Math.random() - 0.5) * 2 : 0;
        
        ctx.save();
        ctx.translate(shake, shake);
        
        // Main brick
        ctx.fillStyle = this.type.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.type.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Inner glow
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // Health indicator for multi-hit bricks
        if (this.type.health > 1 && this.health > 1) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.health, this.x + this.width / 2, this.y + this.height / 2);
        }
        
        ctx.restore();
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 15;
        this.speed = 3;
        this.angle = 0;
        this.collected = false;
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime;
        this.angle += 0.05 * deltaTime;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Outer glow
        ctx.fillStyle = this.type.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.type.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.symbol, 0, 0);
        
        ctx.restore();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleSystem = new ParticleSystem();
        this.soundManager = new SoundManager();
        
        this.state = 'start';
        this.level = 0;
        this.score = 0;
        this.lives = 3;
        this.highScore = parseInt(localStorage.getItem('neonBreakerHighScore') || '0');
        
        this.paddle = null;
        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        this.activePowerUps = new Map();
        
        this.combo = 0;
        this.lastBrickTime = 0;
        this.comboTimeout = 1000;
        
        this.ballAttached = true;
        this.magneticPaddle = false;
        this.fireBall = false;
        this.lastTime = 0;
        this.setupCanvas();
        this.setupEventListeners();
        this.init();
    }

    init() {
        this.soundManager.init();
        this.updateHighScore();
        window.Telegram?.WebApp?.ready();
        window.Telegram?.WebApp?.expand();
    }

    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
    }

    setupEventListeners() {
        // Mouse/Touch controls
        const handleMove = (e) => {
            if (this.state !== 'playing') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            
            if (this.paddle) {
                this.paddle.moveTo(x);
            }
        };

        const handleClick = (e) => {
            if (this.state === 'playing' && this.ballAttached) {
                this.launchBall();
            }
        };

        this.canvas.addEventListener('mousemove', handleMove);
        this.canvas.addEventListener('touchmove', handleMove, { passive: true });
        this.canvas.addEventListener('touchstart', handleMove, { passive: true });
        this.canvas.addEventListener('click', handleClick);
        this.canvas.addEventListener('touchend', handleClick);

        // Pause on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state === 'playing') {
                this.pause();
            }
        });
    }

    startGame() {
        this.state = 'playing';
        this.level = 0;
        this.score = 0;
        this.lives = 3;
        this.ballAttached = true;
        this.loadLevel(this.level);
        this.updateUI();
        this.showScreen('game-screen');
        this.gameLoop();
    }

    launchBall() {
        if (!this.ballAttached || this.balls.length === 0) return;
        
        this.ballAttached = false;
        const ball = this.balls[0];
        ball.vx = ball.speed * (Math.random() - 0.5) * 2;
        ball.vy = -ball.speed;
        this.soundManager.playSound('hit');
    }

    loadLevel(levelIndex) {
        const levelData = LEVELS[levelIndex];
        if (!levelData) {
            this.win();
            return;
        }

        // Clear existing entities
        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        
        // Clear active power-ups
        for (const [type, data] of this.activePowerUps.entries()) {
            this.deactivatePowerUp(type);
        }
        this.activePowerUps.clear();
        this.particleSystem.clear();
        
        // Reset power-up states
        this.fireBall = false;
        this.magneticPaddle = false;

        // Set background
        document.getElementById('game-container').style.background = levelData.background;

        // Create paddle
        const paddleWidth = 100;
        const paddleHeight = 15;
        this.paddle = new Paddle(
            this.canvas.width / 2,
            this.canvas.height - 50,
            paddleWidth,
            paddleHeight
        );
        this.paddle.speed = levelData.paddleSpeed;

        // Create ball
        const ball = new Ball(
            this.canvas.width / 2,
            this.canvas.height - 100,
            8,
            levelData.ballSpeed
        );
        if (this.ballAttached) {
            ball.vx = 0;
            ball.vy = 0;
        }
        this.balls.push(ball);

        // Create bricks
        const brickRows = levelData.bricks.length;
        const brickCols = levelData.bricks[0].length;
        const brickWidth = (this.canvas.width - 60) / brickCols;
        const brickHeight = 25;
        const brickPadding = 2;

        for (let row = 0; row < brickRows; row++) {
            for (let col = 0; col < brickCols; col++) {
                const brickType = getBrickType(levelData.bricks[row][col]);
                if (brickType) {
                    const x = 30 + col * brickWidth + brickPadding;
                    const y = 100 + row * brickHeight + brickPadding;
                    const brick = new Brick(
                        x,
                        y,
                        brickWidth - brickPadding * 2,
                        brickHeight - brickPadding * 2,
                        brickType
                    );
                    this.bricks.push(brick);
                }
            }
        }
    }

    gameLoop(currentTime = 0) {
        if (this.state !== 'playing') return;

        const deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update paddle
        this.paddle.update(deltaTime, this.canvas);

        // Update balls
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            // If ball is attached to paddle, follow paddle movement
            if (this.ballAttached && i === 0) {
                ball.x = this.paddle.x;
                ball.y = this.paddle.y - this.paddle.height / 2 - ball.radius - 5;
                continue;
            }
            
            ball.update(deltaTime, this.canvas);

            // Check if ball fell off screen
            if (ball.y > this.canvas.height) {
                this.balls.splice(i, 1);
                if (this.balls.length === 0) {
                    this.loseLife();
                }
                continue;
            }

            // Paddle collision
            if (this.checkBallPaddleCollision(ball, this.paddle)) {
                this.soundManager.playSound('hit');
                this.particleSystem.createTrail(ball.x, ball.y, '#ff00ff');
                
                // Handle magnetic paddle
                if (this.magneticPaddle && !this.ballAttached) {
                    this.ballAttached = true;
                    ball.vx = 0;
                    ball.vy = 0;
                }
            }

            // Brick collisions
            for (let j = this.bricks.length - 1; j >= 0; j--) {
                const brick = this.bricks[j];
                if (!brick.destroyed && this.checkBallBrickCollision(ball, brick)) {
                    // Fire ball destroys bricks instantly
                    const destroyed = this.fireBall ? true : brick.hit();
                    if (this.fireBall && brick.health > 1) {
                        brick.health = 0;
                        brick.destroyed = true;
                    }
                    this.soundManager.playSound(destroyed ? 'brickBreak' : 'hit');
                    
                    if (destroyed) {
                        this.score += brick.type.points;
                        this.particleSystem.createBrickBreak(
                            brick.x + brick.width / 2,
                            brick.y + brick.height / 2,
                            brick.type.color
                        );

                        // Handle combo
                        const now = Date.now();
                        if (now - this.lastBrickTime < this.comboTimeout) {
                            this.combo++;
                            if (this.combo > 1) {
                                this.showCombo(this.combo);
                                this.score += this.combo * 5;
                                this.soundManager.playComboSound(Math.min(this.combo, 5));
                            }
                        } else {
                            this.combo = 1;
                        }
                        this.lastBrickTime = now;

                        // Spawn power-up
                        if (brick.type.powerUp && Math.random() < 0.5) {
                            const powerUpTypes = Object.values(POWER_UPS);
                            const powerUp = new PowerUp(
                                brick.x + brick.width / 2,
                                brick.y + brick.height / 2,
                                powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
                            );
                            this.powerUps.push(powerUp);
                        }

                        // Handle explosive bricks
                        if (brick.type.explosive) {
                            this.explodeBrick(brick);
                        }

                        this.bricks.splice(j, 1);
                    }
                }
            }
        }

        // Update bricks
        this.bricks.forEach(brick => brick.update(deltaTime));

        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update(deltaTime);

            // Check paddle collision
            if (this.checkPowerUpPaddleCollision(powerUp, this.paddle)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(i, 1);
            } else if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }

        // Update active power-ups
        for (const [type, data] of this.activePowerUps.entries()) {
            if (Date.now() > data.endTime) {
                this.deactivatePowerUp(type);
                this.activePowerUps.delete(type);
            }
        }
        
        // Update power-up display
        this.updatePowerUpDisplay();

        // Update particles
        this.particleSystem.update(deltaTime);

        // Check win condition
        if (this.bricks.length === 0) {
            this.levelComplete();
        }

        this.updateUI();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw instruction text if ball is attached
        if (this.ballAttached && this.balls.length > 0) {
            this.ctx.save();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.002) * 0.3;
            this.ctx.fillText('Click or Tap to Launch', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
        }

        // Draw game objects
        this.paddle.draw(this.ctx);
        
        // Draw balls with fire effect if active
        this.balls.forEach(ball => {
            if (this.fireBall) {
                // Draw fire glow
                this.ctx.save();
                this.ctx.shadowBlur = 30;
                this.ctx.shadowColor = '#ff4500';
                this.ctx.fillStyle = '#ff4500';
                this.ctx.beginPath();
                this.ctx.arc(ball.x, ball.y, ball.radius * 1.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
            ball.draw(this.ctx);
        });
        
        this.bricks.forEach(brick => brick.draw(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        this.particleSystem.draw(this.ctx);
    }

    checkBallPaddleCollision(ball, paddle) {
        const paddleLeft = paddle.x - paddle.width / 2;
        const paddleRight = paddle.x + paddle.width / 2;
        const paddleTop = paddle.y - paddle.height / 2;
        const paddleBottom = paddle.y + paddle.height / 2;

        if (ball.x + ball.radius >= paddleLeft &&
            ball.x - ball.radius <= paddleRight &&
            ball.y + ball.radius >= paddleTop &&
            ball.y - ball.radius <= paddleBottom) {
            
            ball.vy = -Math.abs(ball.vy);
            
            // Add spin based on hit position
            const hitPos = (ball.x - paddle.x) / (paddle.width / 2);
            ball.vx = ball.speed * hitPos * 0.75;
            
            return true;
        }
        return false;
    }

    checkBallBrickCollision(ball, brick) {
        const brickLeft = brick.x;
        const brickRight = brick.x + brick.width;
        const brickTop = brick.y;
        const brickBottom = brick.y + brick.height;

        if (ball.x + ball.radius >= brickLeft &&
            ball.x - ball.radius <= brickRight &&
            ball.y + ball.radius >= brickTop &&
            ball.y - ball.radius <= brickBottom) {
            
            // Determine collision side
            const overlapLeft = ball.x + ball.radius - brickLeft;
            const overlapRight = brickRight - (ball.x - ball.radius);
            const overlapTop = ball.y + ball.radius - brickTop;
            const overlapBottom = brickBottom - (ball.y - ball.radius);

            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                ball.vx = -ball.vx;
            } else {
                ball.vy = -ball.vy;
            }
            
            return true;
        }
        return false;
    }

    checkPowerUpPaddleCollision(powerUp, paddle) {
        const paddleLeft = paddle.x - paddle.width / 2;
        const paddleRight = paddle.x + paddle.width / 2;
        const paddleTop = paddle.y - paddle.height / 2;
        const paddleBottom = paddle.y + paddle.height / 2;

        return powerUp.x + powerUp.radius >= paddleLeft &&
               powerUp.x - powerUp.radius <= paddleRight &&
               powerUp.y + powerUp.radius >= paddleTop &&
               powerUp.y - powerUp.radius <= paddleBottom;
    }

    collectPowerUp(powerUp) {
        this.soundManager.playSound('powerUp');
        this.particleSystem.createPowerUpCollect(powerUp.x, powerUp.y);
        this.score += 25;

        // Show notification
        this.showPowerUpNotification(powerUp.type);

        if (powerUp.type.duration > 0) {
            this.activePowerUps.set(powerUp.type, {
                endTime: Date.now() + powerUp.type.duration,
                startTime: Date.now(),
                duration: powerUp.type.duration
            });
        }

        switch (powerUp.type) {
            case POWER_UPS.MULTI_BALL:
                this.activateMultiBall();
                break;
            case POWER_UPS.WIDE_PADDLE:
                this.paddle.width = 150;
                break;
            case POWER_UPS.SLOW_BALL:
                this.balls.forEach(ball => {
                    ball.speed *= 0.7;
                    ball.vx *= 0.7;
                    ball.vy *= 0.7;
                });
                break;
            case POWER_UPS.FIRE_BALL:
                this.fireBall = true;
                this.balls.forEach(ball => {
                    ball.color = '#ff4500';
                });
                break;
            case POWER_UPS.CATCH:
                this.magneticPaddle = true;
                break;
        }
    }

    deactivatePowerUp(type) {
        switch (type) {
            case POWER_UPS.WIDE_PADDLE:
                this.paddle.width = 100;
                break;
            case POWER_UPS.SLOW_BALL:
                this.balls.forEach(ball => {
                    ball.speed /= 0.7;
                    ball.vx /= 0.7;
                    ball.vy /= 0.7;
                });
                break;
            case POWER_UPS.FIRE_BALL:
                this.fireBall = false;
                this.balls.forEach(ball => {
                    ball.color = '#00ffff';
                });
                break;
            case POWER_UPS.CATCH:
                this.magneticPaddle = false;
                break;
        }
    }

    activateMultiBall() {
        const currentBalls = [...this.balls];
        currentBalls.forEach(ball => {
            for (let i = 0; i < 2; i++) {
                const newBall = new Ball(ball.x, ball.y, ball.radius, ball.speed);
                const angle = (Math.random() - 0.5) * Math.PI / 2;
                newBall.vx = ball.speed * Math.sin(angle);
                newBall.vy = -ball.speed * Math.cos(angle);
                this.balls.push(newBall);
            }
        });
    }

    explodeBrick(brick) {
        const explosionRadius = 100;
        this.particleSystem.createExplosion(
            brick.x + brick.width / 2,
            brick.y + brick.height / 2,
            '#ff4500',
            40
        );

        this.bricks.forEach(otherBrick => {
            if (otherBrick !== brick && !otherBrick.destroyed) {
                const dx = (otherBrick.x + otherBrick.width / 2) - (brick.x + brick.width / 2);
                const dy = (otherBrick.y + otherBrick.height / 2) - (brick.y + brick.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < explosionRadius) {
                    otherBrick.hit();
                }
            }
        });
    }

    showCombo(combo) {
        const comboDisplay = document.getElementById('combo-display');
        const comboValue = document.getElementById('combo-value');
        comboValue.textContent = combo;
        comboDisplay.classList.remove('combo-hidden');
        
        setTimeout(() => {
            comboDisplay.classList.add('combo-hidden');
        }, 1000);
    }

    loseLife() {
        this.lives--;
        this.soundManager.playSound('loseLife');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Reset ball attached to paddle
            this.ballAttached = true;
            this.paddle.x = this.canvas.width / 2;
            const ball = new Ball(
                this.paddle.x,
                this.paddle.y - this.paddle.height / 2 - 8 - 5,
                8,
                LEVELS[this.level].ballSpeed
            );
            ball.vx = 0;
            ball.vy = 0;
            this.balls.push(ball);
        }
    }

    levelComplete() {
        this.state = 'levelComplete';
        this.soundManager.playSound('levelComplete');
        
        // Calculate bonuses
        const accuracy = 100; // Simplified for now
        const timeBonus = 500;
        this.score += timeBonus;

        document.getElementById('accuracy').textContent = accuracy + '%';
        document.getElementById('time-bonus').textContent = '+' + timeBonus;
        document.getElementById('level-complete-overlay').classList.remove('hidden');
    }

    nextLevel() {
        this.level++;
        this.ballAttached = true;
        document.getElementById('level-complete-overlay').classList.add('hidden');
        this.loadLevel(this.level);
        this.state = 'playing';
        this.gameLoop();
    }

    gameOver() {
        this.state = 'gameOver';
        this.soundManager.playSound('gameOver');
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('neonBreakerHighScore', this.highScore.toString());
            this.updateHighScore();
        }

        document.getElementById('final-score').textContent = this.score;
        this.showScreen('game-over-screen');
    }

    win() {
        this.state = 'win';
        alert('Congratulations! You completed all levels!');
        this.gameOver();
    }

    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pause-overlay').classList.remove('hidden');
        }
    }

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pause-overlay').classList.add('hidden');
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    restart() {
        this.showScreen('start-screen');
        this.state = 'start';
    }

    buyLives() {
        // Telegram Stars payment integration
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showInvoice({
                title: 'Extra Lives',
                description: 'Get 3 extra lives to continue playing!',
                payload: 'extra_lives',
                currency: 'XTR',
                prices: [{ label: '3 Lives', amount: 1 }],
                photo_url: null
            }, (status) => {
                if (status === 'paid') {
                    this.lives = 3;
                    this.state = 'playing';
                    this.ballAttached = true;
                    this.showScreen('game-screen');
                    
                    // Reset ball attached to paddle
                    this.paddle.x = this.canvas.width / 2;
                    const ball = new Ball(
                        this.paddle.x,
                        this.paddle.y - this.paddle.height / 2 - 8 - 5,
                        8,
                        LEVELS[this.level].ballSpeed
                    );
                    ball.vx = 0;
                    ball.vy = 0;
                    this.balls.push(ball);
                    
                    this.gameLoop();
                }
            });
        } else {
            // Fallback for testing
            alert('Telegram Stars payment would be triggered here');
            this.lives = 3;
            this.state = 'playing';
            this.ballAttached = true;
            this.showScreen('game-screen');
            
            this.paddle.x = this.canvas.width / 2;
            const ball = new Ball(
                this.paddle.x,
                this.paddle.y - this.paddle.height / 2 - 8 - 5,
                8,
                LEVELS[this.level].ballSpeed
            );
            ball.vx = 0;
            ball.vy = 0;
            this.balls.push(ball);
            
            this.gameLoop();
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level + 1;
        
        const livesContainer = document.getElementById('lives');
        livesContainer.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const heart = document.createElement('span');
            heart.className = 'life-icon';
            heart.textContent = '❤️';
            livesContainer.appendChild(heart);
        }
    }

    updateHighScore() {
        document.getElementById('high-score').textContent = this.highScore;
    }

    showPowerUpNotification(powerUpType) {
        const notification = document.getElementById('powerup-notification');
        const icon = document.createElement('div');
        icon.className = 'powerup-notification-icon';
        icon.textContent = powerUpType.symbol;
        
        const title = document.createElement('div');
        title.className = 'powerup-notification-title';
        title.textContent = powerUpType.name;
        
        const desc = document.createElement('div');
        desc.className = 'powerup-notification-desc';
        desc.textContent = powerUpType.description;
        
        notification.innerHTML = '';
        notification.appendChild(icon);
        notification.appendChild(title);
        notification.appendChild(desc);
        
        notification.style.borderColor = powerUpType.color;
        notification.style.boxShadow = `0 0 30px ${powerUpType.color}`;
        
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2500);
    }

    updatePowerUpDisplay() {
        const container = document.getElementById('active-powerups');
        container.innerHTML = '';
        
        for (const [type, data] of this.activePowerUps.entries()) {
            const now = Date.now();
            const remaining = Math.max(0, data.endTime - now);
            const percentage = (remaining / data.duration) * 100;
            const seconds = Math.ceil(remaining / 1000);
            
            const indicator = document.createElement('div');
            indicator.className = 'powerup-indicator';
            indicator.style.borderColor = type.color;
            indicator.style.boxShadow = `0 0 20px ${type.color}`;
            
            const icon = document.createElement('div');
            icon.className = 'powerup-icon';
            icon.textContent = type.symbol;
            
            const timer = document.createElement('div');
            timer.className = 'powerup-timer';
            timer.textContent = seconds + 's';
            timer.style.color = type.color;
            
            const bar = document.createElement('div');
            bar.className = 'powerup-bar';
            
            const fill = document.createElement('div');
            fill.className = 'powerup-bar-fill';
            fill.style.width = percentage + '%';
            fill.style.background = `linear-gradient(90deg, ${type.color}, ${type.color})`;
            
            bar.appendChild(fill);
            indicator.appendChild(icon);
            indicator.appendChild(timer);
            indicator.appendChild(bar);
            container.appendChild(indicator);
        }
    }
}

// Initialize game
const game = new Game();