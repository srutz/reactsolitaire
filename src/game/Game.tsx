import { createContext, Dispatch, ReactNode, useContext, useEffect, useReducer } from "react"
import { Suit, Pile, PlayingCard, SolitaireState, makeInitialState, Rank, Side } from "./GameTypes"
import { GameUtil } from "./CardUtil"
import { Util } from "../components/Util"
import Pako from "pako"
import { useSearchParams } from "react-router-dom"


/* helper to convert suit to index */
function suitToIndex(suit: Suit) {
    switch (suit) {
        case "clubs": return 0
        case "spades": return 1
        case "hearts": return 2
        case "diamonds": return 3
    }
}

/* helper to convert rank to index */
function rankToIndex(rank: Rank) {
    const a = rank == "10" ? "0" : rank
    return "A234567890JQK".indexOf(a)
}

function stackMoveAllowed(stack: Pile, card: PlayingCard) {
    if (stack.cards.length == 0) {
        if (card.rank == "A") {
            return true
        }
    } else {
        const topCard = stack.cards[stack.cards.length - 1]
        if (topCard.suit == card.suit) {
            const currRankIndex = rankToIndex(card.rank)
            const topRankIndex = rankToIndex(topCard.rank)
            if (currRankIndex == topRankIndex + 1) {
                return true
            }
        }
    }
    return false
}

function tableMoveAllowed(table: Pile, card: PlayingCard) {
    if (table.cards.length == 0) {
        return true
    } else {
        const topCard = table.cards[table.cards.length - 1]
        if (GameUtil.getSuitColor(topCard.suit) != GameUtil.getSuitColor(card.suit)) {
            const currRankIndex = rankToIndex(card.rank)
            const topRankIndex = rankToIndex(topCard.rank)
            if (currRankIndex == topRankIndex - 1) {
                return true
            }
        }
    }
    return false
}

function checkForWin(s: SolitaireState) {
    let completeStacks = 0
    const deckSize = s.stock.cards.length + s.waste.cards.length
        + s.tables.reduce((acc, p) => acc + p.cards.length, 0)
        + s.stacks.reduce((acc, p) => acc + p.cards.length, 0)
    for (const stack of s.stacks) {
        if (stack.cards.length == Math.floor(deckSize / 4)) {
            completeStacks++
        }
    }
    if (completeStacks == 4) {
        s.status = "won"
    }
}

export type FragementState = Pick<SolitaireState, "stock" | "waste" | "stacks" | "tables">

export type GameAction =
    | { type: "game-new" }
    | { type: "game-launched" }
    | { type: "game-stop" }
    | { type: "game-reset", stateFragment: FragementState }
    | { type: "draw-stock"; card: PlayingCard }
    | { type: "draw-waste"; card: PlayingCard }
    | { type: "draw-table"; card: PlayingCard, side: Side }
    | { type: "drop-table"; cards: PlayingCard[]; table: Pile }
    | { type: "empty-stock"; }
    ;

