/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */

/* 
 * Simple menubar component
 * clicks are handled by the handleClick function provided as prop
 * by the parent component
 */
export function Menubar({handleClick, showCheat } : { handleClick: (action: string) => void, showCheat?: boolean }) {
    return (
        <div className="bg-gray-800 p-4 flex flex-col">
            <div className="flex items-center">
                <div className="text-white text-3xl font-bold select-none uppercase tracking-tighter"><span className="text-green-400">React</span> Solitaire</div>
                <div className="grow"></div>
                <nav className="flex gap-4">
                <a href="#" className="text-gray-300 hover:text-white text-lg tracking-tight" onClick={() => { handleClick("game-new")}}>New game</a>
                <a href="#" className="text-gray-300 hover:text-white text-lg tracking-tight" onClick={() => { handleClick("game-stop")}}>Stop game</a>
                {showCheat && (
                    <a href="#" className="text-gray-300 hover:text-white text-lg tracking-tight" onClick={() => { handleClick("togglecheat")}}>Cheat on/off</a>
                )}
                <a href="#" className="text-gray-300 hover:text-white text-lg tracking-tight" onClick={() => { handleClick("about")}}>About</a>
                <a href="#" className="text-gray-300 hover:text-white text-lg tracking-tight" onClick={() => { handleClick("share")}}><img alt="Share" src="/reactsolitaire/images/share.svg" /></a>
                </nav>
            </div>
        </div>
    )
}   
