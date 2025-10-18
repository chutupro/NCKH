import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Lauput from '../layout/Lauput'
import Personal from '../pages/common/Personal'
import Timeline from '../pages/Timeline/Timeline'
import Home from '../pages/common/Home'
import Contribute from '../pages/contribute/Contribute'
import ContributeInformation from '../pages/contribute/ContributeInformation'
import ImageLibrary from '../pages/gallery/ImageLibrary'
import Login from '../pages/common/Login'
import Register from '../pages/common/Register'
import Community from '../pages/community/Community'
import CompareGallery from '../pages/Compare/CompareGallery'



const Routee = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Lauput />}>
          <Route index element={<Home />} />
          <Route path='/Personal' element={<Personal />}></Route>
          <Route path='/timeline' element={<Timeline />}></Route>
          <Route path='/contribute' element={<Contribute />}></Route>
          <Route path='/contributeinformation' element={<ContributeInformation />}></Route>
          <Route path='/ImageLibrary' element={<ImageLibrary />}></Route>
          <Route path='/compare' element={<CompareGallery />}></Route>
        </Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/community' element={<Community />}></Route>
      </Routes>
    </div>
  )
}

export default Routee