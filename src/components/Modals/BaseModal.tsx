import "./BaseModal.scss"
import { ModalFooterType } from "@/types";

export default function BaseModal(props: {children?: React.ReactNode, footer: ModalFooterType, isShown: boolean, hideModal: () => void, showModal: () => void, title?: string})
{
    return (
        <>
            <div className="modalDisplay" style={{display: (props.isShown ? "block" : "none")}} onClick={() => props.hideModal()}>
                <div className="modal moveModal" onClick={(e) => e.stopPropagation()}>
                    <div className="modalHeader">
                        <h2>{props.title}</h2>
                        <span className="closeModal" onClick={props.hideModal}>&times;</span>
                    </div>
                    <div className="modalBody">
                        {props.children}
                    </div>
                    <div className="modalFooter">
                    </div>
                </div>
            </div>
        </>
    )
}