/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */

import { useEffect, useRef, useState } from "react"
import { Point } from "../game/CardRenderer"
import "./StampedBanner.css"
import { useWindowSize } from "../hooks/WindowSize"

function useRerender() {
    const [, setToggle] = useState(false)
    return () => setToggle(t => !t)
}

export function StampedBanner({ text }: { text: string }) {
    const rerender = useRerender()
    const windowSize = useWindowSize()
    const elemRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        rerender()
    }, [elemRef.current])

    const size = windowSize.width < 1100 ? 100 : 160
    function computePosition(i: number) {
        const availw = elemRef.current?.clientWidth || 0
        const availh = elemRef.current?.clientHeight || 0
        const usedw = text.length * size
        const x0 = (availw - usedw) / 2
        const y0 = (availh - size) / 2
        const p: Point = { x: x0 + i * size, y: y0 }
        return p
    }

    return (
        <div ref={elemRef} className="h-64 grow self-stretch relative justify-self-center mb-16">
            {text.split("").map((c, i) => <Stamp text={c} key={i} 
                position={computePosition(i)} 
                size={size}
                keyframes={"pulse" + (i % 4)}
                delayMs={i * 50}/>)}
        </div>
    )
}

function Stamp({ text, position, size, delayMs = 0, keyframes}
: { text: string, position: Point, size: number, delayMs?: number, keyframes: string }) {
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
                    top: position.y + "px",
                    width: (size - 8) +"px",
                    height: (size - 8) +"px",
                    animationName: animationName
                }}>
            {text}
        </div>
    )
}


