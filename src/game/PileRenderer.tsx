import { CSSProperties } from "react"
import { Pile, PlayingCard } from "./GameTypes"
import { CardRenderer } from "./CardRenderer"
import { CARD_HEIGHT, CARD_WIDTH, getStackingDistance, useRendererContext } from "./GameRenderer"
import { GameUtil } from "./CardUtil"
import { PileBackground } from "./PileBackground"
import { PileOverlay } from "./PileOverlay"
import { useGameContext } from "./Game"



export type CardPileProps = {
    pile: Pile,
    clickHandler: (pile: Pile, card?: PlayingCard) => void
}

export function PileRenderer({ pile, clickHandler }: CardPileProps) {
    const rendererContext = useRendererContext()
    const gameContext = useGameContext()
    if (!rendererContext) {
        return <div>no renderer context</div>
    }
    const { draggedCard, dragPosition, allDraggedCards, destinationPile } = rendererContext
    //console.log("dragPosition.x = " + dragPosition?.x + ", dragPosition.y = " + dragPosition?.y + ", draggedCard = " + draggedCard)
    const dragStartPile = GameUtil.findPileForCard(gameContext?.state, draggedCard)
    const x0 = 24
    const y0 = 24
    const xdist = CARD_WIDTH + 16
    const ydist = CARD_HEIGHT + 30 * getStackingDistance("stack")
    let x = 0
    let y = 0
    switch (pile.type) {
        case "stock": x = x0; y = y0; break
        case "waste": x = x0 + xdist; y = y0; break
        case "stack": x = x0 + 3 * xdist + pile.index * xdist; y = y0; break
        case "table": x = x0 + pile.index * xdist; y = y0 + ydist; break
    }
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


    const computeStyle = (pile: Pile, card: PlayingCard, cardIndex: number) => {
        const s = { ...style }
        const DRAG_LAYER = 1000
        const index = allDraggedCards.indexOf(card)
        if (index == -1) {
            s.top = (y + cardIndex * getStackingDistance(pile.type)) + "px"
        } else {
            s.left = (dragPosition?.x || 0) + "px"
            s.top  = ((dragPosition?.y || 0) + index * getStackingDistance(pile.type)) + "px"
            s.zIndex = DRAG_LAYER
        }
        return s
    }
    return <>
        <PileBackground pile={pile} style={style} onClick={() => { clickHandler(pile) }} />
        {pile.cards.map((c, i) =>
            <CardRenderer 
                key={GameUtil.cardId(c)} 
                data-card={GameUtil.cardId(c)} 
                card={c} 
                style={computeStyle(pile, c, i)} 
                onClick={() => { clickHandler(pile, c) }} />)}
        {destinationPile == pile && <PileOverlay pile={pile} style={overlayStyle} />}
    </>
}
