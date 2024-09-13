import { ComponentProps, CSSProperties } from "react";
import { GameUtil } from "./CardUtil";
import { Pile } from "./GameTypes";
import { CARD_HEIGHT, CARD_WIDTH } from "./GameRenderer";

export function PileOverlay({ pile, ...props }: { pile: Pile } & ComponentProps<"div">) {
    const style: CSSProperties = { ...(props.style || {}),
        width: CARD_WIDTH + "px", 
        height: CARD_HEIGHT + "px",
    }

    return (
        <div data-pile={GameUtil.pileId(pile)} className="flex items-center cursor-pointer select-none absolute" {...props}>
            <div className="bg-black opacity-30 border border-gray-600 shadow-lg rounded-lg flex justify-center items-center text-black"
                style={style}>
            </div>
        </div>
    )
}
