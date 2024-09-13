import { ComponentProps } from "react"
import { GameUtil } from "./CardUtil"
import { CARD_WIDTH } from "./GameRenderer"
import { PlayingCard } from "./GameTypes"


export type CardRendererProps = { card: PlayingCard } & ComponentProps<"div">



export function CardRenderer({ card, ...props }: CardRendererProps) {
    const image = card.side == "back" ? "cards/back.png" : GameUtil.cardToImage(card)
    return (
        <div data-card={GameUtil.cardId(card)} className="flex items-center cursor-pointer select-none absolute" {...props} >
            <div className="bg-white border border-gray-600 shadow-lg rounded-lg flex justify-center items-center" style={{ width: CARD_WIDTH + "px" }}>
                <img draggable="false" className="select-none" src={image} alt={GameUtil.cardToString(card)} />
            </div>
        </div>
    )
}

