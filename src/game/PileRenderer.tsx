import { CSSProperties, useCallback } from "react"
import { Pile, PlayingCard } from "./GameTypes"
import { CardRenderer, Point } from "./CardRenderer"
import { CARD_HEIGHT, CARD_WIDTH, getStackingDistance, useRendererContext } from "./GameRenderer"
import { GameUtil } from "./CardUtil"
import { PileBackground } from "./PileBackground"
import { PileOverlay } from "./PileOverlay"
import { useGameContext } from "./Game"


const DRAG_LAYER = 1000


/* gets the left-top anchor position for a pile */
function getPilePosition(pile: Pile) {
    const xdist = CARD_WIDTH + 16
    const ydist = CARD_HEIGHT + 30 * getStackingDistance("stack")
    const x0 = 24
    const y0 = 24
    const position: Point = { x: 0, y: 0 }
    switch (pile.type) {
        case "stock": position.x = x0; position.y = y0; break
        case "waste": position.x = x0 + xdist; position.y = y0; break
        case "stack": position.x = x0 + 3 * xdist + pile.index * xdist; position.y = y0; break
        case "table": position.x = x0 + pile.index * xdist; position.y = y0 + ydist; break
    }
    return position
}


export type CardPileProps = {
    pile: Pile,
    clickHandler: (pile: Pile, card?: PlayingCard) => void
}

/* render a pile of cards */
export function PileRenderer({ pile, clickHandler }: CardPileProps) {
    const rendererContext = useRendererContext()
    const gameContext = useGameContext()
    if (!rendererContext) {
        return <div>no renderer context</div>
    }
    const { draggedCard, dragPosition, allDraggedCards, destinationPile } = rendererContext
    //console.log("dragPosition.x = " + dragPosition?.x + ", dragPosition.y = " + dragPosition?.y + ", draggedCard = " + draggedCard)
    const dragStartPile = GameUtil.findPileForCard(gameContext?.state, draggedCard)
    let { x, y } = getPilePosition(pile)
    const style: CSSProperties = {
        top: y + "px",
        left: x + "px",
    }
   
    const overlayStyle: CSSProperties = {
        left: x + "px",
        top: (y + (
            dragStartPile == pile && draggedCard 
            ? Math.max(0, dragStartPile.cards.indexOf(draggedCard) - 1)
            : Math.max(0, pile.cards.length - 1))
            * getStackingDistance(pile.type)) + "px",
    }


    const computeDuration = useCallback(() => {
        return ["stopped", "won", "launching"].indexOf(gameContext?.state.status || "") != -1 ? 750 : undefined
    }, [gameContext?.state.status])

    const computeDelay = useCallback((pile: Pile, cardIndex: number) => {
        const delay = ["stopped", "won", "launching"].indexOf(gameContext?.state.status || "") != -1 
            ? Math.floor(cardIndex * 250 / pile.cards.length)
            : undefined
        return delay
    }, [gameContext?.state.status])


    const computeZIndex = useCallback((card: PlayingCard) => {
        const index = allDraggedCards.indexOf(card)
        return index != -1 ? DRAG_LAYER : undefined
    }, [allDraggedCards])

    const computePosition = useCallback((pile: Pile, card: PlayingCard, cardIndex: number) => {
        const index = allDraggedCards.indexOf(card)
        const position = getPilePosition(pile)
        if (index == -1) {
            position.y = y + cardIndex * getStackingDistance(pile.type)
        } else {
            position.x = dragPosition?.x || 0
            position.y  = (dragPosition?.y || 0) + index * getStackingDistance(pile.type)
        }
        if (["stopped", "won"].indexOf(gameContext?.state.status || "") != -1 ) {
            position.x = -300
            position.y = -300
        }
        return position
    }, [gameContext?.state.status, allDraggedCards, dragPosition, draggedCard])


    return <>
        <PileBackground pile={pile} style={style} onClick={() => { clickHandler(pile) }} />
        {pile.cards.map((card, i) =>
            <CardRenderer 
                key={i} /* GameUtil.cardId(c) */
                data-card={GameUtil.cardId(card)} 
                card={card}
                durationMs={computeDuration()}
                delayMs={computeDelay(pile, i)}
                position={computePosition(pile, card, i)}
                zIndex={computeZIndex(card)}
                onClick={() => { clickHandler(pile, card) }} />)}
        {destinationPile == pile && <PileOverlay pile={pile} style={overlayStyle} />}
    </>
}
