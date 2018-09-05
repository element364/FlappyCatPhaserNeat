import Phaser from "phaser";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, brain) {
    super(scene, x, y, texture);

    this.alpha = 0.2;
    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.brain = brain;
    this.brain.score = 0;

    this.debugGraphics = scene.add.graphics({
      lineStyle: { width: 2, color: 0x0000aa }
    });

    this.debugText = scene.add.text(x - 75, y - 25, "", {
      font: "14x Courier",
      fill: "#ff0000"
    });
  }

  getAction({ y, gapD, gapY, gapH, vY }) {
    const input = [
      y / 300,
      gapD / 600,
      gapY / 300,
      gapH / 300,
      (vY + 250) / 1000
    ];

    let activation = this.brain.activate(input);

    return activation > 0.5;
  }

  fly() {
    this.setVelocityY(-250);
  }

  getNearestColumnInfo() {
    let gapD = 600;
    let rows = [];

    for (let pipe of this.scene.pipes.getChildren()) {
      const distance = pipe.x - this.x;
      if (distance >= 0) {
        if (distance === gapD) {
          rows.push(pipe);
        }

        if (distance < gapD) {
          gapD = distance;
          rows = [pipe];
        }
      }
    }

    let gapH = 0;
    let gapY = 0;

    if (rows.length > 0) {
      for (let i = 1; i < rows.length; i++) {
        const h = rows[i].y - rows[i - 1].y + rows[i - 1].height;

        if (h > gapH) {
          gapH = h;
          gapY = rows[i - 1].y;
        }
      }
    }

    return {
      y: this.y,
      gapD,
      gapY,
      gapH,
      vY: this.body.velocity.y
    };
  }

  renderDebug(y, gapD, gapY, gapH, vY) {
    this.debugText.setPosition(this.x - 75, this.y - 25);
    this.debugText.setText([
      `y: ${y.toFixed(2)}`,
      `gD: ${gapD.toFixed(2)}`,
      `gY: ${gapY.toFixed(2)}`,
      `gH: ${gapH.toFixed(2)}`,
      `vY: ${vY.toFixed(2)}`
    ]);

    this.debugGraphics.clear();
    this.debugGraphics.strokeRectShape(
      new Phaser.Geom.Rectangle(
        this.x - this.displayWidth / 2,
        y - this.displayHeight / 2,
        this.displayWidth,
        this.displayHeight
      )
    );
    this.debugGraphics.strokeRectShape(
      new Phaser.Geom.Rectangle(this.x + gapD - 10, gapY + 17, 20, 75)
    );
  }

  kill(score) {
    this.brain.score = score;
    this.debugText.destroy();
    this.debugGraphics.destroy();
    this.destroy();
  }
}

export default Player;
