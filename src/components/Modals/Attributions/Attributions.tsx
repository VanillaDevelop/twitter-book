import "./Attributions.scss"
import useModal from "../../../hooks/useModal";
import { ModalFooterType } from "@/types";
import ExternalLink from "@/components/ExternalLink/ExternalLink";

export default function Attributions()
{
    const {Modal, showModal, hideModal} = useModal(ModalFooterType.None, "Attributions")

    return (
        <>
            <div className="attributionsLink" onClick={showModal}>
                About
            </div>
            <Modal>
                <p>
                    The Twitter Book Generator is developed by <ExternalLink url="https://github.com/VanillaDevelop">Vanilla</ExternalLink>.
                    Thanks to <ExternalLink url="https://github.com/karashiiro">Kara</ExternalLink> on GitHub for fast response times on issues with the 
                    Twitter Scraper library even though Elon Musk is continuously breaking everything. We are not affiliated with Twitter or X or any other Elon Musk (ad)venture.
                </p>

                The following external assets were used:
                <ul>
                    <li>
                        <ExternalLink url="https://icons8.com/icon/8953/add-user-male">Add User Male</ExternalLink> icon by&nbsp;
                        <ExternalLink url="https://icons8.com">Icons8</ExternalLink>
                    </li>
                    <li>
                        <ExternalLink url="https://icons8.com/icon/7744/decision">Decision (Unknown User)</ExternalLink> icon by&nbsp;
                        <ExternalLink url="https://icons8.com">Icons8</ExternalLink>
                    </li>
                    <li>
                        Other icons from <ExternalLink url="https://fontawesome.com">FontAwesome</ExternalLink> (free icons), embedded attribution.
                    </li>
                    <li>
                        Placeholder media <ExternalLink url="https://commons.wikimedia.org/wiki/File:Image_not_available.png">CC BY-SA 4.0 via Wikimedia</ExternalLink>.
                    </li>
                </ul>
            </Modal>
        </>
    )
}