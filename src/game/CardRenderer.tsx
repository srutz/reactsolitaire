import { ComponentProps } from "react"
import { GameUtil } from "./CardUtil"
import { CARD_WIDTH } from "./GameRenderer"
import { PlayingCard } from "./GameTypes"


export type CardRendererProps = { card: PlayingCard } & ComponentProps<"div">

function ColoredSuit({ suit }: { suit: string }) {
    switch (suit) {
        case "hearts": return <span className="text-red-500 text-2xl">♥</span>
        case "diamonds": return <span className="text-red-500 text-2xl">♦</span>
        case "clubs": return <span className="text-black text-2xl">♣</span>
        case "spades": return <span className="text-black text-2xl">♠</span>
    }
}


function TextCardRenderer({ card, onClick }: CardRendererProps) {
    return (
        <div className="flex items-center cursor-pointer" onClick={onClick}>
            <ColoredSuit suit={card.suit} />-{card.rank}
        </div>
    )
}

function ImageCardRenderer({ card, ...props }: CardRendererProps) {
    const image = card.side == "back" ? "cards/back.png" : GameUtil.cardToImage(card)
    return (
        <div data-card={GameUtil.cardId(card)} className="flex items-center cursor-pointer select-none absolute" {...props} >
            <div className="bg-white border border-gray-600 shadow-lg rounded-lg flex justify-center items-center" style={{ width: CARD_WIDTH + "px" }}>
                <img draggable="false" className="select-none" src={image} alt={GameUtil.cardToString(card)} />
            </div>
        </div>
    )
}

export function CardRenderer({ debug, ...props }: { debug?: boolean } & CardRendererProps) {
    return debug ? TextCardRenderer(props) : ImageCardRenderer(props)
}
