import { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import "./PopUp.scss"

function setUpTimeouts(ref: React.MutableRefObject<HTMLDivElement | null>, setNoFadeout: React.Dispatch<React.SetStateAction<boolean>>)
{
    setNoFadeout(true);

    const fadeout_timer = setTimeout(() => {
        setNoFadeout(false);
    }, 4000);

    const remove_timer = setTimeout(() => {
        if(ref.current)
        {
            ref.current.remove();
        }
    }, 6000);

    return {fadeout_timer, remove_timer};
}

export default function PopUp(props: {title: string, text: string})
{
    const [noFadeout, setNoFadeout] = useState(true);
    const [fadeoutTimer, setFadeoutTimer] = useState<NodeJS.Timeout>();
    const [removeTimer, setRemoveTimer] = useState<NodeJS.Timeout>();

    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => 
    {
        const {fadeout_timer, remove_timer} = setUpTimeouts(popupRef, setNoFadeout);
        setFadeoutTimer(fadeout_timer);
        setRemoveTimer(remove_timer);
        return () => {
            clearTimeout(fadeout_timer);
            clearTimeout(remove_timer);
        }
    }, [])

    const onMouseEnter = () =>
    {
        if(fadeoutTimer && removeTimer)
        {
            clearTimeout(fadeoutTimer);
            clearTimeout(removeTimer);
        }
        setNoFadeout(true);
    }

    const onMouseLeave = () =>
    {
        const {fadeout_timer, remove_timer} = setUpTimeouts(popupRef, setNoFadeout);
        setFadeoutTimer(fadeout_timer);
        setRemoveTimer(remove_timer);
    }

    return (
        <div className={`popup ${noFadeout ? "no-fadeout" : ""}`} ref={popupRef} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div className="popup_close">
                <button onClick={() => popupRef.current?.remove()}>X</button>
            </div>
            <div className="popup_title">
                <h3>{props.title}</h3>
            </div>
            <div className="popup_inner">
                {props.text}
            </div>
        </div>
    )
}