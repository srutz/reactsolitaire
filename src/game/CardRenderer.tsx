import { ComponentProps, CSSProperties } from "react"
import { GameUtil } from "./CardUtil"
import { CARD_WIDTH } from "./GameRenderer"
import { PlayingCard } from "./GameTypes"



export type Point = {
    x: number
    y: number
}

export type CardRendererProps = { 
    card: PlayingCard 
    position?: Point
    durationMs?: number
    delayMs?: number
    zIndex?: number
} & ComponentProps<"div">


export function CardRenderer({ card, ...props }: CardRendererProps) {
    const { position, durationMs = 0, delayMs = 0 } = props
    const image = card.side == "back" ? "cards/back.png" : GameUtil.cardToImage(card)
    const style: CSSProperties = {
        width: CARD_WIDTH + "px",
        transitionProperty: "all",
        transitionDuration: durationMs + "ms",
        transitionDelay: delayMs + "ms",
        left: position?.x !== undefined ? position.x + "px" : "auto",
        top: position?.y !== undefined ? position.y + "px" : "auto",
        zIndex: props.zIndex || "auto"
    }
    return (
        <div data-card={GameUtil.cardId(card)} className="flex items-center cursor-pointer select-none absolute" style={style} onClick={props.onClick}>
            <div className="bg-white border border-gray-600 shadow-lg rounded-lg flex justify-center items-center" >
                <img draggable="false" className="select-none" src={image} alt={GameUtil.cardToString(card)} />
            </div>
        </div>
    )
}
