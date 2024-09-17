/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */
import { useCallback, useEffect, useState } from "react";
import { Menubar } from "./components/Menubar";
import { ConfirmDialog, ModalDialog } from "./components/ModalDialog";
import { Game, useGameContext } from "./game/Game";
import { GameRenderer } from "./game/GameRenderer";
import { ExternalLink } from "./components/ExternalLink";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useWindowSize } from "./hooks/WindowSize";
import { StatsPanel } from "./game/StatsPanel";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Game><Content /></Game>,
    },
    {
        path: "/reactsolitaire",
        element: <Game><Content /></Game>,
    },
    { path: "*", element: <div>We haven't found where you were looking for</div> },
])

export function App() {
    return <RouterProvider router={router} />
}

export function Content() {
    const [aboutShown, setAboutShown] = useState(false)
    const [newGameConfirmShown, setNewGameConfirmShown] = useState(false)
    const [stopGameConfirmShown, setStopGameConfirmShown] = useState(false)
    const context = useGameContext()
    const size = useWindowSize()
    const [ angle, setAngle ] = useState(0)
    useEffect(() => {
        setAngle(aboutShown ? 12 : 0)
    }, [aboutShown])

    const startNewGame = useCallback(() => {
        context?.dispatch({ type: "game-new" })
        setTimeout(() => {
            context?.dispatch({ type: "game-launched" })
        }, 1_000)
    }, [])

    const handleMenubarAction = (action: string) => {
        //console.log(action)
        if ("about" == action) {
            setAboutShown(true)
        } else if ("game-new" == action) {
            if (context?.state?.status == "running") {
                setNewGameConfirmShown(true)
            } else {
                startNewGame()
            }
        } else if ("game-stop" == action) {
            if (context?.state?.status == "running") {
                setStopGameConfirmShown(true)
            } else {
                context?.dispatch({ type: "game-stop" })
            }
        }
    }

    const cards = [ "0H", "JS", "QD", "KH", "AS", "AD" ]


    return (
        <div className="h-1 grow shrink flex flex-col">
            <Menubar handleClick={handleMenubarAction} />
            <div className="relative bg-indigo-800 h-1 grow shrink flex flex-col overflow-hidden">
                {size.width < 820
                    ? <div className="flex grow items-center justify-center text-center text-7xl font-bold p-4 text-white">Please use a wider browser window</div>
                    :<GameRenderer></GameRenderer>}
            </div>
            <StatsPanel></StatsPanel>
            <ModalDialog show={aboutShown} onClose={() => { setAboutShown(false) }} title="About React Solitaire">
                <div className="flex flex-col gap-2">
                    <p>Small Solitair Game in React. (For demo purposes only.)</p>
                    <p>by Stepan Rutz <a href="mailto:stepan.rutz@gmx.de">stepan.rutz AT gmx.de</a>.</p>
                    <p>Projectpage incl. sourcecode <ExternalLink href="https://github.com/srutz/reactsolitaire/" />.</p>
                    <div className="h-4"></div>
                    <p>Images are from <ExternalLink href="https://picsum.photos/"/></p>
                    <p>Card-Images are are from <ExternalLink href="https://deckofcardsapi.com/"/></p>
                    <p>Made with: Typescript, React, React-Router, Vite, Tailwind</p>
                    <div className="flex flex-col bg-black p-4 self-strecth items-center relative min-h-64">
                        {cards.map((card, index) => (
                            <div key={index} className="w-32 absolute" style={{ transition: "all 5s ease-in-out", transformOrigin: "bottom center", transform: "rotate(" + (angle * (index - cards.length / 2)) + "deg)" }}>
                                <img draggable="false" className="select-none " src={"cards/" + card + ".png"} />
                            </div>))}
                    </div>
                </div>
            </ModalDialog>
            <ConfirmDialog 
                    show={newGameConfirmShown} 
                    onCancel={() => setNewGameConfirmShown(false)} 
                    onConfirm={() => { 
                        setNewGameConfirmShown(false);
                        context?.dispatch({ type: "game-stop" }) 
                        setTimeout(startNewGame, 500) }} 
                    title="Confirm New Game">
                <p>Really start a new game?</p>
            </ConfirmDialog>
            <ConfirmDialog 
                    show={stopGameConfirmShown} 
                    onCancel={() => setStopGameConfirmShown(false)} 
                    onConfirm={() => { 
                        setStopGameConfirmShown(false);                         
                        context?.dispatch({ type: "game-stop" }) 
                    }} 
                    title="Confirm Stop Game">
                <p>Really end the current game?</p>
            </ConfirmDialog>
        </div>
    )
}
