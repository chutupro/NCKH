

import "./App.css";
import Banner from "./Component/Banner";
import Exploration from "./Component/Exploration";
import Headers from "./Component/Headers";
import Timeline from "./Component/Timeline";
import Top from "./Component/Top";
import Study from "./Component/Study";
import Footer from "./Component/Footer";
import Connect from "./Component/Connect";

function App() {


  return (
    <div className="app-container">
      <Headers />
      <Banner />
      <Exploration />
      <Connect />
      <Top />
      <Study />
      <Timeline />  
      <Footer />
    </div>
  );
}

export default App;