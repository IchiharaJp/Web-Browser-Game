
const config = {
    type: Phaser.AUTO,
    width: 1152,
    height: 648,
    parent: "mainDisplay",
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 300},
            debug: false,
        }
    }
}

let game = new Phaser.Game(config);
let player, cursors, outfit;
let isLeft = false;

function preload() {
    this.load.image("sky", "./assets/Clouds1/1.png");
    this.load.image("clouds1", "./assets/Clouds1/2.png");
    this.load.image("skyLine", "./assets/Clouds1/3.png");
    this.load.image("clouds2", "./assets/Clouds1/4.png");
    this.load.spritesheet("chara", "./assets/chara.png", { frameWidth: 24, frameHeight: 24 });
}

function create() { 
    this.add.image(576, 324, "sky").setScale(2);
    this.add.image(576, 324, "clouds1").setScale(2);
    this.add.image(576, 324, "skyLine").setScale(2);
    this.add.image(576, 324, "clouds2").setScale(2);

    player = this.physics.add.sprite(500, 300, "chara").setScale(2);
    cursors = this.input.keyboard.createCursorKeys();

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    const charaAni = new CharaAnimation("chara", this.anims);
    charaAni.setCharaAnimations();

}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play("left", true);
        isLeft = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play("right", true);
        isLeft = false;
    } else {
        player.setVelocityX(0);
        if (isLeft) player.anims.play("stopLeft", true);
        else player.anims.play("stopRight", true);
        
    }
// && player.body.touching.down
    if (cursors.up.isDown) {
        player.setVelocityY(-330);
        if (isLeft) player.anims.play("jumpLeft", true); 
        else player.anims.play("Right", true);
    }
}

class CharaAnimation {
    constructor(key, generator) {
        this.key = key;
        this.generator = generator;
    }

    createAnims(name, start, end, frameRate = 10, repeat = 0) {
        return {
            key: name,
            frames: this.generator.generateFrameNumbers(this.key, {start: start, end: end}),
            frameRate: frameRate,
            repeat: repeat
        }
    }

    setCharaAnimations() {
        this.generator.create(this.createAnims("left", 8, 15, 10, -1));
        this.generator.create(this.createAnims("right", 16, 23, 10, -1));
        this.generator.create(this.createAnims("stopLeft", 1, 1));
        this.generator.create(this.createAnims("stopRight", 3, 3));    
        this.generator.create(this.createAnims("jumpLeft", 0, 0));
        this.generator.create(this.createAnims("jumpRight", 2, 2));
    }
}