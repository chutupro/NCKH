import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Lauput from '../layout/Lauput'
import Personal from '../pages/Personal'
import Timeline from '../pages/Timeline'



const Routee = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Lauput/>}></Route>
        <Route path='/Personal' element={<Personal />}></Route>
        <Route path='/timeline' element={<Timeline />}></Route>
      </Routes>
    </div>
  )
}

export default Routee