import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Lauput from '../layout/Lauput'
import Personal from '../pages/Personal'
import Timeline from '../pages/Timeline'
import Home from '../pages/Home'
import Contribute from '../pages/Contribute'
import ContributeInformation from '../pages/ContributeInformation'
import ImageLibrary from '../pages/ImageLibrary'



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
        </Route>
      </Routes>
    </div>
  )
}

export default Routee