const gameReducer = (state: SolitaireState, action: GameAction) => {
    switch (action.type) {
        case "game-new": {
            const s = makeInitialState()
            s.status = "launching"
            return s
        }
        case "game-launched": {
            const s = { ...state }
            s.status = "running"
            return s
        }
        case "game-stop": {
            const s = makeInitialState()
            s.status = "stopped"
            return s
        }
        case "game-reset": {
            const s = makeInitialState()
            s.status = "running"
            s.stock = action.stateFragment.stock
            s.waste = action.stateFragment.waste
            s.stacks = action.stateFragment.stacks
            s.tables = action.stateFragment.tables
            return s
        }
        case "draw-stock": {
            const s = { ...state }
            const stockIndex = s.stock.cards.findIndex(c => c == action.card)
            if (stockIndex != -1 && stockIndex == s.stock.cards.length - 1) {
                s.stock.cards.splice(stockIndex, 1)
                action.card.side = "front"
                s.waste.cards.push(action.card)
            }
            checkForWin(s)
            return s
        }
        case "empty-stock": {
            const s = { ...state }
            if (s.stock.cards.length == 0) {
                s.stock.cards = s.waste.cards
                s.stock.cards.reverse()
                s.stock.cards.forEach(c => c.side = "back")
                s.waste.cards = []
            }
            checkForWin(s)
            return s
        }
        case "draw-waste": {
            const s = { ...state }
            const wasteIndex = s.waste.cards.findIndex(c => c == action.card)
            if (wasteIndex != -1 && wasteIndex == s.waste.cards.length - 1) {
                /* try to put on stack */
                const destinationStackIndex = suitToIndex(action.card.suit)
                const destinationStack = s.stacks[destinationStackIndex]
                let moveAllowed = stackMoveAllowed(destinationStack, action.card)
                if (moveAllowed) {
                    s.waste.cards.splice(wasteIndex, 1)
                    destinationStack.cards.push(action.card)
                }
            }
            checkForWin(s)
            return s
        }
        /* draw from a table, try to put "card" onto a stack if its the card's turn */
        case "draw-table": {
            const s = { ...state }
            const table = GameUtil.findPileForCard(s, action.card)
            if (table) {
                const tableIndex = table.cards.findIndex(c => c == action.card)
                if (tableIndex != -1 && tableIndex == table.cards.length - 1) {
                    if (action.side == "back") {
                        action.card.side = "front"
                    } else {
                        /* try to put on stack */
                        const destinationStackIndex = suitToIndex(action.card.suit)
                        const destinationStack = s.stacks[destinationStackIndex]
                        const moveAllowed = stackMoveAllowed(destinationStack, action.card)
                        if (moveAllowed) {
                            table.cards.splice(tableIndex, 1)
                            destinationStack.cards.push(action.card)
                        }
                    }
                }
            }
            checkForWin(s)
            return s
        }
        /* dropping several "cards" onto a table */
        case "drop-table": {
            console.assert(action.table?.type == "table", "drop-table: pile is not a table")
            const s = { ...state }
            const card = action.cards[0]
            const pile = GameUtil.findPileForCard(s, card)
            if (pile && pile != action.table && action.cards.length > 0) {
                const moveAllowed = tableMoveAllowed(action.table, action.cards[0])
                if (moveAllowed) {
                    const movedCards: PlayingCard[] = []
                    for (let i = 0; i < action.cards.length; i++) {
                        const curr = action.cards[i]
                        Util.removeElement(pile.cards, curr)
                        action.table.cards.push(curr)
                        movedCards.push(curr)
                    }
                }
            }
            checkForWin(s)
            return s
        }
        default:
            throw new Error()
    }
}

/*
 * Gamecontext, to provide the game state and dispatch function to all components.
 */
const GameContext = createContext<{ state: SolitaireState; dispatch: Dispatch<GameAction> } | null>(null);
const initialState = makeInitialState()

export function useGameContext() {
    return useContext(GameContext)
}

function data2urlsafe(bytes: Uint8Array) {
    let base64String = btoa(String.fromCharCode(...bytes))
    base64String = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    return base64String
}

function urlsafe2data(base64String: string) {
    base64String = base64String.replace(/-/g, '+').replace(/_/g, '/')
    while (base64String.length % 4) {
        base64String += '='
    }
    const binaryString = atob(base64String)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}

export function stateToExternalForm(s: SolitaireState) {
    const e = {
        stock: s.stock,
        waste: s.waste,
        stacks: s.stacks,
        tables: s.tables,
    }
    const external = JSON.stringify(e)
    const r = Pako.gzip(external)
    const urldata = data2urlsafe(r)
    //console.log(external.length, r.length, urldata.length)
    return urldata
}

export function Game({ children }: { children: ReactNode }) {
    const [ searchParams, setSearchParams ] = useSearchParams()
    const [state, dispatch] = useReducer(gameReducer, initialState)
    useEffect(() => {
        if (state.status === "running") {
            setSearchParams({ s: stateToExternalForm(state) })
        } else {
            setSearchParams({ })
        }
    }, [state])
    useEffect(() => {
        const externalstate = searchParams.get("s")
        console.log("apply state: " + externalstate)
        console.log(" curr state: " + stateToExternalForm(state))
        if (externalstate && externalstate != stateToExternalForm(state)) {
            const r = urlsafe2data(externalstate)
            const raw = Pako.ungzip(r, { to: "string" })
            const fragment = JSON.parse(raw) as FragementState
            dispatch({ type: "game-reset", stateFragment: fragment })
        }
    }, [searchParams])
    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    )
}
