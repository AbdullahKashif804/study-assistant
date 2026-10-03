import Header from "../../components/layout/Header"
import HomeHowItWorks from "./HomeHowItWorks"
import HomeFeatures from "./HomeFeatures"
import HomeHero from "./HomeHero"
import HomeCTA from "./HomeCTA"
import Footer from "../../components/layout/Footer"

function Home(){
    return(
    <>
    <Header/>
    <HomeHero/>
    <HomeFeatures/>
    <HomeHowItWorks/>
    <HomeCTA/>
    <Footer/>
    </>
    )
    
}
export default Home