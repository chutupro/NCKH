import React from 'react'
import Banner from "../Component/home/Banner";
import Exploration from "../Component/home/Exploration";
import Headers from "../Component/home/Headers";
import Timeline from "../Component/home/Timeline";
import Top from "../Component/home/Top";
import Study from "../Component/home/Study";
import Footer from "../Component/home/Footer";
import Connect from "../Component/home/Connect";

const Home = () => {
  return (
    <div>
      <Headers />
      <Banner />
      <Exploration />
      <Connect />
      <Top />
      <Study />
      <Timeline />
      <Footer />
    </div>
  )
}

export default Home