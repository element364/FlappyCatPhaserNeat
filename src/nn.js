import { Network, Neat, architect, methods } from "neataptic";

class NN {
  constructor(json = null, {
    inputSize = 5,
    outputSize = 1,
    popsize = 50,
    mutationRate = 0.3,
    elitismPercent = 0.3,
    startHiddenSize = 0
  } = {}) {
    this.neat = new Neat(inputSize, outputSize, null, {
      // mutation: methods.mutation.ALL,
      // mutation: methods.mutation.FFW,
      mutation: [
        methods.mutation.MOD_WEIGHT,
        methods.mutation.MOD_BIAS
      ],
      popsize,
      mutationRate,
      elitism: Math.round(elitismPercent * popsize),
      network: new architect.Perceptron(inputSize, inputSize + 2, outputSize)
      // network: new architect.Random(inputSize, startHiddenSize, outputSize)
    });

    if (json) {
      this.fromJSON(json);
    } else {
      for (let network of this.neat.population) {
        network.set({ squash: methods.activation.BIPOLAR_SIGMOID });
      } 
  
      for (let i = 0; i < 100; i++) {
        this.neat.mutate();
      }
    }
  }

  fromJSON(json) {
    this.neat.generation = json.generation;
    this.neat.population = json.population.map(brainJson => Network.fromJSON(brainJson));
  }

  toJSON() {
    return {
      generation: this.neat.generation,
      population: this.neat.population.map(brain => brain.toJSON())
    };
  }

  getPopulation() {
    return this.neat.population;
  }

  describe() {
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    let sum = 0;

    const population = this.getPopulation();

    for (let i = 0; i < population.length; i++) {
      min = Math.min(min, population[i].score);
      max = Math.max(max, population[i].score);
      sum += population[i].score;
    }

    return {
      generation: this.neat.generation,
      min,
      max,
      avg: sum / population.length
    };
  }

  endEvaluation() {
    this.neat.sort();

    const newPopulation = [];

    for (let i = 0; i < this.neat.elitism; i++) {
      newPopulation.push(this.neat.population[i]);
    }

    for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
      newPopulation.push(this.neat.getOffspring());
    }

    this.neat.population = newPopulation;
    this.neat.mutate();
    this.neat.generation++;
  }
}

export default NN;
