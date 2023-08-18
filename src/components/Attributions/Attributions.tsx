import { useState } from "react";
import "./Attributions.scss"

export default function Attributions()
{

    const [displayModal, setDisplayModal] = useState(false);

    return (
        <>
            <div className="attributionsLink" onClick={() => setDisplayModal(true)}>
                About
            </div>
            <div className="attributionsDiv" style={{display: (displayModal ? "block" : "none")}}>
                <div className="attributionsModal moveModal">
                    <span className="closeAttributionsModal" onClick={() => setDisplayModal(false)}>&times;</span>
                </div>
            </div>
        </>
    )
}