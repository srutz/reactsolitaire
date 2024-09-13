import { useState } from "react"


function ModalBackdrop({ opening, children }: { opening?: boolean; children?: React.ReactNode }) {
    return <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 opacity-0 ${opening ? "animate-fade-in" : "animate-fade-out"}`}>{children}</div>
}


function ModalTitle({ title, onClose }: { title: string, onClose: () => void }) {
    return (
        <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl text-black font-semibold">{title}</h2>
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800">
                &times;
            </button>
        </div>)
}


function DialogWindow({ children }: { children?: React.ReactNode }) {
    return <div className="bg-white rounded-lg shadow-lg" style={{ width: "calc(min(800px,60vw))"}}>{children}</div>
}


function DialogButtonBar({ children }: { children?: React.ReactNode }) {
    return <div className="flex justify-end p-4 border-t gap-4">{children}</div>
}


/*
 * ModalDialog component, which renders a title and children as content
 * the parent component has to control the visibility of the modal
 * a callback function onClose is called when the close button is clicked
 */
export function ModalDialog({ show, title, onClose, children }: {
    show: boolean
    title: string
    onClose: () => void
    children: React.ReactNode
}) {
    const [closing, setClosing] = useState(false)
    if (!show) {
        return null
    }
    const handleClosing = () => {
        setClosing(true)
        setTimeout(() => {
            onClose()
            setClosing(false)
        }, 250)
    }
    return (
        <ModalBackdrop opening={!closing}>
            <DialogWindow>
                <ModalTitle title={title} onClose={handleClosing} />
                <div className="p-4">
                    {children}
                </div>
                <DialogButtonBar>
                    <button onClick={handleClosing} className="button">
                        Close
                    </button>
                </DialogButtonBar>
            </DialogWindow>
        </ModalBackdrop>
    )
}



/*
 * Confirm component, which renders a title and children as content
 * the parent component has to control the visibility of the modal
 * a callback function onClose is called when the close button is clicked
 */
export function ConfirmDialog({ show, title, onCancel, onConfirm, children }: {
    show: boolean
    title: string
    onCancel: () => void
    onConfirm: () => void
    children: React.ReactNode
}) {
    const [closing, setClosing] = useState(false)
    if (!show) {
        return null
    }
    const handleCancel = () => handleClosing(false)
    const handleConfirm = () => handleClosing(true)
    const handleClosing = (ok?: boolean) => {
        setClosing(true)
        setTimeout(() => {
            ok ? onConfirm() : onCancel()
            setClosing(false)
        }, 250)
    }
    return (
        <ModalBackdrop opening={!closing}>
            <DialogWindow>
                <ModalTitle title={title} onClose={handleCancel} />
                <div className="p-4">
                    {children}
                </div>
                <DialogButtonBar>
                    <button onClick={handleCancel} className="button button-secondary">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="button">
                        Ok
                    </button>
                </DialogButtonBar>
            </DialogWindow>
        </ModalBackdrop>
    )
}