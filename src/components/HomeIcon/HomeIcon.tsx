import "./HomeIcon.scss"
import {useNavigate} from 'react-router-dom'

export default function HomeIcon(props : {name: string, route: string})
{
    const navigate = useNavigate()

    return (
        <div className="homeIcon" onClick={() => navigate(props.route)}>
            {props.name}
        </div>
    )
}