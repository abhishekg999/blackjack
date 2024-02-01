import { Card, Deck } from "./Deck";

export function listMultiply<T>(list: T[], num: number): T[] {
    let retList: T[] = [];
    for (let i = 0; i < num; i++) {
        for (let j = 0; j < list.length; j++) {
            retList.push(list[j]);
        }
    }
    return retList;
}

/**
 * Moves a card that satisfies the condition at the top of the deck
 * 
 * @param deck The deck to rig
 * @param condition The condition of card to place at the top of the deck
 */
export function rigDeck(deck: Deck, condition: (card: Card) => boolean) {
    for (let i = 0; i < deck.cards.length; i++) {
        const card = deck.cards[i];
        if (condition(card)) {
            deck.cards.splice(i, 1);
            deck.cards.push(card);
            break;
        }
    }
}