/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */
import { useEffect, useState } from "react"

type WindowSize = { width: number, height: number }

/* hook for windoze size */
export function useWindowSize() {
    const [ size, setSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight })
    useEffect(() => {
        const l = () => {
            setSize({width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener("resize", l)
        return () => { window.removeEventListener("resize", l) }
    }, [])
    return size
}
