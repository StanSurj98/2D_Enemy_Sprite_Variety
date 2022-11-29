document.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 800;

  // Main Game logic class will handle everything
  class Game {
    constructor() {
      // Holds ALL enemies for instance of a game
      this.enemies = [];
    }

    // These update/draws handles background, all enemies, resources etc.
    update() {}

    draw() {}

    // This is a private class method in JS - ONLY call-able inside Game class
    #addNewEnemy() {}
  }

  class Enemy {
    constructor() {}

    // These update/draws handle SPECIFIC enemy instances
    update() {}

    draw() {}
  }

  // Init val avoids undefined - gets reassigned each loop
  let lastTime = 1;
  // timeStamp built-in requestAnimationFrame();
  function animate(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Game code
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    requestAnimationFrame(animate);
  }

  animate(0);
});
