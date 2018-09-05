import "babel-polyfill";
import Vue from 'vue/dist/vue';
import Phaser from "phaser";
import NyanCatGame from "./NyanCatGame";
import NN from "./nn";
import { drawGraph } from './graph/graph';

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

const leaderboardVue = new Vue({
  el: '#leaderboard',
  data() {
    return {
      players: []
    };
  },
  template: `
    <div id="leaderboard">
      <div
        v-for="(player, index) in players"
        :key="index"
        class="row"
      >
        <div class="column">{{ index }}</div>
        <div class="column">{{ player.score }}</div>
        <div class="column"><button @click="draw(index)">Draw</button></div>
      </div>
    </div>
  `,
  methods: {
    draw(index) {
      console.log(index);
      const graph = nn.neat.population[index].graph(600, 300);
      drawGraph(graph, '.draw');
    }
  }
});

window.leaderboardVue = leaderboardVue;

function renderPopulation(population) {
  leaderboardVue.players = population.map(item => ({ score: item.score || 0 }));
}

game.events.on("gameready", () => {
  mainScene = game.scene.scenes[0];

  nn = new NN();
  window.nn = nn;
  const brains = nn.getPopulation();
  renderPopulation(nn.getPopulation());

  mainScene.restart(brains, 0, 0);
});

game.events.on("gameover", bestScore => {
  renderPopulation(nn.getPopulation());

  const { generation, averageScore } = nn.endEvaluation();
  
  const brains = nn.getPopulation();
  
  mainScene.restart(brains, generation, averageScore);
});

window.game = game;