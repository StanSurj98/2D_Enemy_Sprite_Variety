document.addEventListener("DOMContentLoaded", function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 800;

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
        console.log("Interval Passed, Enemy Spawned: ", this.enemies);
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
      // Passing (this) allows Enemy class access to all properties of Game class
      this.enemies.push(new Enemy(this));
    }
  }

  // ---- Enemy Factory
  class Enemy {
    constructor(game) {
      // Able to use all Game class properties
      this.game = game;
      console.log("Define Game instance 1st: ", this.game);
      // Initial starting spawns for enemies correspond to Game instance
      this.x = this.game.width;
      this.y = Math.random() * this.game.height;
      this.width = 100;
      this.height = 100;
      this.markedForDeletion = false;
    }

    // These update/draws handle SPECIFIC enemy instances
    update() {
      this.x--; // Temp moves left by 1px
      
      // When entire enemy width past screen, mark delete
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
      }
    }

    draw(ctx) {
      ctx.fillRect(this.x, this.y, this.width, this.height); // Temp square enemy
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
