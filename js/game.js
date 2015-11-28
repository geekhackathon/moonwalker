'use strict';

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/mj.png', 32, 75);
}

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;
var lastStar;
var deathStar;
var upperLedge;
var lowerLedge;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    var sky = game.add.sprite(0, 0, 'sky');

    platforms = game.add.group();
    platforms.enableBody = true;

    // movablePlatforms = game.add.group();

    var ground = platforms.create(0, game.world.height - 64, 'ground');

    ground.scale.setTo(2, 2);
    ground.body.immovable = true;

    upperLedge = platforms.create(game.world.width - 400, game.world.height - 200, 'ground');
    upperLedge.body.immovable = true;

    lowerLedge = platforms.create(-150, 250, 'ground');
    lowerLedge.body.immovable = true;

    player = game.add.sprite(32, game.world.height - 200, 'dude');
    game.physics.arcade.enable(player);

    // movablePlatforms.add(lowerLedge);
    // movablePlatforms.add(upperLedge);

    // player.body.bounce.y = 0.5;
    // player.body.bounce.x = 0.5;
    player.body.gravity.y = 300;


    player.body.collideWorldBounds = true;
    player.animations.add('left', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 10, true);
    player.animations.add('right', [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 10, true);


    stars = game.add.group();
    stars.enableBody = true;
    for (var i = 0; i < 12; i++)
    {
        var star = stars.create(i * 70, 0, 'star');
        star.number = i;

        //  Let gravity do its thing
        star.body.gravity.y = 300 * Math.random();

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    lastStar = game.add.text(16, 48, 'Last Star: 0', { fontSize: '32px', fill: '#fff' });

    cursors = game.input.keyboard.createCursorKeys();
    cursors.jump = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    var deathStarGroup = game.add.group();
    deathStarGroup.enableBody = true;

    deathStar = deathStarGroup.create(100, game.world.height - 200, 'star');
    deathStar.body.gravity.y = 300;
    deathStar.body.bounce.y = 0.7 + Math.random() * 0.2;
}

var move = {
    up: function(element, speed){
        // element.body.velocity.y = -speed;
    },
    down: function(element, speed){
        element.body.velocity.y = speed;
    },
    left: function(element, speed){
        element.body.velocity.x = -speed;
        element.animations.play('left');
    },
    right: function(element, speed){
        element.body.velocity.x = speed;
        element.animations.play('right');
    },
    jump: function(element, speed){
        element.body.velocity.y = -speed * 2;
    }
};

function stop(element){
    element.animations.stop();
    element.frame = 0;
    element.body.velocity.x = 0;
    // element.body.velocity.y = 0;
};

function dispath_movement(player, cursors){
    ['up', 'down', 'left', 'right', 'jump'].filter(function(direction){
        if (cursors[direction].isDown){
            move[direction](player, 150);
            return true;
        };
    }).length || stop(player);
}

function update() {

    // game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(deathStar, platforms);

    // player.body.velocity.x = 0;
    // player.body.velocity.y = 0;

    game.physics.arcade.overlap(player, deathStar, function(a, b){
        b.tint = 0xff0000;
        a.tint = 0x00ff00;
        a.scale.setTo(1.5, 1.5);
    });
    game.physics.arcade.overlap(player, platforms, function(a, b){
        console.log(arguments);
        // b.tint = 0xff0000;
        // a.tint = 0x00ff00;
        // a.scale.setTo(1.5, 1.5);
        b.body.immovable = false;
        a.body.immovable = false;
        // a.immovable = false;
    });
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    dispath_movement(player, cursors);
    console.log(cursors.jump.isDown)



//     if (cursors.left.isDown)
//     {
//         player.body.velocity.x = -150;
//         player.animations.play('left');
//     }
//     else if (cursors.right.isDown)
//     {
//         player.body.velocity.x = 150;
//         player.animations.play('right');
//     }
//     else if (cursors.down.isDown)
//     {
//         // player.scale.setTo(2, 2);
//         // console.log('down');
//         // player.body.velocity.y = 150;
//     }
//     else
//     {
//         player.body.velocity.x = 0;
//         // player.body.velocity.y = 0;
//     }

// //     // //  Allow the player to jump if they are touching the ground.
// //     // if (cursors.up.isDown)
//     if (cursors.up.isDown && player.body.touching.down)
//     {
//         player.body.velocity.y = -150;
//     }

}

function collectStar (player, star) {

    star.kill();

    score += 10;
    scoreText.text = 'Score: ' + score;
    lastStar.text = 'Last Star: ' + star.number;
}
