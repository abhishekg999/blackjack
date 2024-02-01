import { BJDealerOption, BJOption, Blackjack } from "./Blackjack";
import { Hand } from "./Deck";

export type DealerConfig = object;

export interface IDealer {
    play(hand: Hand): BJDealerOption;
}

// Default Blackjack dealer, draws until they reach 17 or more.
export class DefaultDealer implements IDealer {
    play(hand: Hand): BJDealerOption {
        if (Blackjack.evaluateHand(hand) < 17) {
            return BJOption.Hit;
        }
        return BJOption.Stand;
    }
}
