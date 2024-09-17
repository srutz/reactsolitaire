/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */
import { useEffect, useState } from "react"
import "./AnimatedHand.css"

export function AnimatedHand() {
    const cards = [ "0H", "JS", "QD", "KH", "AS", "AD" ]
    const [animationStep, setAnimationStep] = useState(0)
    console.log("animationStep", animationStep)
    useEffect(() => {
        const i = setInterval(() => {
            let nextStep = animationStep + 1
            if (nextStep == 2) {
                nextStep = 0
            }
            setAnimationStep(nextStep)
        }, 1_000)
        return () => clearInterval(i)
    }, [animationStep])
    return (
        <div className="flex flex-col p-4 self-strecth items-center relative h-full w-full opacity-20"  style={
            {
                transform: "rotate3d(2, -1, -1, -0.2turn)",
                animation: "bounce3d 50s ease-in-out infinite",
                zIndex: -50,
            }}>
        {cards.map((card, index) => (
            <div key={index} className="w-32 absolute animatedhand-card" style={
                {
                    animationDuration: "22s", 
                    animationDirection: "alternate-reverse",
                    animationName: animationStep != 1110 ? "card" + index : "",
                    animationIterationCount: "infinite",
                    top: "calc(50% - 64px)",
                }}>
                <img draggable="false" className="select-none" src={"cards/" + card + ".svg"} />
            </div>))}
        </div>
    )
}