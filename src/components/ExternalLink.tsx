import { ReactNode } from "react"

export function ExternalLink({ href, children }: { href: string, children?: ReactNode }) {
    return (
    <a className="text-blue-500" href={href} target="_blank" rel="noreferrer">
        {children||href}
    </a>)
}
