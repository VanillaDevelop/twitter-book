import "./Attributions.scss"
import { ipcRenderer } from "electron";
import useModal from "../useModal";
import { ModalFooterType } from "@/types";

export default function Attributions()
{
    const openLink = (url: string) => {
        ipcRenderer.send('open-external-link', url);
    }

    const {Modal, showModal, hideModal} = useModal(ModalFooterType.None)

    return (
        <>
            <div className="attributionsLink" onClick={showModal}>
                About
            </div>
            <Modal>
                <p>
                    The Twitter Book Generator is developed by <span className="externalLink" onClick={() => openLink("https://github.com/VanillaDevelop")}>Vanilla</span>.
                    Thanks to <span className="externalLink" onClick={() => openLink("https://github.com/karashiiro")}>Kara</span> on GitHub for fast response times on issues with the 
                    Twitter Scraper library even though Elon Musk is continuously breaking everything. We are not affiliated with Twitter or X or any other Elon Musk (ad)venture.
                </p>

                The following external assets were used:
                <ul>
                    <li>
                        <span className="externalLink" onClick={() => openLink("https://icons8.com/icon/8953/add-user-male")}>Add User Male</span> icon by&nbsp;
                        <span className="externalLink" onClick={() => openLink("https://icons8.com")}>Icons8</span>
                    </li>
                    <li>
                        <span className="externalLink" onClick={() => openLink("hhttps://icons8.com/icon/7744/decision")}>Decision (Unknown User)</span> icon by&nbsp;
                        <span className="externalLink" onClick={() => openLink("https://icons8.com")}>Icons8</span>
                    </li>
                    <li>
                        Other icons from <span className="externalLink" onClick={() => openLink("https://fontawesome.com")}>FontAwesome</span> contain embedded attribution.
                    </li>
                </ul>
            </Modal>
        </>
    )
}