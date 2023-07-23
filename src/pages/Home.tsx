import "./Home.scss"
import HomeIcon from "@/components/HomeIcon/HomeIcon";

export default function Home()
{
    return (
        <div id="homePage">
            <HomeIcon name="My Data" route="/collect"/>
            <HomeIcon name="My Books" route="/book"/>
        </div>
    )
}

