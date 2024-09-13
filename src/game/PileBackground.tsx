import { ComponentProps } from "react";
import { Pile } from "./GameTypes"
import { GameUtil } from "./CardUtil"
import { CARD_HEIGHT, CARD_WIDTH } from "./GameRenderer"

export function PileBackground({ pile, ...props }: { pile: Pile } & ComponentProps<"div">) {
    return (
        <div data-pile={GameUtil.pileId(pile)} className="flex items-center cursor-pointer select-none absolute" {...props}>
            <div className="bg-gray-500 border border-gray-600 shadow-lg rounded-lg flex justify-center items-center text-gray-600 capitalize text-2xl"
                style={{ width: CARD_WIDTH + "px", height: CARD_HEIGHT + "px" }}>
                {["table", "waste"].indexOf(pile.type) == -1 && pile.type}
            </div>
        </div>
    )
}
