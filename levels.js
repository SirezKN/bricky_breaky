const BRICK_TYPES = {
    NORMAL: { health: 1, color: '#ff006e', points: 10 },
    HARD: { health: 2, color: '#8338ec', points: 20 },
    METAL: { health: 3, color: '#3a86ff', points: 30 },
    GOLD: { health: 1, color: '#ffd700', points: 50, powerUp: true },
    EXPLOSIVE: { health: 1, color: '#ff4500', points: 40, explosive: true }
};

const POWER_UPS = {
    MULTI_BALL: { 
        color: '#00ff00', 
        duration: 0, 
        symbol: '⚡',
        name: 'Multi Ball',
        description: 'Splits all balls into 3!'
    },
    WIDE_PADDLE: { 
        color: '#ff00ff', 
        duration: 10000, 
        symbol: '↔',
        name: 'Wide Paddle',
        description: 'Paddle width increased by 50%'
    },
    SLOW_BALL: { 
        color: '#00ffff', 
        duration: 8000, 
        symbol: '🐌',
        name: 'Slow Motion',
        description: 'Ball speed reduced by 30%'
    },
    FIRE_BALL: { 
        color: '#ff4500', 
        duration: 12000, 
        symbol: '🔥',
        name: 'Fire Ball',
        description: 'Ball destroys bricks in one hit!'
    },
    CATCH: { 
        color: '#ffff00', 
        duration: 15000, 
        symbol: '🧲',
        name: 'Magnetic Paddle',
        description: 'Ball sticks to paddle on contact'
    }
};

const LEVELS = [
    // Level 1 - Introduction
    {
        name: "Neon Beginning",
        bricks: [
            "0000000000",
            "NNNNNNNNNN",
            "NNNNNNNNNN",
            "0000000000",
            "GGGGGGGGGG"
        ],
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%)',
        ballSpeed: 6,
        paddleSpeed: 12
    },
    
    // Level 2 - Pattern Play
    {
        name: "Zigzag Zone",
        bricks: [
            "N0N0N0N0N0",
            "0N0N0N0N0N",
            "N0N0N0N0N0",
            "0N0N0N0N0N",
            "HHHHHHHHHH"
        ],
        background: 'radial-gradient(ellipse at center, #16213e 0%, #0a0a0a 100%)',
        ballSpeed: 6.5,
        paddleSpeed: 13
    },
    
    // Level 3 - Hard Introduction
    {
        name: "Purple Fortress",
        bricks: [
            "HHHHHHHHHH",
            "NNNNNNNNNN",
            "HHHHHHHHHH",
            "NNNNNNNNNN",
            "0G0G0G0G0G"
        ],
        background: 'radial-gradient(ellipse at center, #2a0845 0%, #0a0a0a 100%)',
        ballSpeed: 7,
        paddleSpeed: 14
    },
    
    // Level 4 - Metal Mayhem
    {
        name: "Metal Madness",
        bricks: [
            "MMMMMMMMMM",
            "NNNNNNNNNN",
            "HHHHHHHHHH",
            "NNNNNNNNNN",
            "EEEEEEEEEE"
        ],
        background: 'radial-gradient(ellipse at center, #1e3c72 0%, #0a0a0a 100%)',
        ballSpeed: 7.5,
        paddleSpeed: 15
    },
    
    // Level 5 - Diamond Pattern
    {
        name: "Diamond Dreams",
        bricks: [
            "000HHH0000",
            "00HHHHH000",
            "0HHHMHHH00",
            "HHHMMMMHHH",
            "0HHHGHHH00",
            "00HHHHH000",
            "000HHH0000"
        ],
        background: 'radial-gradient(ellipse at center, #3a0845 0%, #0a0a0a 100%)',
        ballSpeed: 8,
        paddleSpeed: 16
    },
    
    // Level 6 - Explosive Introduction
    {
        name: "Blast Zone",
        bricks: [
            "ENENENENENE",
            "NNNNNNNNNNN",
            "HHHHHHHHHH",
            "NNNNNNNNNNN",
            "MEMEMEMEME"
        ],
        background: 'radial-gradient(ellipse at center, #4a0e0e 0%, #0a0a0a 100%)',
        ballSpeed: 8.5,
        paddleSpeed: 17
    },
    
    // Level 7 - Rainbow Rampage
    {
        name: "Rainbow Rampage",
        bricks: [
            "MMMMMMMMMM",
            "HHHHHHHHHH",
            "NNNNNNNNNN",
            "GGGGGGGGGG",
            "EEEEEEEEEE",
            "HHHHHHHHHH",
            "MMMMMMMMMM"
        ],
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        ballSpeed: 9,
        paddleSpeed: 18
    },
    
    // Level 8 - Fortress of Doom
    {
        name: "Fortress of Doom",
        bricks: [
            "MMMMMMMMMM",
            "M00000000M",
            "M0HHHHHH0M",
            "M0H0000H0M",
            "M0H0GG0H0M",
            "M0H0000H0M",
            "M0HHHHHH0M",
            "M00000000M",
            "MMMMMMMMMM"
        ],
        background: 'radial-gradient(ellipse at center, #2d0a4e 0%, #0a0a0a 100%)',
        ballSpeed: 9.5,
        paddleSpeed: 19
    },
    
    // Level 9 - Chaos Chamber
    {
        name: "Chaos Chamber",
        bricks: [
            "MEMEMEMEME",
            "EMHMHMHMHE",
            "MHMGMGMGHM",
            "EHMNMNMNHE",
            "MHMEMEMEHM",
            "EMHMHMHMHE",
            "MEMEMEMEME"
        ],
        background: 'radial-gradient(ellipse at center, #4e0a0a 0%, #0a0a0a 100%)',
        ballSpeed: 10,
        paddleSpeed: 20
    },
    
    // Level 10 - Final Challenge
    {
        name: "Neon Nightmare",
        bricks: [
            "MMMMMMMMMM",
            "MEHEHEHEME",
            "MHMMMMMHME",
            "MHMGGGMHME",
            "MHMGMGMHME",
            "MHMGGGMHME",
            "MHMMMMMHME",
            "MEHEHEHEME",
            "MMMMMMMMMM",
            "EEEEEEEEEE"
        ],
        background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #4a0e4e 100%)',
        ballSpeed: 11,
        paddleSpeed: 20
    }
];

// Convert brick characters to brick types
function getBrickType(char) {
    switch(char) {
        case 'N': return BRICK_TYPES.NORMAL;
        case 'H': return BRICK_TYPES.HARD;
        case 'M': return BRICK_TYPES.METAL;
        case 'G': return BRICK_TYPES.GOLD;
        case 'E': return BRICK_TYPES.EXPLOSIVE;
        case '0': return null;
        default: return null;
    }
}