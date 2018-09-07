import Phaser from "phaser";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, brain) {
    super(scene, x, y, texture);

    this.alpha = 0.75;
    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.brain = brain;
    this.brain.score = 0;

    this.debugGraphics = scene.add.graphics({
      lineStyle: { width: 2, color: 0x0000aa }
    });
  }

  getAction({y, fGapX, fGapTopY, fGapBotY, bGapX, bGapTopY, bGapBotY, vY}) {
    const input = [
      y / 300,
      fGapX / 600,
      fGapTopY / 300,
      fGapBotY / 300,
      bGapX / 600,
      bGapTopY / 300,
      bGapBotY / 300,
      (vY + 250) / 1000
    ];

    let activation = this.brain.activate(input);

    return activation > 0.5;
  }

  fly() {
    this.setVelocityY(-250);
  }

  extractGap(row, forward) {
    let gapH = 0;
    let x = forward ? 600 : 0, topY = 300, botY = 300;

    if (row.length > 0) {
      for (let i = 1; i < row.length; i++) {
        const h = row[i].y - row[i - 1].y + row[i - 1].height;

        if (h > gapH) {
          gapH = h;
          x = row[i].x;
          topY = row[i - 1].y;
          botY = row[i].y;
        }
      }
    }

    return {
      x, topY, botY
    };
  }

  getState() {
    let gapFD = 600;
    let gapBD = 600;

    let rowsF = [], rowsB = [];

    for (let pipe of this.scene.pipes.getChildren()) {
      const distance = pipe.x - this.x;

      if (distance > 0) {
        // forward
        if (distance === gapFD) {
          rowsF.push(pipe);
        }

        if (distance < gapFD) {
          gapFD = distance;
          rowsF = [pipe];
        }
      } else {
        // back
        if (distance === gapBD) {
          rowsB.push(pipe);
        }

        if (distance < gapBD) {
          gapBD = distance;
          rowsB = [pipe];
        }
      }
    }

    const fGap = this.extractGap(rowsF, true);
    const bGap = this.extractGap(rowsB, false);

    return {
      y: this.y,
      fGapX: fGap.x,
      fGapTopY: fGap.topY,
      fGapBotY: fGap.botY,
      bGapX: bGap.x,
      bGapTopY: bGap.topY,
      bGapBotY: bGap.botY,
      vY: this.body.velocity.y
    };
  }

  renderDebug({y, fGapX, fGapTopY, fGapBotY, bGapX, bGapTopY, bGapBotY, vY}) {
    this.debugGraphics.clear();
    
    this.debugGraphics.strokeCircle(this.x, y, 20);
    
    this.debugGraphics.strokeCircle(fGapX, fGapTopY, 20);
    this.debugGraphics.strokeCircle(fGapX, fGapBotY, 20);
    this.debugGraphics.strokeCircle(bGapX, bGapTopY, 20);
    this.debugGraphics.strokeCircle(bGapX, bGapBotY, 20);

    this.debugGraphics.lineStyle(3, 0x2ECC40);
    this.debugGraphics.beginPath()
    this.debugGraphics.moveTo(this.x, y);
    this.debugGraphics.lineTo(fGapX, fGapTopY);
    this.debugGraphics.moveTo(this.x, y);
    this.debugGraphics.lineTo(fGapX, fGapBotY);
    this.debugGraphics.moveTo(this.x, y);
    this.debugGraphics.lineTo(bGapX, bGapTopY);
    this.debugGraphics.moveTo(this.x, y);
    this.debugGraphics.lineTo(bGapX, bGapBotY);
    this.debugGraphics.closePath();
    this.debugGraphics.strokePath();
  }

  kill(score) {
    this.brain.score = score;
    this.debugGraphics.destroy();
    this.destroy();
  }
}

export default Player;
