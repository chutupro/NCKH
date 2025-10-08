import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Lauput from '../layout/Lauput'
import Personal from '../pages/Personal'



const Routee = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Lauput/>}></Route>
        <Route path='/Personal' element={<Personal />}></Route>
      </Routes>
    </div>
  )
}

export default Routee