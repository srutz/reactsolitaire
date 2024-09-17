/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */

/* Written by Stepan Rutz */
import { useEffect, useState } from 'react'


/* Type for a hotkey */
type Hotkey = {
    id: string      // The id of the hotkey, you set it to remember what the hotkey does
    key: string     // KeyboardEvent.key is just a string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
}

/*
 * useHotkeys is a custom hook that takes an array of Hotkey objects and returns the id of the active key
 *
 * example usage:
 * 
 * const keys = [
 *   { id: 'save', key: 's', ctrl: true },
 *   { id: 'undo', key: 'z', ctrl: true },
 *   { id: 'redo', key: 'y', ctrl: true }]
 * 
 * const activeKey = useHotkeys(keys)
 * 
 * // activeKey will be the id of the active key, this is for rendering purposes
 * if (activeKey === 'save') {
 *    console.log('save')
 * }
 * 
 * // typically you would use an effect to listen for changes in activeKey
 * 
 * useEffect(() => {
 *   if (activeKey === 'save') {
 *    console.log('save')
 *  }
 * }, [activeKey])
 * 
 */
export function useHotkeys(keys: Hotkey[]) {
    const [ activeKey, setActiveKey ] = useState<string | undefined>()
    useEffect(() => {
        const l = (event: KeyboardEvent) => {
            keys.forEach(k => {
                const { id, key, ctrl = false, shift = false, alt = false } = k
                if (event.key === key
                        && event.ctrlKey === ctrl 
                        && event.shiftKey === shift
                        && event.altKey === alt) {
                    event.preventDefault()
                    event.stopPropagation()
                    setActiveKey(id)
                }
            })
        }
        window.addEventListener('keydown', l)
        return () => window.removeEventListener('keydown', l)
    })
    return activeKey
}