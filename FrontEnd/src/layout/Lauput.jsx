import { Outlet } from 'react-router-dom';
import Headers from '../Component/home/Headers'
import Footer from '../Component/home/Footer'

const Lauput = () => {
  return (
    <div className="app-layout">
      <Headers />
      <main className="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Lauput