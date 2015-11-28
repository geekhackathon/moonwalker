'use strict';

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/mj.png', 32, 75);
    // game.load.audio('music', 'assets/music.ogg', 'assets/music.mp3');
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

// function preload(){
//     console.log(game);
//     // var music = game.add.audio('music');
//     // console.log(music);
//     // music.play();
// }

var createGround = function(platforms){
  var ground = platforms.create(0, game.world.height - 64, 'ground');
  ground.scale.setTo(2, 2);
  ground.body.immovable = true;
};

var createLedge = function(platformGroup, name, x, y){
  var createdLedge = platformGroup.create(x, y, 'ground');
  platformGroup.collapsable = platformGroup.collapsable || [];
  platformGroup.collapsable.push(createdLedge);
  createdLedge.body.immovable = true;
  createdLedge.body.checkCollision = {
    down: false
  }
};

var createPlayer = function(){
  var player = game.add.sprite(32, game.world.height - 200, 'dude');
  game.physics.arcade.enable(player);

  player.body.gravity.y = 500;

  player.animations.add('left', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 10, true);
  player.animations.add('right', [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 10, true);
  player.anchor.setTo(.5, 1);
  player.body.collideWorldBounds = true;
  // player.body.height *= 0.5;
  return player;
};

var createDeathStar = function(){
  var deathStar = game.add.sprite(Math.random() * game.world.width, -1500, 'star');
  deathStar.tint = 0x000000;
  // deathStar.scale.setTo(2,2);
  game.physics.arcade.enableBody(deathStar);
  // deathStar.body.immovable = true;
  // deathStar.enableBody = true;
  deathStar.body.gravity.y = 300;
  deathStar.body.bounce.y = 0.7 + Math.random() * 0.2;
  return deathStar;
};

var createStars = function(){
  var stars = game.add.group();
  stars.enableBody = true;
  for (var i = 0; i < 12; i++)
  {
      var star = stars.create(i * 70, 0, 'star');
      star.number = i;

      star.anchor.setTo(0.5, 0.5);
      star.body.gravity.y = 300 * Math.random();
      star.body.bounce.y = 0.7 + Math.random() * 0.2;
      star.body.angularVelocity = Math.random() * 300;
  }

  return stars;
};

function create() {
    // var music = game.add.audio('music');
    // // console.log(music);
    // music.play();

    game.physics.startSystem(Phaser.Physics.ARCADE);

    var sky = game.add.sprite(0, 0, 'sky');

    platforms = game.add.group();
    platforms.enableBody = true;

    createGround(platforms);

    createLedge(platforms, 'upper', game.world.width - 400, game.world.height - 200);
    createLedge(platforms, 'lower', -150, 250);

    player = createPlayer();
    // player.body.angularVelocity = 200;
    // console.log(player.body.height);
    // console.log(player.body.height /= 2);

    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    // lastStar = game.add.text(16, 48, 'Last Star: 0', { fontSize: '32px', fill: '#fff' });

    cursors = game.input.keyboard.createCursorKeys();
    cursors.jump = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    deathStar = createDeathStar();
    stars = createStars();
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
        element.scale.x = 1;
    },
    right: function(element, speed){
        element.body.velocity.x = speed;
        element.animations.play('right');
        element.scale.x = -1;
    },
    jump: function(element, speed){
        if (!element.body.touching.down)
            return;
        element.body.velocity.y = -speed * 3;
    }
};

function stop(element){
    element.animations.stop();
    element.frame = 0;
    element.body.velocity.x = 0;
};

function dispatch_movement(player, cursors){
    ['up', 'down', 'left', 'right', 'jump'].filter(function(direction){
        if (cursors[direction].isDown){
            move[direction](player, 150);
            return true;
        };
    }).length || stop(player);
}

function update() {

    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(deathStar, platforms);
    // game.physics.arcade.collide(player, ground);

    // player.body.velocity.x = 0;
    // player.body.velocity.y = 0;

    game.physics.arcade.overlap(player, deathStar, function(player, star){
        star.tint = 0xff0000;
        player.tint = 0x00ff00;
        // player.setAnchor(0.5, 0.5);
        // player.anchor.x = 0.5;
        // player.anchor.y = 1.5;

        // player.scale.setTo(3.5, 3.5);
        player.scale.x = 3;
        player.scale.y = 3;
        game.add.text(50, game.world.height/2, 'You won, now you are big and green!', { fontSize: '40px', fill: '#ffffff' });
        star.kill();
        // console.log(stars);
        stars.destroy();
        game.paused = true;
        // stars.children.forEach(function(star){
          // start.kill();
        // });
    });

    game.physics.arcade.collide(player, platforms, function(player, the_platform){
        // console.log(arguments);
        if (platforms.collapsable.indexOf(the_platform) == -1)
            return;
        // console.log(arguments);
        the_platform.tint = 0xff00ff;
        player.tint = 0xf0f000;
        // a.scale.setTo(1.5, 1.5);
        the_platform.body.immovable = false;
        // the_platform.body.gravity.y = 3000;
        // a.body.immovable = false;
        // a.immovable = false;
    });
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    dispatch_movement(player, cursors);


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
  player.tint = (0xffffff * Math.random() | 0);

  score += 10;
  scoreText.text = 'Score: ' + score;
  // lastStar.text = 'Last Star: ' + star.number;
}
