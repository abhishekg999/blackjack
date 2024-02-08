import { Deck, Hand, CARDS, CardValue, Card } from "./Deck";
import { IDealer, DefaultDealer } from "./Dealer";
import { listMultiply } from "./Utils";
import { IPlayer } from "./Player";

export enum BJOption {
    Hit,
    Stand,
    Double,
    Split,
}

export type BJDealerOption = Extract<BJOption, BJOption.Hit | BJOption.Stand>;

interface BlackjackConfig {
    deckCount: number;
    dealer: IDealer;
    blackjackPayout: number;
    tableMin: number;
    tableMax: number;
}

export const defaultBlackjackConfig: BlackjackConfig = {
    deckCount: 6,
    dealer: new DefaultDealer(),
    blackjackPayout: 3 / 2,
    tableMin: 0,
    tableMax: Infinity,
};

export class Blackjack {
    /* Static Methods */
    static getAllPossibleHandValues(hand: Hand): number[] {
        let aceCount = 0;
        let handValue = 0;
        for (let card of hand) {
            if (card.value === "A") {
                aceCount++;
                handValue += 11;
            } else if (["10", "J", "Q", "K"].includes(card.value)) {
                handValue += 10;
            } else {
                /* 2 - 9 */
                handValue += parseInt(card.value);
            }
        }
        let possibleValues = [handValue];
        while (aceCount > 0) {
            handValue -= 10;
            aceCount -= 1;
            possibleValues.push(handValue);
        }
        return possibleValues;
    }
    
    static evaluateHand(hand: Hand): number {
        let possibleValues = Blackjack.getAllPossibleHandValues(hand);
        // Get largest value that is less than or equal to 21
        // If no value is less than or equal to 21, return the smallest value
        let validValues = possibleValues.filter(value => value <= 21);
        let maxValidValue = Math.max(...validValues);
        let finalValue = validValues.length > 0 ? maxValidValue : Math.min(...possibleValues);
        return finalValue;
    }

    /* Instance */
    config: BlackjackConfig;
    deck: Deck;
    dealer: IDealer;
    players: IPlayer[];

    _count: number = 0;

    /* Instance Methods */
    constructor(config: BlackjackConfig) {
        this.config = config;
        this.deck = new Deck(listMultiply(CARDS, config.deckCount));
        this.dealer = config.dealer;
        this.players = [];

        this.deck.shuffle();
    }

    _dealCard(): Card {
        const card = this.deck.dealOneFaceUp();

        if (["10", "J", "Q", "K", "A"].includes(card.value)) {
            this._count -= 1;
        } else if (["2", "3", "4", "5", "6"].includes(card.value)) {
            this._count += 1;
        }

        return card;
    }

    _getCount(): number {
        return this._count / (this.deck.length() / 52);
    }

    addPlayer(player: IPlayer) {
        this.players.push(player);
    }

    preRoundInitialize() {
        if (this.deck.length() < (2 / 5) * this.config.deckCount * 52) {
            this.deck.reset();
            this.deck.shuffle();
        }
    }

    playRound() {
        this.preRoundInitialize();

        let playerBets: { [key: number]: number } = {};

        /* Get bets from players */
        for (let player_id in this.players) {
            // @ts-expect-error
            playerBets[player_id] = this.players[player_id].bet(this._getCount.bind(this));
        }

        const playerHands: { [key: number]: Hand } = {};
        const dealerHand: Hand = [];

        /* Deal cards */
        for (let player_id in this.players) {
            playerHands[player_id] = [this.deck.dealOneFaceUp()];
        }
        dealerHand.push(this.deck.dealOneFaceUp());
        for (let player_id in this.players) {
            playerHands[player_id].push(this.deck.dealOneFaceUp());
        }
        dealerHand.push(this.deck.dealOneFaceDown());

        /* Prompt each player their action until they stand, double, or bust */
        for (let player_id in this.players) {
            /* If player has immediate blackjack, payout with blackjackPayout multiplier */
            if (Blackjack.evaluateHand(playerHands[player_id]) == 21) {
                this.players[player_id].pay(playerBets[player_id]);
                this.players[player_id].pay(
                    playerBets[player_id] * this.config.blackjackPayout
                );
                playerBets[player_id] = 0;
                continue;
            }
            
            while (true) {
                // get the valid hand options this player can do
                const validHandOptions = this.getValidOptions(
                    playerHands[player_id]
                );

                // have the player make the choice
                const playerChoice = this.players[player_id].play(
                    playerHands[player_id],
                    dealerHand[0],
                    validHandOptions
                );

                // console.log(`Player Hand: ${playerHands[player_id].map((card) => card.value)} = ${Blackjack.evaluateHand(playerHands[player_id])} - ${BJOption[playerChoice]}`)


                this.updateHand(playerHands[player_id], playerChoice);

                if ([BJOption.Stand, BJOption.Double].includes(playerChoice)) {
                    break;
                }           

                if (Blackjack.evaluateHand(playerHands[player_id]) > 21) {
                    // take their money    
                    // console.log(`Player Hand: ${playerHands[player_id].map((card) => card.value)} = ${Blackjack.evaluateHand(playerHands[player_id])} - BUST`)                
                    playerBets[player_id] = 0;
                    break;
                }

            }

            if (Blackjack.evaluateHand(playerHands[player_id]) > 21) {
                // take their money
                playerBets[player_id] = 0;
                break;
            }
        }

        /* Now dealer action */
        while (true) {
            const dealerChoice = this.dealer.play(dealerHand);
            // console.log(`Dealer Hand: ${dealerHand.map((card) => card.value)} = ${Blackjack.evaluateHand(dealerHand)} - ${BJOption[dealerChoice]}`)
            this.updateHand(dealerHand, dealerChoice);

            if ([BJOption.Stand, BJOption.Double].includes(dealerChoice)) {
                break;
            }
        }

        const finalDealerHandValue = Blackjack.evaluateHand(dealerHand);

        /* Compare and payout */
        const dealerDidBust = finalDealerHandValue > 21;
        // TODO: Ideally this should be per hand
        for (let player_id in this.players) {
            if (dealerDidBust) {
                this.players[player_id].pay(playerBets[player_id]);
                this.players[player_id].pay(playerBets[player_id]);
            } else {
                const finalPlayerHandValue = Blackjack.evaluateHand(
                    playerHands[player_id]
                );
                if (finalPlayerHandValue > finalDealerHandValue) {
                    this.players[player_id].pay(playerBets[player_id]);
                    this.players[player_id].pay(playerBets[player_id]);
                } else if (finalPlayerHandValue === finalDealerHandValue) {
                    // TODO: For now just return the player bet, handle push later
                    this.players[player_id].pay(playerBets[player_id]);
                } else {
                    /* they lose the money */
                }
            }
        }
    }

    updateHand(hand: Hand, option: BJOption): void {
        switch (option) {
            case BJOption.Split:
                // TODO: NOT IMPLEMENTED
                break;
            case BJOption.Stand:
                break;
            case BJOption.Hit:
                hand.push(this.deck.dealOneFaceUp());
                break
            default:
                throw new Error("Invalid option");
        }
    }

    getValidOptions(hand: Hand): BJOption[] {
        let options = [BJOption.Stand];

        if (Blackjack.evaluateHand(hand) >= 21) {
            return options;
        }
        if (hand.length === 2) {
            if (hand[0].value == hand[1].value) {
                /// TODO: options.push(BJOption.Split);
            }
        }
        options.push(BJOption.Hit);
        return options;
    }
}
