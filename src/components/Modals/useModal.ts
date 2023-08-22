import { useState } from "react";
import BaseModal from "./BaseModal";
import { ModalFooterType } from "@/types";

export default function useModal(footerType: ModalFooterType)
{
    const [isShown, setIsShown] = useState(false);

    const showModal = () => setIsShown(true);
    const hideModal = () => setIsShown(false);

    const Modal = (props: {children: React.ReactNode}) => {return BaseModal({ children: props.children, footer: footerType, isShown, hideModal, showModal} )}

    return { Modal, showModal, hideModal };
}