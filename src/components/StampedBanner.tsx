/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */

import { useEffect, useRef, useState } from "react"
import { Point } from "../game/CardRenderer"
import "./StampedBanner.css"

function useRerender() {
    const [, setToggle] = useState(false)
    return () => setToggle(t => !t)
}

export function StampedBanner({ text }: { text: string }) {
    const rerender = useRerender()
    const elemRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        rerender()
    }, [elemRef.current])

    function computePosition(i: number) {
        const availw = elemRef.current?.clientWidth || 0
        const availh = elemRef.current?.clientHeight || 0
        const size = 100
        const usedw = text.length * size
        const x0 = (availw - usedw) / 2
        const y0 = (availh - size) / 2
        const p: Point = { x: x0 + i * size, y: y0 }
        return p
    }

    return (
        <div ref={elemRef} className="h-64 bg-black self-stretch relative">
            {text.split("").map((c, i) => <Stamp text={c} key={i} 
                position={computePosition(i)} 
                keyframes={"pulse" + (i % 4)}
                delayMs={i * 50}/>)}
        </div>
    )
}

function Stamp({ text, position, delayMs = 0, keyframes}
: { text: string, position: Point, delayMs?: number, keyframes: string }) {
    if (!text.trim()) {
        return undefined
    }
    const [animationName,setAnimationName] = useState(keyframes)
    const frameCounter = useRef(0)
    useEffect(() => {
        const i = setInterval(() => {
            //console.log("tick " + frameCounter.current)
            const DURATIONTICKS = 3
            if (frameCounter.current == DURATIONTICKS) {
                const animationNumer = keyframes.substring(keyframes.length - 1)
                setAnimationName("fadeout" + animationNumer)
            } else if (frameCounter.current > DURATIONTICKS) {
                frameCounter.current = 0
                setAnimationName(keyframes)                
                return
            }
            frameCounter.current++
        }, 1_000)
        return () => clearInterval(i)
    }, [])
    return (
        <div className="stamped text-6xl font-bold flex flex-col justify-center items-center text-white"
                style={{ 
                    animationDelay: delayMs + "ms",
                    left: position.x + "px", 
                    top: position.y + "px" ,
                    animationName: animationName
                }}>
            {text}
        </div>
    )
}


