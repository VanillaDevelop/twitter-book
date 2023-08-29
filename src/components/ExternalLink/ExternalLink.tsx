import { ipcRenderer } from "electron";
import "./ExternalLink.scss"

export default function ExternalLink(props: {url: string, children?: React.ReactNode})
{
    const openLink = (url: string) => {
        ipcRenderer.send('open-external-link', url);
    }

    return (
        <span className="externalLink" onClick={() => openLink(props.url)}>
            {props.children}
        </span>
    )
}