class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Body assets — one per level
        this.load.image('purple_body_circle', 'assets/purple_body_circle.png');
        this.load.image('blue_body_circle', 'assets/blue_body_circle.png');
        this.load.image('green_body_square', 'assets/green_body_square.png');
        this.load.image('red_body_rhombus', 'assets/red_body_rhombus.png');
        this.load.image('yellow_body_rhombus', 'assets/yellow_body_rhombus.png');

        // Face assets — progression: smile → smile → grimace → frown → smile (victory)
        this.load.image('face_smile_1', 'assets/face_smile_open_eye.png');
        this.load.image('face_smile_2', 'assets/face_smile_open_eye_2.png');
        this.load.image('face_grimace', 'assets/face_grimace_open_eye.png');
        this.load.image('face_frown', 'assets/face_frown_open_eye.png');
        this.load.image('face_smile_3', 'assets/face_smile_open_eye_3.png');
    }

    create() {
        // --- Game State ---
        this.clicks = 0;
        this.totalClicks = 0;
        this.clickPower = 1;
        this.autoClickRate = 0;
        this.multiplier = 1;
        this.level = 1;
        this.gameWon = false;
        this.lastAutoClick = 0;

        // --- Level Configuration ---
        this.levelThresholds = [0, 50, 200, 500, 1000];
        this.bodies = [
            'purple_body_circle',
            'blue_body_circle',
            'green_body_square',
            'red_body_rhombus',
            'yellow_body_rhombus'
        ];
        this.faces = [
            'face_smile_1',
            'face_smile_2',
            'face_grimace',
            'face_frown',
            'face_smile_3'
        ];

        // --- Upgrade Definitions ---
        this.upgrades = {
            clickPower: {
                name: 'Click Power',
                desc: '+1 per click',
                baseCost: 10,
                costScale: 1.5,
                level: 0,
                maxLevel: 20
            },
            autoClick: {
                name: 'Auto Click',
                desc: '+1 click/sec',
                baseCost: 50,
                costScale: 2.0,
                level: 0,
                maxLevel: 10
            },
            multiplier: {
                name: 'Multiplier',
                desc: '+0.5x total gain',
                baseCost: 100,
                costScale: 2.5,
                level: 0,
                maxLevel: 5
            }
        };

        // --- Generate Particle Texture ---
        const gfx = this.make.graphics({ x: 0, y: 0 });
        gfx.fillStyle(0xffffff, 1);
        gfx.fillCircle(6, 6, 6);
        gfx.generateTexture('particle', 12, 12);
        gfx.destroy();

        // --- Build Scene ---
        this.faceX = 280;
        this.faceY = 320;
        this.createFace();
        this.createParticleEmitter();
        this.createUI();
    }

    // === FACE / BODY ===

    createFace() {
        this.bodyImage = this.add.image(this.faceX, this.faceY, this.bodies[0]).setInteractive();
        this.faceImage = this.add.image(this.faceX, this.faceY, this.faces[0]).setInteractive();

        this.bodyImage.on('pointerdown', () => this.onFaceClick());
        this.faceImage.on('pointerdown', () => this.onFaceClick());

        // Hover effect
        const over = () => {
            if (!this.gameWon) {
                this.bodyImage.setScale(1.05);
                this.faceImage.setScale(1.05);
            }
        };
        const out = () => {
            this.bodyImage.setScale(1);
            this.faceImage.setScale(1);
        };
        this.bodyImage.on('pointerover', over);
        this.bodyImage.on('pointerout', out);
        this.faceImage.on('pointerover', over);
        this.faceImage.on('pointerout', out);
    }

    updateFace() {
        this.bodyImage.setTexture(this.bodies[this.level - 1]);
        this.faceImage.setTexture(this.faces[this.level - 1]);
    }

    // === PARTICLES ===

    createParticleEmitter() {
        this.emitter = this.add.particles(this.faceX, this.faceY, 'particle', {
            speed: { min: 100, max: 250 },
            scale: { start: 0.7, end: 0 },
            lifespan: { min: 300, max: 600 },
            quantity: 10,
            emitting: false,
            blendMode: 'ADD',
            tint: [0xff6600, 0xffcc00, 0xff3300, 0xff9900]
        });
    }

    // === UI ===

    createUI() {
        const font = 'Fredoka, Arial, sans-serif';

        // Score
        this.scoreText = this.add.text(this.faceX, 30, 'Clicks: 0', {
            fontFamily: font, fontSize: '28px', fontStyle: 'bold', color: '#333333'
        }).setOrigin(0.5);

        // Level
        this.levelText = this.add.text(this.faceX, 60, 'Level 1 / 5', {
            fontFamily: font, fontSize: '18px', color: '#666666'
        }).setOrigin(0.5);

        // Stats
        this.statsText = this.add.text(this.faceX, 85, 'Power: 1  |  Auto: 0/s  |  x1.0', {
            fontFamily: font, fontSize: '13px', color: '#999999'
        }).setOrigin(0.5);

        // --- Upgrade Panel ---
        const px = 630;
        const py = 80;

        this.add.rectangle(px, 330, 260, 460, 0xf5f5fa, 0.95)
            .setStrokeStyle(2, 0xcccccc);

        this.add.text(px, py, 'UPGRADES', {
            fontFamily: font, fontSize: '20px', fontStyle: 'bold', color: '#333366'
        }).setOrigin(0.5);

        // Buttons
        this.upgradeButtons = {};
        this.upgradeCostTexts = {};
        this.upgradeLevelTexts = {};
        this.upgradeDescTexts = {};

        let y = py + 50;
        const spacing = 100;

        for (const [key, up] of Object.entries(this.upgrades)) {
            // Button background
            const btn = this.add.rectangle(px, y + 25, 230, 65, 0xe0e0ff, 0.85)
                .setStrokeStyle(1, 0x9999cc)
                .setInteractive({ useHandCursor: true });

            const nameText = this.add.text(px, y + 5, up.name, {
                fontFamily: font, fontSize: '15px', fontStyle: 'bold', color: '#333366'
            }).setOrigin(0.5);

            const costText = this.add.text(px - 50, y + 25, '', {
                fontFamily: font, fontSize: '12px', color: '#666699'
            }).setOrigin(0, 0.5);

            const levelText = this.add.text(px + 50, y + 25, '', {
                fontFamily: font, fontSize: '12px', color: '#666699'
            }).setOrigin(1, 0.5);

            const descText = this.add.text(px, y + 42, up.desc, {
                fontFamily: font, fontSize: '11px', color: '#999999'
            }).setOrigin(0.5);

            this.upgradeButtons[key] = btn;
            this.upgradeCostTexts[key] = costText;
            this.upgradeLevelTexts[key] = levelText;
            this.upgradeDescTexts[key] = descText;

            btn.on('pointerdown', () => this.buyUpgrade(key));
            btn.on('pointerover', () => {
                if (!this.gameWon) btn.setFillStyle(0xd0d0ff, 1);
            });
            btn.on('pointerout', () => btn.setFillStyle(0xe0e0ff, 0.85));

            y += spacing;
        }

        // Win text (hidden)
        this.winText = this.add.text(this.faceX, 180, '', {
            fontFamily: font, fontSize: '48px', fontStyle: 'bold',
            color: '#ff6600', stroke: '#ffffff', strokeThickness: 4
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        this.updateUI();
    }

    updateUI() {
        const font = 'Fredoka, Arial, sans-serif';

        this.scoreText.setText(`Clicks: ${Math.floor(this.clicks)}`);
        this.levelText.setText(`Level ${this.level} / 5`);
        this.statsText.setText(
            `Power: ${this.clickPower}  |  Auto: ${this.autoClickRate}/s  |  x${this.multiplier.toFixed(1)}`
        );

        for (const [key, up] of Object.entries(this.upgrades)) {
            const cost = this.getUpgradeCost(key);
            const canAfford = this.clicks >= cost && up.level < up.maxLevel && !this.gameWon;
            const maxed = up.level >= up.maxLevel;

            this.upgradeCostTexts[key].setText(
                maxed ? 'MAXED' : `Cost: ${Math.floor(cost)}`
            );
            this.upgradeLevelTexts[key].setText(`Lv: ${up.level}/${up.maxLevel}`);

            const btn = this.upgradeButtons[key];
            btn.setAlpha(canAfford ? 1 : (maxed ? 0.4 : 0.55));
            btn.setFillStyle(canAfford ? 0xe0e0ff : 0xdddddd, canAfford ? 0.85 : 1);
        }
    }

    // === GAME LOGIC ===

    onFaceClick() {
        if (this.gameWon) return;

        const gain = this.clickPower * this.multiplier;
        this.clicks += gain;
        this.totalClicks += gain;

        // Particle burst
        this.emitter.explode(10);

        // Squish animation
        this.tweens.add({
            targets: [this.bodyImage, this.faceImage],
            scaleX: 1.15, scaleY: 1.15,
            duration: 80, yoyo: true, ease: 'Quad.easeOut'
        });

        // Floating +N text
        const ft = this.add.text(
            this.faceX + Phaser.Math.Between(-30, 30),
            this.faceY - 90,
            `+${Math.floor(gain)}`,
            { fontFamily: 'Fredoka, Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#ff6600' }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: ft, y: ft.y - 60, alpha: 0,
            duration: 800, ease: 'Cubic.easeOut',
            onComplete: () => ft.destroy()
        });

        this.updateUI();
        this.checkLevel();
    }

    buyUpgrade(key) {
        const up = this.upgrades[key];
        const cost = this.getUpgradeCost(key);

        if (this.clicks < cost || up.level >= up.maxLevel || this.gameWon) return;

        this.clicks -= cost;
        up.level++;

        // Apply effect
        if (key === 'clickPower') this.clickPower = 1 + up.level;
        if (key === 'autoClick') this.autoClickRate = up.level;
        if (key === 'multiplier') this.multiplier = 1 + up.level * 0.5;

        // Flash feedback
        const btn = this.upgradeButtons[key];
        this.tweens.add({
            targets: btn, alpha: 0.4, duration: 50, yoyo: true
        });

        this.updateUI();
    }

    getUpgradeCost(key) {
        const up = this.upgrades[key];
        return Math.floor(up.baseCost * Math.pow(up.costScale, up.level));
    }

    checkLevel() {
        let newLevel = 1;
        for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
            if (this.totalClicks >= this.levelThresholds[i]) {
                newLevel = i + 1;
                break;
            }
        }

        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateFace();

            // Level-up pop
            this.tweens.add({
                targets: [this.bodyImage, this.faceImage],
                scaleX: 1.3, scaleY: 1.3,
                duration: 200, yoyo: true, ease: 'Back.easeOut'
            });

            // Level-up banner
            const banner = this.add.text(this.faceX, 200, `LEVEL ${this.level}!`, {
                fontFamily: 'Fredoka, Arial, sans-serif',
                fontSize: '36px', fontStyle: 'bold',
                color: '#00cc00', stroke: '#ffffff', strokeThickness: 3
            }).setOrigin(0.5).setDepth(50);

            this.tweens.add({
                targets: banner, y: 150, alpha: 0,
                duration: 1500, ease: 'Cubic.easeOut',
                onComplete: () => banner.destroy()
            });

            // Win condition
            if (this.level >= 5) {
                this.gameWon = true;
                this.winText.setText('YOU WIN!').setVisible(true);
                this.tweens.add({
                    targets: this.winText, scale: 1.2,
                    duration: 500, yoyo: true, repeat: -1
                });
            }
        }
    }

    // === UPDATE LOOP ===

    update(time, delta) {
        // Auto-click every second
        if (this.autoClickRate > 0 && !this.gameWon) {
            if (time - this.lastAutoClick >= 1000) {
                const gain = this.autoClickRate * this.multiplier;
                this.clicks += gain;
                this.totalClicks += gain;
                this.lastAutoClick = time;
                this.updateUI();
                this.checkLevel();
            }
        }
    }
}
