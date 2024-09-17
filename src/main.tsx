/* (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'



createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)


console.log("%cReactsolitaire", "font-size:36px; color: #9c1020; font-Family: 'Sans'; font-weight: 700")
console.log("%cwritten by Stepan Rutz. Source at https://github.com/srutz/reactsolitaire/", "font-size:18px; color: #9c1020; font-Family: 'Noto Sans'; font-weight: 700")
