import { Blackjack, defaultBlackjackConfig } from "./Blackjack";
import {
    RandomLoggingPlayer,
    InteractivePlayer,
    RandomPlayer,
    BasicStrategyPlayer,
    CardCounter,
} from "./Player";


const resultsPerRound = {
    wins: 0,
    losses: 0,
    pushes: 0,
};


const progressBarWidth = 40;

const playerInitMoney = 100000;
const numRoundsPerGame = 100;


const bj = new Blackjack(defaultBlackjackConfig);
const player = new CardCounter(playerInitMoney);
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

    // Calculate progress percentage
    const progress = (j + 1) / numRoundsPerGame;
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
console.log(`Win rate: ${resultsPerRound.wins / (numRoundsPerGame)}`);
console.log(`Loss rate: ${resultsPerRound.losses / (numRoundsPerGame)}`);
console.log(`Push rate: ${resultsPerRound.pushes / (numRoundsPerGame)}`);

console.log(`Final money: ${player.money}`);
console.log(`Money change: ${player.money - playerInitMoney}`);
