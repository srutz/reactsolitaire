/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */
import { ComponentProps, CSSProperties, useEffect, useState } from "react"
import { GameUtil } from "./CardUtil"
import { PlayingCard } from "./GameTypes"
import { DRAG_LAYER } from "./PileRenderer"



export type Point = {
    x: number
    y: number
}

export type CardRendererProps = { 
    card: PlayingCard 
    dragged?: boolean
    width: number
    cheat?: boolean
    position?: Point
    durationMs?: number
    delayMs?: number
    zIndex?: number
} & ComponentProps<"div">


/*
 * cannot memoize because switching sides doesnt trigger a rerender once this card is memoized
 * deep compare on card would fix it
 */
/*
export const CardRenderer = memo(CardRenderer_, (prev: CardRendererProps, next: CardRendererProps) => {
    return prev.card == next.card 
        && prev.card.side == next.card.side  // <- thinko
        && prev.dragged == next.dragged 
        && prev.width == next.width
        && prev.cheat == next.cheat
        && prev.position == next.position
        && prev.durationMs == next.durationMs
        && prev.delayMs == next.delayMs
        && prev.zIndex == next.zIndex

})
*/
export function CardRenderer({ card, dragged, width, cheat, position, durationMs = 0, delayMs = 0, zIndex, onClick }: CardRendererProps) {
    "use no memo"
    const [releasingDrag, setReleasingDrag] = useState(false)
    const image = !cheat && card.side == "back" ? "cards/back.png" : GameUtil.cardToImage(card)
    /*
    if (card.rank == "2" && card.suit == "diamonds") {
        console.log("rerender ", cheat, card.side, card.side == "back", image, GameUtil.cardToImage(card))
    }
    useEffect(() => {
        if (card.rank == "2" && card.suit == "diamonds") {
            console.log("Prop `value` changed:", card, dragged, width, cheat, position, durationMs, delayMs, zIndex)
        }
      }, [ card, dragged, width, cheat, position, durationMs, delayMs, zIndex ])
    */
    const style: CSSProperties = {
        width: width + "px",
        transitionProperty: "all",
        transitionDuration: durationMs + "ms",
        transitionDelay: delayMs + "ms",
        left: position?.x !== undefined ? position.x + "px" : "auto",
        top: position?.y !== undefined ? position.y + "px" : "auto",
        zIndex: zIndex || "auto"
    }
    // if not dragged animate always
    if (!dragged) {
        style.transitionProperty = "all"
        style.transitionDuration = "125ms"
        style.transitionTimingFunction = "ease-out"
    }
    if (releasingDrag) {
        style.zIndex = DRAG_LAYER
        style.animation = "bounce 150ms ease-in-out"
    }        
    useEffect(() => {
        //console.log("change " + GameUtil.cardToString(card) + " " + dragged)
        if (!dragged) {
            setTimeout(() => {
                setReleasingDrag(false)
            }, 150)
            setReleasingDrag(true)
        }
    }, [dragged])
    const clazzes = [ ..."flex items-center cursor-pointer select-none absolute".split(" ")
        , dragged ? "xshadow-custom-large" : "" ]
    //if (card.rank == "2" && card.suit == "diamonds") {
    //    console.log("rerender2 ", cheat, card.side, image)
    //}
    // weirdness, the + "" fixes the memoization of image
    return (        
        <div data-card={GameUtil.cardId(card)} className={clazzes.join(" ")} style={style} onClick={onClick}>
            <div className="bg-white border shadow-lg rounded-lg flex justify-center items-center" >
                <img draggable="false" className="select-none " src={image + ""} alt={GameUtil.cardToString(card)} />
            </div>
        </div>
    )
}
