import Phaser from "phaser";
import nyan from "../assets/nyan.png";
import nayn from "../assets/nayn.png";
import Player from "./Player";

class NyanCatGame extends Phaser.Scene {
  preload() {
    this.load.image("nyan", nyan);
    this.load.image("nayn", nayn);
  }

  createColumnNayn() {
    const missing = this.generator.integerInRange(1, 5);
    // const missing = this.prev ? 1 : 5
    this.prev = !this.prev;

    for (let i = 0; i < 8; i++) {
      if (i !== missing && i !== missing + 1) {
        const ball = this.pipes
          .create(550, 20 + i * 37, "nayn")
          .setScale(0.1, 0.2)
          .setCollideWorldBounds(true)
          .setVelocityX(-150);

        ball.body.onWorldBounds = true;
      }
    }
  }

  flyAll() {
    const ppp = this.players.getChildren();

    for (let player of ppp) {
      player.fly();
    }
  }

  restart({ brains, generation, averageScore, human = false } = {}) {
    this.timeEvent.paused = true;

    this.generation = generation;
    this.averageScore = averageScore;

    for (
      let first = this.pipes.getFirstAlive();
      first;
      first = this.pipes.getFirstAlive()
    ) {
      first.destroy();
    }

    this.score = 0;
    this.scoreText.setText(`Score: 0`);

    for (let brain of brains) {
      const player = new Player(this, 100, 200, "nyan", brain).setScale(0.5);
      this.players.add(player);
    }

    if (human) {
      this.players.add(new Player(this, 100, 200, 'nyan', { human }).setScale(0.5));
    }

    const ppp = this.players.getChildren();

    for (let i = 0; i < ppp.length; i++) {
      ppp[i].setPosition(100, 200)
        .setGravityY(1000)
        .setVelocityY(0);
    }

    this.timeEvent.paused = false;
  }

  onWorldBounds(body) {
    body.gameObject.destroy();
  }

  killPlayer(player) {
    player.kill(this.score);
  }

  create() {
    this.prev = false;
    this.generator = new Phaser.Math.RandomDataGenerator();

    this.pipes = this.physics.add.group();
    this.players = this.physics.add.group();
    this.physics.add.overlap(
      this.players,
      this.pipes,
      this.killPlayer,
      null,
      this
    );

    this.scoreText = this.add.text(0, 0, `Score: 0`, {
      fontSize: "16px",
      fill: "#fff"
    });
    this.bestScoreText = this.add.text(0, 16, `Best score: 0`, {
      fontSize: "16px",
      fill: "#fff"
    });

    this.camera = this.cameras.add(0, 0, 600, 300);
    this.camera.setBackgroundColor("#4ac3cd");

    this.timeEvent = this.time.addEvent({
      delay: 1250,
      callback: this.createColumnNayn,
      callbackScope: this,
      loop: true,
      paused: true
    });

    this.score = 0;
    this.bestScore = 0;

    this.physics.world.setBoundsCollision(true, false, false, false);
    this.physics.world.on("worldbounds", this.onWorldBounds);

    this.infoText = this.add.text(520, 5, "", {
      font: "14x Courier",
      fill: "#0000ff"
    });

    this.sys.game.events.emit("gameready");
  }

  update() {
    const activePointer = this.input.activePointer;
    const cursorKeys = this.input.keyboard.createCursorKeys();
    const alivePlayers = this.players.getChildren();

    for (let player of alivePlayers) {
      if (player.y < 0 || player.y > 300) {
        this.killPlayer(player);
      } else {
        const { y, gapD, gapY, gapH, vY } = player.getNearestColumnInfo();

        // player.renderDebug(y, gapD, gapY, gapH, vY);

        if (player.brain.human) {
          if (
            cursorKeys.up.isDown ||
            cursorKeys.space.isDown ||
            activePointer.isDown
          ) {
            player.fly();
          }
        } else {
          const action = player.getAction({ y, gapD, gapY, gapH, vY });

          if (action) {
            player.fly();
          }
        }
      }
    }

    const aliveNumber = this.players.getChildren().length;

    this.infoText.setText([
      `FPS: ${this.sys.game.loop.actualFps.toFixed(2)}`,
      `Players: ${aliveNumber}`,
      `Generation: ${this.generation}`,
      `Score: ${this.averageScore}`
    ]);

    if (!this.timeEvent.paused) {
      if (aliveNumber === 0) {
        if (this.score > this.bestScore) {
          this.bestScore = this.score;
          this.bestScoreText.setText(`Best score: ${Math.round(this.bestScore)}`);
        }
  
        this.timeEvent.paused = true;
        this.sys.game.events.emit("gameover", this.score);
      } else {
        this.score += 1;
        this.scoreText.setText(`Score: ${Math.round(this.score)}`);
      }
    }
  }
}

export default NyanCatGame;
