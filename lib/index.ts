import { Blackjack, defaultBlackjackConfig } from "./Blackjack";
import {
    RandomLoggingPlayer,
    InteractivePlayer,
    RandomPlayer,
    BasicStrategyPlayer,
} from "./Player";


const resultsPerRound = {
    wins: 0,
    losses: 0,
    pushes: 0,
};

const resultsPerGame = {
    wins: 0,
    losses: 0,
    pushes: 0,
};

const totalIterations = 10000;
const progressBarWidth = 40;

const playerInitMoney = 100000;
const numRoundsPerGame = 100;

for (let i = 0; i < totalIterations; i++) {
    const bj = new Blackjack(defaultBlackjackConfig);
    const player = new BasicStrategyPlayer(playerInitMoney);
    bj.addPlayer(player);

    for (let j = 0; j < numRoundsPerGame; j++) {
        let startingMoney = player.money;
        bj.playRound();

        if (player.money > startingMoney) {
            resultsPerRound.wins++;
        } else if (player.money < startingMoney) {
            resultsPerRound.losses++;
        } else {
            resultsPerRound.pushes++;
        }
    }

    if (player.money > playerInitMoney) {
        resultsPerGame.wins++;
    } else if (player.money < playerInitMoney) {
        resultsPerGame.losses++;
    } else {
        resultsPerGame.pushes++;
    }

    // Calculate progress percentage
    const progress = (i + 1) / totalIterations;
    const filledWidth = Math.round(progress * progressBarWidth);
    const emptyWidth = progressBarWidth - filledWidth;

    // Create progress bar string
    const progressBar =
        "[" + "#".repeat(filledWidth) + "-".repeat(emptyWidth) + "]";

    // Print progress bar on the same line
    process.stdout.write(
        `Progress: ${progressBar} ${Math.round(progress * 100)}%\r`
    );
}
console.log();

console.log("Results per round:");
console.log(resultsPerRound);
console.log(`Win rate: ${resultsPerRound.wins / (totalIterations*numRoundsPerGame)}`);
console.log(`Loss rate: ${resultsPerRound.losses / (totalIterations*numRoundsPerGame)}`);
console.log(`Push rate: ${resultsPerRound.pushes / (totalIterations*numRoundsPerGame)}`);

console.log("Results per game:");
console.log(resultsPerGame);
