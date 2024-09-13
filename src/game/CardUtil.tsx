import { Pile, PlayingCard, SolitaireState, Suit, SuitColor } from "./GameTypes"


export type PileInfo = {
    pile: Pile,
    elem: HTMLElement,
    card?: PlayingCard
}


export class GameUtil {

    static shortSuit(suit: Suit) {
        switch (suit) {
            case "hearts": return "♥"
            case "diamonds": return "♦"
            case "clubs": return "♣"
            case "spades": return "♠"
        }
    }

    static getSuitColor(suit: Suit): SuitColor {
        switch (suit) {
            case "hearts": return "red"
            case "diamonds": return "red"
            case "clubs": return "black"
            case "spades": return "black"
        }
    }
    
    static cardToString(card?: PlayingCard) {
        return card && `${GameUtil.shortSuit(card.suit)}-${card.rank}`
    }
    
    static cardId(card: PlayingCard) {
        return `${card.suit.substring(0, 1)}_${card.rank}`
    }
    
    static cardToImage(card: PlayingCard) {
        let rank = card.rank as string;
        if (rank === "10") rank = "0"
        //return `https://deckofcardsapi.com/static/img/${rank.toUpperCase()}${card.suit[0].toUpperCase()}.png`
        return `cards/${rank.toUpperCase()}${card.suit[0].toUpperCase()}.png`
    }

    static findCardElement(element: HTMLElement) {
        while (element) {
            const v = element.getAttribute('data-card')
            if (v && v.length > 0) {
                return element
            }
            element = element.parentElement as HTMLElement
        }
        return null;
    }

    static findCardById(state: SolitaireState, id: string | null) {
        if (!id) {
            return undefined
        }
        {
            const card = state.stock.cards.find(c => GameUtil.cardId(c) == id)
            if (card) {
                return card
            }
        }
        {
            const card = state.waste.cards.find(c => GameUtil.cardId(c) == id)
            if (card) {
                return card
            }
        }
        for (const pile of state.stacks) {
            const card = pile.cards.find(c => GameUtil.cardId(c) == id)
            if (card) {
                return card
            }
        }
        for (const pile of state.tables) {
            const card = pile.cards.find(c => GameUtil.cardId(c) == id)
            if (card) {
                return card
            }
        }
        return undefined
    }

    static pileId(pile: Pile) {
        return `${pile.type}_${pile.index??-1}`
    }

    static findPileById(state: SolitaireState, id: string | null) {
        if (!id) {
            return undefined
        }
        if (GameUtil.pileId(state.stock) == id) {
            return state.stock
        }
        if (GameUtil.pileId(state.waste) == id) {
            return state.waste
        }
        for (const pile of state.stacks) {
            if (GameUtil.pileId(pile) == id) {
                return pile
            }
        }
        for (const pile of state.tables) {
            if (GameUtil.pileId(pile) == id) {
                return pile
            }
        }
        return undefined
    }

    static findPileForCard(state?: SolitaireState, card?: PlayingCard) {
        if (!state || !card) {
            return undefined
        }
        if (state.stock.cards.includes(card)) {
            return state.stock
        }
        if (state.waste.cards.includes(card)) {
            return state.waste
        }
        for (const pile of state.stacks) {
            if (pile.cards.includes(card)) {
                return pile
            }
        }
        for (const pile of state.tables) {
            if (pile.cards.includes(card)) {
                return pile
            }
        }
        return undefined
    }

    static intersectRect(r1: DOMRect, r2: DOMRect) {
        return !(
            r2.left > r1.right || 
            r2.right < r1.left || 
            r2.top > r1.bottom ||
            r2.bottom < r1.top)
    }

    static distanceBetweenCenters(p1: DOMRect, p2: DOMRect) {
        const x1 = p1.left + p1.width / 2
        const y1 = p1.top + p1.height / 2
        const x2 = p2.left + p2.width / 2
        const y2 = p2.top + p2.height / 2
        const dx = x1 - x2
        const dy = y1 - y2
        return Math.sqrt(dx * dx + dy * dy)
    }

    static findClosestPile(state: SolitaireState, container: HTMLDivElement, target: HTMLElement): PileInfo | undefined {
        //console.log("dragrect: " + dragrect.left + " " + dragrect.top + " " + dragrect.right + " " + dragrect.bottom)
        const dragrect = target.getBoundingClientRect()
        let candidate: PileInfo | undefined =  undefined
        let dist = Number.MAX_VALUE
        container.querySelectorAll("[data-pile]").forEach(e => {
            if (!(e instanceof HTMLElement)) {
                return
            }
            const elem = e as HTMLElement
            const pilerect = elem.getBoundingClientRect()
            const pileId = elem.getAttribute("data-pile")
            const pile = GameUtil.findPileById(state, pileId)
            if (!pile) {
                return
            }
            if (GameUtil.intersectRect(dragrect, pilerect)) {
                const currdist = GameUtil.distanceBetweenCenters(dragrect, pilerect)
                if (currdist < dist) {
                    dist = currdist
                    candidate = { pile, elem }
                }
            }
        })
        return candidate
    }

    static findClosestPileAndCard(state: SolitaireState, container: HTMLDivElement, target: HTMLElement, draggedCard?: PlayingCard) : PileInfo | undefined {
        //console.log("dragrect: " + dragrect.left + " " + dragrect.top + " " + dragrect.right + " " + dragrect.bottom)
        const dragrect = target.getBoundingClientRect()
        let candidate: PileInfo | undefined =  undefined
        let dist = Number.MAX_VALUE
        container.querySelectorAll("[data-card]").forEach(e => {
            if (!(e instanceof HTMLElement)) {
                return
            }
            const elem = e as HTMLElement
            if (elem == target) {
                return
            }
            if (!draggedCard) {
                return
            }
            const cardrect = elem.getBoundingClientRect()
            const cardId = elem.getAttribute("data-card")
            const card = GameUtil.findCardById(state, cardId)
            if (!card) {
                return
            }
            const cardPile = GameUtil.findPileForCard(state, card)
            const draggedPile = GameUtil.findPileForCard(state, draggedCard)
            if (card != draggedCard && draggedPile && draggedPile == cardPile) {
                const cardIndex = cardPile.cards.indexOf(card)
                const draggedIndex = cardPile.cards.indexOf(draggedCard)
                if (cardIndex > draggedIndex) {
                    return
                }
            }
            if (GameUtil.intersectRect(dragrect, cardrect)) {
                const currdist = GameUtil.distanceBetweenCenters(dragrect, cardrect)
                if (currdist < dist) {
                    dist = currdist
                    if (cardPile) { 
                        candidate = { pile: cardPile, elem, card }
                    }
                }
            }
        })
        if (!candidate) {
            candidate = GameUtil.findClosestPile(state, container, target)
        }
        return candidate
    }

}
