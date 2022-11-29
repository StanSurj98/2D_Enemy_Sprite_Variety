document.addEventListener("DOMContentLoaded", function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 800;
  // ---- Sprite Resources
  const worm = new Image();
  worm.src = "./images/enemy_worm.png";
  const ghost = new Image();
  ghost.src = "./images/enemy_ghost.png";
  const spider = new Image();
  spider.src = "./images/enemy_spider.png";

  // ---- Main Game Logic ----
  class Game {
    // !NOTE! Any new instance of this class always runs the constructor FIRST
    constructor(ctx, width, height) {
      this.ctx = ctx;
      this.width = width;
      this.height = height;
      // Holds ALL enemies for instance of a game
      this.enemies = [];
      // Interval for new Enemy spawns
      this.enemyInterval = 500;
      this.enemyTimer = 0;
      // Multiple enemy types
      this.enemyTypes = ["worm", "ghost", "spider"];
    }

    // Receives deltaTime from main animation loop
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
      // Randomize index position & find random enemies
      const randomIndex = Math.floor(Math.random() * this.enemyTypes.length);
      const randomEnemy = this.enemyTypes[randomIndex];
      // Generate that type & pass game instance as context
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

  // ---- Enemy Common Logic & Animations ----
  class Enemy {
    constructor(game) {
      // Access all Game class properties
      this.game = game;
      this.markedForDeletion = false;
      // Animation logic all here
      this.frameX = 0;
      this.maxFrame = 5; 
      this.frameInterval = 50;
      this.frameTimer = 0;
    }

    // update/draws for SPECIFIC enemy instances
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
    // !NOTE! super() runs its parent class' constructor or methods
    constructor(game) {
      super(game);
      this.image = worm;
      // Sprite FRAME dimensions
      this.spriteWidth = 229;
      this.spriteHeight = 171;
      // Scale on CANVAS dimensions
      this.width = this.spriteWidth * 0.5;
      this.height = this.spriteWidth * 0.5;
      // Spawn to right of canvas
      this.x = this.game.width;
      // Worms spawn only on "ground"
      this.y = this.game.height - this.height;
      this.velX = Math.random() * 0.1 + 0.1;
    }
    // !NOTE! When Game tries to find update() or draw(), keeps looking up parent class until it finds it
  }

  // ---- Spiders
  class Spider extends Enemy {
    constructor(game) {
      super(game);
      this.image = spider;
      this.spriteWidth = 310;
      this.spriteHeight = 175;
      this.width = this.spriteWidth * 0.35;
      this.height = this.spriteWidth * 0.35;
      // Spawn anywhere side to side on canvas but above canvas
      this.x = Math.random() * this.game.width;
      this.y = 0 - this.height;
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

      // deltaTime normalize for PCs, velocity is small
      this.y += this.velY * deltaTime;
      
      // Bounce up and down by reversing their direction at threshold
      if (this.y > this.maxDropDown) this.velY *= -1;

    }
    draw(ctx) {
      ctx.beginPath(); // New shape draw | particularly, a line
      ctx.moveTo(this.x + (this.width * 0.5), 0); // Where the line starts from
      // Offset by half the spider dimensions so the line is centered
      ctx.lineTo(this.x + (this.width * 0.5), this.y + (this.height * 0.5));
      ctx.stroke();
      super.draw(ctx);
    }
  }

  // ---- Ghosts
  class Ghost extends Enemy {
    constructor(game) {
      super(game);
      this.image = ghost;
      this.spriteWidth = 261;
      this.spriteHeight = 209;
      this.width = this.spriteWidth * 0.5;
      this.height = this.spriteWidth * 0.5;
      this.x = this.game.width;
      // Ghosts should only spawn in top half of canvas
      this.y = Math.random() * (this.game.height * 0.5);
      this.velX = Math.random() * 0.2 + 0.1;
      // Flying Pattern
      this.angle = 0;
      this.curve = Math.random() * 3;
    }
    update(deltaTime) {
      super.update(deltaTime);
      this.y += Math.sin(this.angle) + this.curve;
      this.angle += 0.3;
    }

    draw(ctx) {
      // "save" && "restore" snapshots canvas BEFORE running below code and restores it
      ctx.save();
      // Meaning -> ONLY ghosts will be affected by this global setting on spawn
      ctx.globalAlpha = 0.8; // BY ITSELF -> will affect all canvas properties
      super.draw(ctx) // AS IF -> Enemy.draw(ctx)
      ctx.restore();
    }
  }

  // ---- Game Instance
  const game = new Game(ctx, canvas.width, canvas.height);
  // Init val avoids undefined - reassigned each loop | Normalize frames /b/ bad & good PCs
  let lastTime = 1;

  // ---- Main Animation Loop -----
  function animate(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // -- Frame Timings
    // timeStamp built-in with requestAnimationFrame();
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    // -- Invoke Game Methods
    game.update(deltaTime);
    game.draw();

    requestAnimationFrame(animate);
  }

  animate(0);
});
