let config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// New instance of Phaser.Game to set up game
let game = new Phaser.Game(config);
var bird;
let hasLanded = false;
let cursors;
let hasBumped = false;

let isGameStarted = false;
let messageToPlayer;

// Bring in images for app (background)
function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('road', 'assets/road.png');
    this.load.image('column', 'assets/column.png');
    this.load.spritesheet('bird', 'assets/bird.png', { 
        frameWidth: 64, 
        frameHeight: 96 
    });
}

// Generates elements that appear in game
function create() {
    const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    const roads = this.physics.add.staticGroup(); // Arcade Physics system in Phaser
    const topColumns = this.physics.add.staticGroup({
        key: 'column',
        repeat: 1,
        setXY: { x: 200, y: 0, stepX: 300 }
    });
    const bottomColumns = this.physics.add.staticGroup({
        key: 'column',
        repeat: 1,
        setXY: { x: 350, y: 400, stepX: 300 },
    });
    const road = roads.create(400, 568, 'road').setScale(2).refreshBody(); // doubles road size & lets physics work

    bird = this.physics.add.sprite(0, 50, 'bird').setScale(2); // dynamic body
    bird.setBounce(0.2); // bird slightly bounces if collides with anything
    bird.setCollideWorldBounds(true); // can bump screen edges, but can't go thru

    this.physics.add.overlap(bird, road, () => (hasLanded = true), null, this);
    this.physics.add.collider(bird, road); // bird lands on top of road

    this.physics.add.overlap(bird, topColumns, ()=>hasBumped=true,null, this);
    this.physics.add.overlap(bird, bottomColumns, ()=>hasBumped=true,null, this);
    this.physics.add.collider(bird, topColumns);
    this.physics.add.collider(bird, bottomColumns); // bird cannot pass thru column

    cursors = this.input.keyboard.createCursorKeys();

    // Instructions
    messageToPlayer = this.add.text(0, 0, `Instructions: Press space bar to start`, { fontFamily: '"Comic Sans MS", Times, serif', fontsize: "20px", color: "white", backgroundColor: "black" });
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);
}

// Updates the "bird" object in the game
function update() {
    if (cursors.space.isDown && !isGameStarted) {
        isGameStarted = true;
        messageToPlayer.text = 'Instructions: Press the "^" button to stay upright\nAnd don\'t hit the columns or ground';
    }

    // bird starts at top of screen
    if (!isGameStarted) {
        bird.setVelocityY(-160); 
    }

    // Move bird upwards
    if (cursors.up.isDown && !hasLanded && !hasBumped) {
        bird.setVelocityY(-160); 
    }


    // Move bird right if game started and it hasn't landed on or bumped into something
    // if(!hasLanded && !hasBumped) {
    //   bird.body.velocity.x = 50;
    // } else {
    //   bird.body.velocity.x= 0;
    // }

    if(isGameStarted && (!hasLanded || !hasBumped)) {
        bird.body.velocity.x = 50;
    } else {
        bird.body.velocity.x = 0;
    }

    if(hasLanded || hasBumped) {
        messageToPlayer.text = 'Oh no! You crashed!'
    }
    
    if(bird.x > 750) {
        bird.setVelocityY(40);
        messageToPlayer.text = 'Congrats! You won!'
    }
}