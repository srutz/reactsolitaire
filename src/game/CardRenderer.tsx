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
    position?: Point
    durationMs?: number
    delayMs?: number
    zIndex?: number
} & ComponentProps<"div">


export function CardRenderer({ card, dragged, width, ...props }: CardRendererProps) {
    const { position, durationMs = 0, delayMs = 0 } = props
    const [releasingDrag, setReleasingDrag] = useState(false)

    const image = card.side == "back" ? "cards/back.png" : GameUtil.cardToImage(card)
    const style: CSSProperties = {
        width: width + "px",
        transitionProperty: "all",
        transitionDuration: durationMs + "ms",
        transitionDelay: delayMs + "ms",
        left: position?.x !== undefined ? position.x + "px" : "auto",
        top: position?.y !== undefined ? position.y + "px" : "auto",
        zIndex: props.zIndex || "auto"
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
    return (        
        <div data-card={GameUtil.cardId(card)} className={clazzes.join(" ")} style={style} onClick={props.onClick}>
            <div className="bg-white border shadow-lg rounded-lg flex justify-center items-center" >
                <img draggable="false" className="select-none " src={image} alt={GameUtil.cardToString(card)} />
            </div>
        </div>
    )
}
