/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react"
import { useGameContext } from "./Game"
import { useWindowSize } from "../hooks/WindowSize"
import { PileRenderer } from "./PileRenderer"
import { GameUtil } from "./CardUtil"
import { Pile, PileType, PlayingCard, SolitaireState } from "./GameTypes"
import { StampedBanner } from "../components/StampedBanner"
import { AnimatedHand } from "./AnimatedHand"

/*
const SIZE_SCALE = 1.25
export const XGAP = 12 * SIZE_SCALE
export const CARD_WIDTH = Math.floor(80 * SIZE_SCALE)
export const CARD_HEIGHT = Math.floor(110 * SIZE_SCALE)
*/

export type Geometry = {
    scale: number
    xgap: number
    cardWidth: number
    cardHeight: number
}

export function makeGeometry(scale: number) {
    return {
        scale: scale,
        xgap: Math.floor(scale * 16),
        cardWidth: Math.floor(scale * 100),
        cardHeight: Math.floor(scale * 138),
    } 

}

export function getStackingDistance(scale: number, pileType: PileType) {
    switch (pileType) {
        case "table": return Math.floor(scale * 20) 
        case "stack": return Math.floor(scale * 4)
        case "stock": return Math.floor(scale * 3)
        case "waste": return Math.floor(scale * 3)
    }
}

export type Size = {
    width: number
    height: number
}

export type RendererContextType = {
    draggedCard?: PlayingCard
    allDraggedCards: PlayingCard[]
    dragPosition?: { x: number, y: number }
    destinationPile?: Pile
    geometry: Geometry
    availableSize: Size
}

function computeAllDraggedCards(state: SolitaireState, card: PlayingCard) {
    if (!card) {
        return []
    }
    const r: PlayingCard[] = []
    const pile = GameUtil.findPileForCard(state, card)
    if (pile?.type == "table") {
        const index = pile.cards.indexOf(card)
        if (index != -1) {
            for (let i = index, n = pile.cards.length; i < n; i++) {
                r.push(pile.cards[i])
            }
        }
    } else {
        r.push(card)
    }
    return r
}



export const RendererContext = createContext<RendererContextType | null>(null)

export function useRendererContext() {
    return useContext(RendererContext)
}


function BannerPanel({ children }: { children?: ReactNode }) {
    return (
        <div className="absolute inset-0 h-screen bg-gradient-to-r from-gray-500 to-gray-800 animate-fade-in">
            <AnimatedHand ></AnimatedHand>
            { false &&
            <img src="images/805.jpg" alt="Background Image" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            }
            <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-white text-center text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase">
                    {children}
                </h1>
            </div>
        </div>)
}

function OverlayPanel({ children }: { children?: ReactNode }) {
    return (
        <div className="absolute inset-0 h-screen bg-black bg-opacity-60">
            <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-white text-center text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide">
                    {children}
                </h1>
            </div>
        </div>)
}


