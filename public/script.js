document.addEventListener("DOMContentLoaded", function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 800;
  // ---- Image resources
  const worm = new Image();
  worm.src = "./images/enemy_worm.png";
  const ghost = new Image();
  ghost.src = "./images/enemy_ghost.png";
  const spider = new Image();
  spider.src = "./images/enemy_spider.png";

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
      this.enemyInterval = 500;
      this.enemyTimer = 0;
      // Multiple enemies
      this.enemyTypes = ["worm", "ghost", "spider"];
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
        enemy.update(deltaTime);
      });
    }

    draw() {
      this.enemies.forEach((enemy) => {
        enemy.draw(this.ctx);
      });
    }

    // Private class method in JS | ONLY call-able inside Game class | call on Instantiation
    #addNewEnemy() {
      // Randomize index position 
      const randomIndex = Math.floor(Math.random() * this.enemyTypes.length);
      // Find random enemy in array
      const randomEnemy = this.enemyTypes[randomIndex];
      // Generate that enemy type
      if (randomEnemy === "worm") this.enemies.push(new Worm(this));
      else if (randomEnemy === "ghost") this.enemies.push(new Ghost(this));
      else if (randomEnemy === "spider") this.enemies.push(new Spider(this));

      // ---- No longer needed since some fly some don't ----
      // "Layering" effect | here, enemies @ top canvas appears "behind" ones @ bottom
      // this.enemies.sort((a, b) => {
      //   return a.y - b.y;
      // });
    }
  }

  // ---- Enemy Factory
  class Enemy {
    constructor(game) {
      // Able to use all Game class properties
      this.game = game;
      this.markedForDeletion = false;
      // Animation logic all here
      this.frameX = 0;
      this.maxFrame = 5; 
      this.frameInterval = 50;
      this.frameTimer = 0;
    }

    // These update/draws handle SPECIFIC enemy instances
    update(deltaTime) {
      this.x -= this.velX * deltaTime;

      // When entire enemy width past screen, mark delete
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
      }

      if (this.frameTimer > this.frameInterval) {
        this.frameX < this.maxFrame ? this.frameX++ : this.frameX = 0;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
    }

    draw(ctx) {
      ctx.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0, // srcY can stay hardcoded at 0, spriteSheet only has 1 row
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  // ---- Worms
  class Worm extends Enemy {
    // !NOTE! super() in constructor runs its parent Enemy class' constructor FIRST
    constructor(game) {
      super(game);
      // Sprite FRAME dimensions
      this.spriteWidth = 229;
      this.spriteHeight = 171;
      // On CANVAS dimensions
      this.width = this.spriteWidth * 0.5;
      this.height = this.spriteWidth * 0.5;
      // Spawn to right of canvas
      this.x = this.game.width;
      // Worms spawn only on "ground"
      this.y = this.game.height - this.height;
      this.image = worm;
      this.velX = Math.random() * 0.1 + 0.1;
    }
    // !NOTE! When Game tries to find update() or draw(), it keeps looking up parent class until it finds it
  }

  // ---- Spiders
  class Spider extends Enemy {
    constructor(game) {
      super(game);
      this.spriteWidth = 310;
      this.spriteHeight = 175;
      this.width = this.spriteWidth * 0.35;
      this.height = this.spriteWidth * 0.35;
      // Spawn anywhere side to side on canvas but above canvas
      this.x = Math.random() * this.game.width;
      this.y = 0 - this.height;
      this.image = spider;
      this.velX = 0;
      this.velY = Math.random() * 0.1 + 0.1;
      // Randomize how far each spider drops down
      this.maxDropDown = Math.random() * this.game.height;
    }
    update(deltaTime) {
      super.update(deltaTime);
      // !NOTE! Spiders START at (0 - this.height), ONLY DELETE at (0 - this.height * 2)
      if (this.y < 0 - this.height * 2) {
        this.markedForDeletion = true;
      }
      // deltaTime normalize for PCs so makesure the velocity is small
      this.y += this.velY * deltaTime;
      // Make them bounce up and down by reversing their direction at threshold
      if (this.y > this.maxDropDown) this.velY *= -1;

    }
    draw(ctx) {
      ctx.beginPath(); // New shape draw
      ctx.moveTo(this.x + (this.width * 0.5), 0); // Where the line starts from
      // Offset by half the spider dimensions so the line is centered
      ctx.lineTo(this.x + (this.width * 0.5), this.y + (this.height * 0.5));
      ctx.stroke();
      super.draw(ctx);

    }
  }

  // ---- Ghosts
  class Ghost extends Enemy {
    // !NOTE! super() in constructor runs its parent Enemy class' constructor FIRST
    constructor(game) {
      super(game);
      this.spriteWidth = 261;
      this.spriteHeight = 209;
      this.width = this.spriteWidth * 0.5;
      this.height = this.spriteWidth * 0.5;
      this.x = this.game.width;
      // Ghosts should only spawn in top half of canvas
      this.y = Math.random() * (this.game.height * 0.5);
      this.image = ghost;
      this.velX = Math.random() * 0.2 + 0.1;
      // Flying Pattern
      this.angle = 0;
      this.curve = Math.random() * 2;
    }
    update(deltaTime) {
      super.update(deltaTime);
      this.y += Math.sin(this.angle) + this.curve;
      this.angle += 0.04;
    }

    draw(ctx) {
      // SAVE && RESTORE -> snapshots canvas BEFORE running below code and restores it
      ctx.save();
      // Meaning -> ONLY ghosts will be affected by this global setting on spawn
      ctx.globalAlpha = 0.8; // BY ITSELF -> affects all canvas properties
      // Want the DEFAULT draw() method from Enemy class && something unique to Ghosts!
      super.draw(ctx) // AS IF -> Enemy.draw(ctx)
      ctx.restore();
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
