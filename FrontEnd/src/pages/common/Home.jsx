import React from 'react'
import Banner from "../../Component/home/Banner";
import RecentPosts from "../../Component/home/RecentPosts";
import CollectionGallery from "../../Component/home/CollectionGallery";
import ContributeCall from "../../Component/home/ContributeCall";
import ContributeImpact from "../../Component/home/ContributeImpact";


const Home = () => {
  return (
    <div>
      <Banner />
      <RecentPosts />
      <ContributeCall />
      <CollectionGallery />
      <ContributeImpact />
    </div>
  )
}

export default Home
