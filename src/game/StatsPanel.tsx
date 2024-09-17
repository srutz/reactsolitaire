/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */
import { ReactNode, useEffect, useState } from "react"
import { useGameContext } from "./Game"


function formatMillisAsHoursMinutesSecondsWithPadding(millis: number) {
    const hours = Math.floor(millis / 3600000)
    const minutes = Math.floor((millis % 3600000) / 60000)
    const seconds = Math.floor((millis % 60000) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function Title({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center rounded-md bg-gray-600 text-gray-100 text-sm px-3 py-1">
            {children}
        </div>
    )
}

function useRerender() {
    const[ ,setToggle ] = useState(false)
    return () => setToggle(t => !t)
}


export function StatsPanel() {
    const gameContext = useGameContext()
    const rerender = useRerender()
    useEffect(() => {
        if (gameContext?.state?.status == "won") {
            return
        }            
        const interval = setInterval(rerender, 1000)
        return () => clearInterval(interval)
    }, [gameContext?.state])
    if (!gameContext?.state) {
        return <div>Not initialized</div>
    }
    if (["running", "won"].indexOf(gameContext.state.status) == -1) {
        return undefined
    }
    const stats = gameContext.state.stats
    return (
        <div className="absolute bottom-0 overflow-hidden rounded bg-gray-800 shadow-md flex flex text-sm items-center p-2 gap-2">
                <Title>Stats</Title>
                <div className="flex grow overflow-hidden bg-white py-1 text-gray-600 rounded-lg ">
                    <div className="flex flex gap-4 px-4">
                        <div>Moves {stats.moves}</div>
                        <div>Points {stats.points}</div>
                        <div>Time {formatMillisAsHoursMinutesSecondsWithPadding(new Date().getTime() - stats.startTime)}</div>
                    </div>
                </div>
            </div>
    )
}