import { Card, Hand } from "./Deck";
import { BJOption, Blackjack } from "./Blackjack";
import _ from "underscore";

export interface IPlayer {
    money: number;

    bet(): number;
    pay(value: number): void;
    play(hand: Hand, dealerCard: Card, options: BJOption[]): BJOption 
}

export abstract class Player implements IPlayer {
    money: number;
    constructor(initialMoney: number) {
        this.money = initialMoney;
    }

    pay(value: number): void {
        this.money += value;
    }

    abstract bet(): number;
    abstract play(hand: Hand, dealerCard: Card, options: BJOption[]): BJOption;
}

export class RandomPlayer extends Player {
    constructor(initialMoney: number) {
        super(initialMoney);
    }

    bet(): number {
        const bet = 0.1 * this.money;
        this.money -= bet;
        return bet;
    }

    play(hand: Hand, dealerCard: Card, options: BJOption[]): BJOption {
        const playerOption = _.sample(options)!;
        return playerOption;
    }
}

export class RandomLoggingPlayer extends RandomPlayer {
    play(hand: Hand, dealerCard: Card, options: BJOption[]): BJOption {
        const playerOption = _.sample(options)!;
        console.log(
            `Player has ${Blackjack.evaluateHand(hand)}, player ${
                BJOption[playerOption]
            }`
        );
        return playerOption;
    }
}

export class InteractivePlayer extends Player {
    readlineSync: any;
    constructor(initialMoney: number) {
        super(initialMoney);
        this.readlineSync = require("readline-sync");
    }

    bet(): number {
        let bet = parseInt(
            this.readlineSync.question("How much do you want to bet: ")
        );
        this.money -= bet;
        return bet;
    }

    play(hand: Hand, dealerCard: Card, options: BJOption[]): BJOption {
        console.log(hand);
        console.log(`Hand value: ${Blackjack.evaluateHand(hand)}`);
        let option = this.readlineSync.question(
            `Pick an option (${options.map((x) => BJOption[x])}): `
        );
        switch (option) {
            case "Hit":
                return BJOption.Hit;
            case "Stand":
                return BJOption.Stand;
            case _:
                break;
        }
        return BJOption.Stand;
    }
}

export class BasicStrategyPlayer extends Player {
    constructor(initialMoney: number) {
        super(initialMoney);
    }

    bet(): number {
        const bet = 0.1 * this.money;
        this.money -= bet;
        return bet;
    }

    play(hand: Hand, dealerCard: Card, options: BJOption[]): BJOption {
        if (options.length == 1) {
            return options[0];
        }

        const playerValue = Blackjack.evaluateHand(hand);
        const dealerValue = Blackjack.evaluateHand([dealerCard]);

        if (playerValue >= 17) {
            return BJOption.Stand;
        } else if (playerValue <= 11) {
            return BJOption.Hit;
        } else {
            if (dealerValue >= 7) {
                return BJOption.Hit;
            } else {
                return BJOption.Stand;
            }
        }
    }
}
