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
let populationsData = [];

const chartData = {
  labels: [],
  datasets: [
    {
      name: 'Max',
      values: []
    },
    {
      name: 'Average',
      values: []
    }
  ]
};

let chart;

function redrawChart() {
  chartData.labels = populationsData.map(p => p.generation.toString());
  chartData.datasets[0].values = populationsData.map(p => p.max);
  chartData.datasets[1].values = populationsData.map(p => p.avg);

  chart.update(chartData)
}

const leaderboardVue = new Vue({
  el: '#leaderboard',
  data() {
    return {
      players: []
    };
  },
  template: `
    <div id="leaderboard">
      <button @click="resetBestScore">Reset</button>
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
    resetBestScore() {
      localStorage.removeItem('populations');
      localStorage.removeItem('nn');
      location.reload();
    },
    draw(index) {
      const graph = nn.neat.population[index].graph(600, 300);
      drawGraph(graph, '.draw');
    }
  }
});

window.leaderboardVue = leaderboardVue;

game.events.on("gameready", () => {
  chart = new frappe.Chart('#chart', {
    title: 'generation score history',
    type: 'line',
    height: 200,
    data: chartData
  })

  mainScene = game.scene.scenes[0];  

  nn = new NN();
  window.nn = nn;

  const populationsJson = localStorage.getItem('populations');
  if (populationsJson) {
    populationsData = JSON.parse(populationsJson);
    redrawChart();
  }

  const nnJson = localStorage.getItem('nn');
  if (nnJson) {
    nn.fromJSON(JSON.parse(nnJson));
    nn.endEvaluation();
  }

  const brains = nn.getPopulation();
  
  leaderboardVue.players = brains.map(item => ({ score: item.score || 0 }));
  mainScene.restart({ brains, generation: 0, averageScore: 0 });
});

game.events.on("gameover", bestScore => {
  leaderboardVue.players = nn.getPopulation().map(item => ({ score: item.score || 0 }));

  const { generation, max, avg, min } = nn.describe();

  populationsData = [
    ...populationsData,
    { generation, max, avg, min }
  ];

  redrawChart();

  if (generation > 0 && generation % 500 === 0) {
    // Dump and reload
    localStorage.setItem('populations', JSON.stringify(populationsData));
    localStorage.setItem('nn', JSON.stringify(nn.toJSON()));
    location.reload();
    return;
  }

  nn.endEvaluation();
  const brains = nn.getPopulation();
  
  mainScene.restart({ brains, generation: generation, averageScore: avg });
});

window.game = game;