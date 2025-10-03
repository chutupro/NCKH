

import "./App.css";
import Banner from "./Component/Banner";
import Exploration from "./Component/Exploration";
import Headers from "./Component/Headers";
import Timeline from "./Component/Timeline";
import Top from "./Component/Top";

function App() {


  return (
    <div className="app-container">
      <Headers />
      <Banner />
      <Exploration />
      <Timeline />  
      <Top />
    </div>
  );
}

export default App;