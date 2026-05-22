class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isSmiling = true;
    }

    preload() {
        this.load.image('purple_body', 'assets/purple_body_circle.png');
        this.load.image('smile', 'assets/face_smile_open_eye.png');
        this.load.image('frown', 'assets/face_frown_open_eye.png');
    }

    create() {
        const cx = 400;
        const cy = 300;

        this.body = this.add.image(cx, cy, 'purple_body').setInteractive();
        this.face = this.add.image(cx, cy, 'smile').setInteractive();

        const toggle = () => {
            this.isSmiling = !this.isSmiling;
            this.face.setTexture(this.isSmiling ? 'smile' : 'frown');
        };

        this.body.on('pointerdown', toggle);
        this.face.on('pointerdown', toggle);
    }
}
