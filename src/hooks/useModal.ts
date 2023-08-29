import { useState } from "react";
import BaseModal from "../components/Modals/BaseModal";
import { ModalFooterType } from "@/types";

export default function useModal(footerType: ModalFooterType, title?: string)
{
    const [isShown, setIsShown] = useState(false);

    const showModal = () => setIsShown(true);
    const hideModal = () => setIsShown(false);

    const Modal = (props: {children: React.ReactNode}) => {return BaseModal({ children: props.children, footer: footerType, isShown, hideModal, showModal, title})}

    return { Modal, showModal, hideModal };
}