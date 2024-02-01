import { Blackjack, defaultBlackjackConfig } from "./Blackjack";
import { RandomLoggingPlayer, InteractivePlayer, RandomPlayer, BasicStrategyPlayer } from "./Player";

const results = {
    wins: 0,
    losses: 0,
    pushes: 0
}

const totalIterations = 10000;
const progressBarWidth = 40;

for (let i = 0; i < totalIterations; i++) {
    const bj = new Blackjack(defaultBlackjackConfig);
    const player = new BasicStrategyPlayer(100000);
    // console.log("Player starts with: ", player.money);
    bj.addPlayer(player);
    bj.playRound();

    // console.log("Player ends with: ", player.money);
    
    if (player.money > 100000) {
        results.wins++;
    } else if (player.money < 100000) {
        results.losses++;
    } else {
        results.pushes++;
    }

    // Calculate progress percentage
    const progress = (i + 1) / totalIterations;
    const filledWidth = Math.round(progress * progressBarWidth);
    const emptyWidth = progressBarWidth - filledWidth;

    // Create progress bar string
    const progressBar = "[" + "#".repeat(filledWidth) + "-".repeat(emptyWidth) + "]";

    // Print progress bar on the same line
    process.stdout.write(`Progress: ${progressBar} ${Math.round(progress * 100)}%\r`);
}
console.log()
console.log(results);

console.log(`Win rate: ${results.wins / totalIterations * 100}%`);
console.log(`Loss rate: ${results.losses / totalIterations * 100}%`);
console.log(`Push rate: ${results.pushes / totalIterations * 100}%`);