export function GameRenderer() {
    const windowSize = useWindowSize()
    const gameContext = useGameContext()
    const elemRef = useRef<HTMLDivElement>(null)
    const [dragging, setDragging] = useState(false)
    const [draggedCard, setDraggedCard] = useState<PlayingCard | undefined>()
    const [allDraggedCards, setAllDraggedCards] = useState<PlayingCard[]>([])
    const [destinationPile, setDestinationPile] = useState<Pile | undefined>()
    const [downPosition, setDownPosition] = useState({ x: 0, y: 0 })
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
    const endDrag = useCallback(() => {
        //console.log("endDrag useCallback " + draggedCard + " " + destinationPile + " " + gameContext)
        if (draggedCard) {
            if (destinationPile?.type === "table") {
                gameContext?.dispatch({ type: "drop-table", cards: allDraggedCards, table: destinationPile })
            }
        }
        setDraggedCard(undefined)
        setAllDraggedCards([])
        setDragging(false)
        setDestinationPile(undefined)
    }, [draggedCard, destinationPile, gameContext, gameContext])

    let scale = 1
    if (windowSize.width >= 1200 && windowSize.height >= 900) {
        scale = 1.5
    } else if (windowSize.width >= 1080 && windowSize.height >= 750) {
        scale = 1.25
    }
    const geometry = makeGeometry(scale)

    if (!gameContext?.state) {
        return <div>Not initialized</div>
    }
    const clickHandler = (pile: Pile, card?: PlayingCard) => {
        //console.log("click on: " + GameUtil.cardToString(card) + " in " + pile.type + "[" + pile.index + "]")
        if (card && pile.type === "stock") {
            gameContext.dispatch({ type: "draw-stock", card: card })
        } else if (!card && pile.type === "stock") {
            gameContext.dispatch({ type: "empty-stock" })
        } else if (card && pile.type === "table") {
            gameContext.dispatch({ type: "draw-table", card: card, side: card.side })
        } else if (card && pile.type === "waste") {
            gameContext.dispatch({ type: "draw-waste", card: card })
        }
    }
    const mouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (!elemRef.current) {
            return
        }
        const container = elemRef.current
        if (container == e.target) {
            return
        }
        const target = GameUtil.findCardElement(e.target as HTMLElement)
        if (!target) {
            return
        }
        const card = GameUtil.findCardById(gameContext.state, target.getAttribute("data-card"))
        if (!card) {
            return
        }
        const pile = GameUtil.findPileForCard(gameContext.state, card)
        const lastInPile = pile && pile.cards[pile.cards.length - 1] == card
        if (pile?.type != "table" && !lastInPile) {
            return
        }
        if (pile?.type == "stock") {
            return
        }

        if (pile?.type == "table" && card.side == "back") {
            return
        }

        setDragging(true)
        setDraggedCard(card)
        const dc = computeAllDraggedCards(gameContext.state, card)
        setAllDraggedCards(dc)
        //console.log("allDraggedCards: " + dc.map(c => GameUtil.cardToString(c)).join(", "))
        const nativeEvent = e.nativeEvent
        let offsetX, offsetY
        if (nativeEvent instanceof MouseEvent) {
            offsetX = nativeEvent.offsetX
            offsetY = nativeEvent.offsetY
        } else  {
            const touch = nativeEvent.touches[0]
            offsetX = touch.clientX - target.getBoundingClientRect().left
            offsetY = touch.clientY - target.getBoundingClientRect().top
        }
        setDownPosition({ x: offsetX, y: offsetY })
        const rect = container.getBoundingClientRect()
        let clientX, clientY
        if (nativeEvent instanceof MouseEvent) {
            clientX = nativeEvent.clientX
            clientY = nativeEvent.clientY
        } else {
            const touch = nativeEvent.touches[0]
            clientX = touch.clientX
            clientY = touch.clientY
        }
        const x = clientX - offsetX - rect.left
        const y = clientY - offsetY - rect.top
        setDragPosition({ x, y })
    }
    const mouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (dragging && elemRef.current) {
            const container = elemRef.current
            const nativeEvent = e.nativeEvent
            const rect = container.getBoundingClientRect()
            let x, y
            if (nativeEvent instanceof MouseEvent) {
                x = nativeEvent.clientX - downPosition.x - rect.left
                y = nativeEvent.clientY - downPosition.y - rect.top
            } else {
                const touch = nativeEvent.touches[0]
                x = touch.clientX - downPosition.x - rect.left
                y = touch.clientY - downPosition.y - rect.top
            }

            setDragPosition({ x, y })
            let destinationPile: Pile | undefined = undefined
            const target = GameUtil.findCardElement(e.target as HTMLElement)
            if (target) {
                const destination = GameUtil.findClosestPileAndCard(gameContext.state, container, target, draggedCard)
                if (destination) {
                    destinationPile = destination.pile
                }
            }
            //console.log("destinationPile: " + destinationPile?.type + "[" + destinationPile?.index + "]")
            setDestinationPile(destinationPile)
        }
    }
    const getBanner = () => {
        switch (gameContext.state.status) {
            case "won":
                return (
                    <OverlayPanel>
                        <StampedBanner text="You won"></StampedBanner>
                    </OverlayPanel>
                )
            case "stopped":
                //return <OverlayPanel>Solitaire</OverlayPanel>
                return <BannerPanel><span className="text-green-300">React</span> Solitaire</BannerPanel>
            default:
                return undefined
        }
    }
    const availableSize = { width: elemRef.current?.clientWidth || 0, height: elemRef.current?.clientHeight || 0 }
    return (
        <RendererContext.Provider value={{ draggedCard, dragPosition, destinationPile, allDraggedCards, geometry, availableSize }}>
            <div ref={elemRef} className="h-1 grow shrink flex flex-col bg-gray-500 p-4 relative"
                    onMouseDown={mouseDown} onMouseMove={mouseMove} onMouseUp={endDrag} onMouseLeave={endDrag} 
                    onTouchStart={mouseDown} onTouchMove={mouseMove} onTouchEnd={endDrag} onTouchCancel={endDrag}>
                <PileRenderer pile={gameContext.state.stock} clickHandler={clickHandler} />
                <PileRenderer pile={gameContext.state.waste} clickHandler={clickHandler} />
                {gameContext.state.stacks.map((pile, i) => <PileRenderer key={"stack" + i} pile={pile} clickHandler={clickHandler} />)}
                {gameContext.state.tables.map((pile, i) => <PileRenderer key={"table" + i} pile={pile} clickHandler={clickHandler} />)}
            </div>
            {getBanner()}
        </RendererContext.Provider>
    )
}
