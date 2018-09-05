import { Neat, architect, methods } from "neataptic";

class NN {
  constructor({
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
      network: new architect.Perceptron(inputSize, inputSize, outputSize)
      // network: new architect.Random(inputSize, startHiddenSize, outputSize)
    });

    for (let i = 0; i < 100; i++) {
      this.neat.mutate();
    }
  }

  getPopulation() {
    return this.neat.population;
  }

  endEvaluation() {
    const res = {
      generation: this.neat.generation,
      averageScore: this.neat.getAverage()
    };

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

    return res;
  }
}

export default NN;
