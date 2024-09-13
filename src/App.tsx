import { useCallback, useState } from "react";
import { Menubar } from "./components/Menubar";
import { ConfirmDialog, ModalDialog } from "./components/ModalDialog";
import { Game, useGameContext } from "./game/Game";
import { GameRenderer } from "./game/GameRenderer";
import { ExternalLink } from "./components/ExternalLink";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useWindowSize } from "./hooks/WindowSize";


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

    const startNewGame = useCallback(() => {
        context?.dispatch({ type: "game-new" })
        setTimeout(() => {
            context?.dispatch({ type: "game-launched" })
        }, 250)
    }, [])

    const handleMenubarAction = (action: string) => {
        console.log(action)
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

    return (
        <div className="h-1 grow shrink flex flex-col">
            <Menubar handleClick={handleMenubarAction} />
            <div className="relative bg-indigo-800 h-1 grow shrink flex flex-col overflow-hidden">
                {size.width < 820
                    ? <div className="flex grow items-center justify-center text-center text-7xl font-bold p-4 text-white">Please use a wider browser window</div>
                    :<GameRenderer></GameRenderer>}
            </div>
            <ModalDialog show={aboutShown} onClose={() => { setAboutShown(false) }} title="About React Solitaire">
                <p>Small Solitair Game in React. (For demo purposes only.)</p>
                <p>by Stepan Rutz <a href="mailto:stepan.rutz@gmx.de">stepan.rutz AT gmx.de</a>.</p>
                <div className="h-4"></div>
                <p>Images are from <ExternalLink href="https://picsum.photos/"/></p>
                <p>Card-Images are are from <ExternalLink href="https://deckofcardsapi.com/"/></p>
                <p>Made with: Typescript, React, React-Router, Vite, Tailwind</p>
            </ModalDialog>
            <ConfirmDialog 
                    show={newGameConfirmShown} 
                    onCancel={() => setNewGameConfirmShown(false)} 
                    onConfirm={() => { setNewGameConfirmShown(false); startNewGame() }} 
                    title="Confirm New Game">
                <p>Really start a new game?</p>
            </ConfirmDialog>
            <ConfirmDialog 
                    show={stopGameConfirmShown} 
                    onCancel={() => setStopGameConfirmShown(false)} 
                    onConfirm={() => { setStopGameConfirmShown(false); context?.dispatch({ type: "game-stop" }) }} 
                    title="Confirm Stop Game">
                <p>Really end the current game?</p>
            </ConfirmDialog>
        </div>
    )
}
