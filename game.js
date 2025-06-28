
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
}

let game = new Phaser.Game(config);

function preload() {
    this.load.image("sky", "./assets/Clouds1/1.png");
    this.load.image("clouds1", "./assets/Clouds1/2.png");
    this.load.image("skyLine", "./assets/Clouds1/3.png");
    this.load.image("clouds2", "./assets/Clouds1/4.png");
}

function create() {
    this.add.image(576, 324, "sky").setScale(2);
    this.add.image(576, 324, "clouds1").setScale(2);
    this.add.image(576, 324, "skyLine").setScale(2);
    this.add.image(576, 324, "clouds2").setScale(2);
}

function update() {}