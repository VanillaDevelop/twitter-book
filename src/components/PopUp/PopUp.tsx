import { useEffect, useState } from "react"
import "./PopUp.scss"

function setUpTimeouts(destroyPopUp: () => void, setNoFadeout: React.Dispatch<React.SetStateAction<boolean>>)
{
    setNoFadeout(true);

    const fadeout_timer = setTimeout(() => {
        setNoFadeout(false);
    }, 4000);

    const remove_timer = setTimeout(() => {
        destroyPopUp();
    }, 6000);

    return {fadeout_timer, remove_timer};
}

export default function PopUp(props: {title: string, text: string, offset: number, destroyPopUp: () => void})
{
    const [noFadeout, setNoFadeout] = useState(true);
    const [fadeoutTimer, setFadeoutTimer] = useState<NodeJS.Timeout>();
    const [removeTimer, setRemoveTimer] = useState<NodeJS.Timeout>();

    useEffect(() => 
    {
        const {fadeout_timer, remove_timer} = setUpTimeouts(props.destroyPopUp, setNoFadeout);
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
        const {fadeout_timer, remove_timer} = setUpTimeouts(props.destroyPopUp, setNoFadeout);
        setFadeoutTimer(fadeout_timer);
        setRemoveTimer(remove_timer);
    }

    return (
        <div className={`popup ${noFadeout ? "no-fadeout" : ""}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
            style={{bottom: `calc(${1 + 1 * props.offset}em + ${85 * props.offset}px)`}}>
            <div className="popup_close">
                <button onClick={props.destroyPopUp}>X</button>
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