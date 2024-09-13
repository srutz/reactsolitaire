
/* 
 * Simple menubar component
 * clicks are handled by the handleClick function provided as prop
 * by the parent component
 */
export function Menubar({handleClick} : { handleClick: (action: string) => void }) {
    return (
        <div className="bg-gray-800 p-4 flex flex-col">
            <div className="flex items-center">
                <div className="text-white text-lg font-bold select-none">React Solitaire</div>
                <div className="grow"></div>
                <nav className="flex gap-4">
                <a href="#" className="text-gray-300 hover:text-white" onClick={() => { handleClick("game-new")}}>New game</a>
                <a href="#" className="text-gray-300 hover:text-white" onClick={() => { handleClick("game-stop")}}>Stop game</a>
                <a href="#" className="text-gray-300 hover:text-white" onClick={() => { handleClick("about")}}>About</a>
                </nav>
            </div>
        </div>
    )
}   
