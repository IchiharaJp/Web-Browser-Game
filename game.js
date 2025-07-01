import skyData from "./skies.js";

let config = {
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
            gravity: {y: 280},
            debug: false,
        }
    },
}

let mobileScreen =  { scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
}

if (mobileMode()) {
    config = {...config, ...mobileScreen};
}

let game = new Phaser.Game(config);
let player, cursors, platform, clouds, sky;
let isLeft = false;
let count = 0;
let speed = -100;
let skyType = 1;
let leftPressed = false, rightPressed = false, upPressed = false;

function mobileMode() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function preload() {
    this.load.image("land", "./assets/platform.png");
    this.load.spritesheet("chara", "./assets/chara.png", { frameWidth: 24, frameHeight: 24 });
    sky = new Sky(this);
    sky.loadImages();
}

function create() {
    sky.scope = this; 
    sky.createSky();

    player = this.physics.add.sprite(600, 300, "chara").setScale(2);
    cursors = this.input.keyboard.createCursorKeys();
    player.setBounce(0.3);
    player.setDepth(1);
    this.cameras.main.setBounds(0, 0, 2552, 2048);
    this.cameras.main.startFollow(player);
    platform = this.physics.add.group({ allowGravity: false, immovable: true });
    platform.create(600, 400, "land").setScale(0.5).refreshBody().setVelocityX(-50).setDepth(1);
    platform.create(1500, 500, "land").setScale(0.5).refreshBody().setVelocityX(-100).setDepth(1);
    platform.create(2100, 450, "land").setScale(0.5).refreshBody().setVelocityX(-100).setDepth(1);
    platform.create(2700, 400, "land").setScale(0.5).refreshBody().setVelocityX(-100).setDepth(1);
    this.time.addEvent({
        delay: 6000,
        callback: () => {
            platform.create(2700, Phaser.Math.Between(300, 500), "land")
            .setScale(0.5)
            .refreshBody()
            .setVelocityX(speed)
            .setDepth(1);
            count++;
            if (count > 2) {
                sky.deleteSky();
                skyType = (skyType % 8) + 1;
                sky.createSky();
                count = 0;
            }
        },
        loop: true,
    });

    this.physics.add.collider(player, platform);

    const charaAni = new CharaAnimation("chara", this.anims);
    charaAni.setCharaAnimations();

    // Mobile functions

    if (this.sys.game.device.input.touch) {
        let leftBtn = this.add.rectangle(75, 580, 70, 45, 0x006000, 0.6).setScrollFactor(0).setDepth(2).setInteractive();
        let rightBtn = this.add.rectangle(195, 580, 70, 45, 0x600000, 0.6).setScrollFactor(0).setDepth(2).setInteractive();
        let upBtn = this.add.rectangle(135, 523, 50, 70, 0x000060, 0.6).setScrollFactor(0).setDepth(2).setInteractive();
        let textStyle = {
            fontSize: "15px",
            color: "#ffffff",
            fontFamily: "Arial"
        }
        this.add.text(leftBtn.x, leftBtn.y, "left", textStyle).setDepth(3).setScrollFactor(0).setOrigin(0.5);
        this.add.text(rightBtn.x, rightBtn.y, "right", textStyle).setDepth(3).setScrollFactor(0).setOrigin(0.5);
        this.add.text(upBtn.x, upBtn.y, "jump", textStyle).setDepth(3).setScrollFactor(0).setOrigin(0.5);

        assignBtn(leftBtn, "left");
        assignBtn(rightBtn, "right");
        assignBtn(upBtn, "up");
    }

    function assignBtn(btn, direction) {
        btn.name = direction;
        btn.on("pointerdown", () => {
            if (btn.name == "left")
                leftPressed = true;
            else if (btn.name == "right")
                rightPressed = true;
            else
                upPressed = true;
        });
        btn.on("pointerup", () => {
            if (btn.name == "left")
                leftPressed = false;
            else if (btn.name == "right")
                rightPressed = false;
            else
                upPressed = false;
        });
        btn.on("pointerout", () => {
            if (btn.name == "left")
                leftPressed = false;
            else if (btn.name == "right")
                rightPressed = false;
            else
                upPressed = false;
        });
    }
}

function update() {
    if (cursors.left.isDown || leftPressed) {
        player.setVelocityX(-160);
        if (player.body.touching.down) player.anims.play("left", true);
        isLeft = true;
    } else if (cursors.right.isDown || rightPressed) {
        player.setVelocityX(160);
        if (player.body.touching.down) player.anims.play("right", true);
        isLeft = false;
    } else {
        player.setVelocityX(0);
        if (player.body.touching.down) {
            if (isLeft) player.anims.play("stopLeft", true);
            else player.anims.play("stopRight", true);
        }
        else {
            if (isLeft) player.anims.play("jumpLeft", true); 
            else player.anims.play("jumpRight", true);
        }
    }

    if (( cursors.up.isDown || upPressed ) && player.body.touching.down) {
        player.setVelocityY(-330);
        if (isLeft) player.anims.play("jumpLeft", true); 
        else player.anims.play("jumpRight", true);
    }

    clouds.children.iterate(cloud => {
        if (cloud.texture.key[0] == "c") {
            let match = skyData[skyType].find(data => 
                data.name == cloud.texture.key);
            if (match)
                cloud.x += match.speed;
        }
        if (cloud.x >= 1728) cloud.x -= 2304;
    });

    if (player.y > 650) {
        player.angle -= 2;
    }

    let toDestroy = [];
    platform.children.iterate(land => {
        if (land.x < 10) toDestroy.push(land);
    });
    toDestroy.forEach(land => land.destroy());

    if (player.y > 3000) this.scene.restart();
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

class Sky {
    constructor(preload) {
        this.preload = preload;
        this.clouds;
        this.scopes;
        this.bg = [];
    }

    set scope(scope) {
        this.scopes = scope;
    }

    loadImages() {
        for (let i = 1; i <= 8; i++)
            skyData[i].forEach(img => this.preload.load.image(img.name, img.path));
    }

    createSky() {
        this.clouds = this.scopes.physics.add.staticGroup();
        skyData[skyType].forEach(img => {
            if (img.speed > 0) {
                this.clouds.create(576, 324, img.name).setScale(2);
                this.clouds.create(-576, 324, img.name).setScale(2);
            } else {
                let skies = this.scopes.add.image(576, 324, img.name).setScale(2).setScrollFactor(0);
                this.bg.push(skies);
            }
        });
        this.clouds.children.iterate(cloud => {
            cloud.setScrollFactor(0);
        });
        clouds = this.clouds
    }

    deleteSky() {
        this.clouds.clear(true);
        this.bg.forEach(img => img.destroy());
    }
}
