/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */

import { useEffect, useRef, useState } from "react"
import { Point } from "../game/CardRenderer"
import "./StampedBanner.css"
import { useWindowSize } from "../hooks/WindowSize"


function computePosition(availw: number, availh: number, text: string, size: number, i: number) {
    const usedw = text.length * size
    console.log("text.length = " + text.length)
    console.log("availw = " + availw + ", availh = " + availh + ", usedw = " + usedw)
    const x0 = (availw - usedw) / 2
    const y0 = (availh - size) / 2
    const p: Point = { x: x0 + i * size, y: y0 }
    return p
}
export function StampedBanner({ text }: { text: string }) {
    //const rerender = useRerender()
    const windowSize = useWindowSize()
    const elemRef = useRef<HTMLDivElement>(null)
    const [ avail, setAvail ] = useState<Point>({ x: 0, y: 0 })
    useEffect(() => {
        if (elemRef.current) {
            setAvail({ x: elemRef.current.clientWidth, y: elemRef.current.clientHeight })
        }
    }, [elemRef.current, windowSize])

    /*
    useEffect(() => {
        rerender()
    }, [elemRef.current ])
    */

    const size = windowSize.width < 1100 ? 100 : 160
    return (
        <div ref={elemRef} className="h-64 grow self-stretch relative justify-self-center mb-16">
            {text.split("").map((c, i) => <Stamp text={c} key={i} 
                position={computePosition(avail.x, avail.y, text, size, i)} 
                size={size}
                keyframes={"pulse" + (i % 4)}
                delayMs={i * 50}/>)}
        </div>
    )
}

function Stamp({ text, position, size, delayMs = 0, keyframes}
: { text: string, position: Point, size: number, delayMs?: number, keyframes: string }) {
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


