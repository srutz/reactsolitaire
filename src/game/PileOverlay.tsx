import { ComponentProps, CSSProperties } from "react";
import { GameUtil } from "./CardUtil";
import { Pile } from "./GameTypes";
import { Geometry } from "./GameRenderer";

export function PileOverlay({ pile, geometry, ...props }: { pile: Pile, geometry: Geometry } & ComponentProps<"div">) {
    const style: CSSProperties = { ...(props.style || {}),
        width: geometry.cardWidth + "px", 
        height: geometry.cardHeight + "px",
    }

    return (
        <div data-pile={GameUtil.pileId(pile)} className="flex items-center cursor-pointer select-none absolute" {...props}>
            <div className="bg-indigo-300 opacity-30 border border-gray-600 shadow-lg rounded-lg flex justify-center items-center text-black"
                style={style}>
            </div>
        </div>
    )
}
