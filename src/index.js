import "babel-polyfill";

import Phaser from "phaser";
import NyanCatGame from "./NyanCatGame";
import NN from "./nn";

const config = {
  parent: "game",
  type: Phaser.AUTO,
  width: 600,
  height: 300,
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: NyanCatGame
};

const gameEl = document.querySelector(`#${config.parent}`);
const game = new Phaser.Game(config);

if (module.hot) {
  module.hot.accept(() => {
    while (gameEl.firstChild) {
      gameEl.removeChild(gameEl.firstChild);
    }
    game.boot();
  });
}

let mainScene, nn;

game.events.on("gameready", () => {
  console.log("Running");
  mainScene = game.scene.scenes[0];

  nn = new NN();
  const brains = nn.startEvaluation();

  mainScene.restart(brains, 0, 0);
});

game.events.on("gameover", bestScore => {
  const { generation, averageScore } = nn.endEvaluation();

  const brains = nn.startEvaluation();
  mainScene.restart(brains, generation, averageScore);
});

window.game = game;
