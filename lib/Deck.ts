import _ from "underscore";

export type CardValue =
    | "A"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "J"
    | "Q"
    | "K";

export type CardSuit = "Clubs" | "Hearts" | "Spades" | "Diamonds";
export type Card = {
    value: CardValue;
    suit: CardSuit;
};
export type Hand = Card[];

export const VALUES: CardValue[] = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
];
export const suit: CardSuit[] = ["Clubs", "Hearts", "Spades", "Diamonds"];

export const CARDS: Card[] = VALUES.flatMap((value) =>
    suit.map((suit) => ({ value, suit }))
);

function validateCard(card: Card): boolean {
    const { value, suit } = card;
    return VALUES.includes(value) && suit.includes(suit);
}

export class Deck {
    private initDeck: Card[];
    cards: Card[];

    private dealOne(): Card {
        if (this.cards.length < 1) {
            throw new Error(`Not enough cards in the deck to deal.`);
        }
        return this.cards.pop()!;
    }

    constructor(cards: Card[] = CARDS) {
        this.initDeck = cards;
        this.reset();
    }

    length(): number {
        return this.cards.length;
    }

    shuffle(): void {
        this.cards = _.shuffle(this.cards);
    }

    dealOneFaceUp(): Card {
        return this.dealOne();
    }

    dealOneFaceDown(): Card {
        // TODO: Players will not know this card, other than that not much difference
        return this.dealOne();
    }

    putBack(card: Card): void {
        if (!validateCard(card)) {
            throw new Error("Trying to put back an invalid card.");
        }
        this.cards.push(card);
    }

    reset(): void {
        this.cards = [...this.initDeck];
    }
}
