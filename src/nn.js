import { Neat, architect, methods } from "neataptic";

class NN {
  constructor({
    inputSize = 5,
    outputSize = 1,
    popsize = 50,
    mutationRate = 0.3,
    elitismPercent = 0.1,
    startHiddenSize = 0
  } = {}) {
    console.log(`Input size = ${inputSize}`);

    this.neat = new Neat(inputSize, outputSize, null, {
      mutation: methods.mutation.ALL,
      popsize,
      mutationRate,
      elitism: Math.round(elitismPercent * popsize),
      network: new architect.Random(inputSize, startHiddenSize, outputSize)
    });

    for (let i = 0; i < 500; i++) {
      this.neat.mutate();
    }
  }

  startEvaluation() {
    return this.neat.population;
  }

  endEvaluation() {
    const res = {
      generation: this.neat.generation,
      averageScore: this.neat.getAverage()
    };

    this.neat.sort();
    const newPopulation = [];

    // Elitism
    for (let i = 0; i < this.neat.elitism; i++) {
      newPopulation.push(this.neat.population[i]);
    }

    // Breed the next individuals
    for (var i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
      newPopulation.push(this.neat.getOffspring());
    }

    // Replace the old population with the new population
    this.neat.population = newPopulation;
    this.neat.mutate();

    this.neat.generation++;

    return res;
  }
}

export default NN;
