document.addEventListener("DOMContentLoaded", function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 800;
  // ---- Image resources
  const worm = new Image();
  worm.src = "./images/enemy_worm.png";

  // ---- Main Game Logic
  class Game {
    // !NOTE! Any new instance of this class always runs the constructor
    constructor(ctx, width, height) {
      this.ctx = ctx;
      this.width = width;
      this.height = height;
      // Holds ALL enemies for instance of a game
      this.enemies = [];
      // Want to spawn > 1 enemy, at this interval, spawn new
      this.enemyInterval = 1000;
      this.enemyTimer = 0;
    }

    // These update/draws handles background, enemies, resources etc.
    update(deltaTime) {
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);

      if (this.enemyTimer > this.enemyInterval) {
        this.#addNewEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }

      this.enemies.forEach((enemy) => {
        enemy.update();
      });
    }

    draw() {
      this.enemies.forEach((enemy) => {
        enemy.draw(this.ctx);
      });
    }

    // Private class method in JS | ONLY call-able inside Game class | call on Instantiation
    #addNewEnemy() {
      // Passing (this) allows Worm class access to all properties of Game class through its parent Enemy class
      // Worm < Enemy < Game
      this.enemies.push(new Worm(this));
    }
  }

  // ---- Enemy Factory
  class Enemy {
    constructor(game) {
      // Able to use all Game class properties
      this.game = game;
      this.markedForDeletion = false;
      this.frame = 0;
    }

    // These update/draws handle SPECIFIC enemy instances
    update() {
      this.x-= this.speed; // Temp moves left by 1px
      this.frame >= 5 ? (this.frame = 0) : this.frame++;

      // When entire enemy width past screen, mark delete
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
      }
    }

    draw(ctx) {
      ctx.drawImage(
        this.image,
        this.frame * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      ); // Temp draw entire sheet
    }
  }

  // ---- Worm | Child of Enemy
  class Worm extends Enemy {
    // !NOTE! super() in constructor runs its parent Enemy class' constructor FIRST
    constructor(game) {
      super(game);
      this.spriteWidth = 229;
      this.spriteHeight = 171;
      this.width = this.spriteWidth * 0.5;
      this.height = this.spriteWidth * 0.5;
      // Initial starting spawns for enemies correspond to Game instance
      this.x = this.game.width;
      this.y = Math.random() * this.game.height;
      this.image = worm;
      this.speed = Math.random() * 0.1 + 5;
    }
  }

  // ---- Game Instance
  const game = new Game(ctx, canvas.width, canvas.height);
  // Init val avoids undefined - reassigned each loop | For frame equalize /b/ bad & good PCs
  let lastTime = 1;

  // ---- Main Animation Loop -----
  function animate(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // -- Frame Timings
    // timeStamp built-in requestAnimationFrame();
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    // -- Invoke Game Methods
    // !NOTE! deltaTime caps enemy spawn at ~1000ms for all PCs
    game.update(deltaTime);
    game.draw();

    requestAnimationFrame(animate);
  }

  animate(0);
});
