import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Profile from './Pages/Profile'
import About from './Pages/About'
import SignIn from './Pages/SignIn'
import SignUp from './Pages/SignUp'

import Header from './Components/Header'
import PrivateRoute from './Components/PrivateRoute'
import CreateListing from './Pages/CreateListing'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home /> }/>
        <Route path='/signin' element={<SignIn /> }/>
        <Route path='/signup' element={<SignUp /> }/>
        <Route element={<PrivateRoute/>} >
          <Route path='/profile' element={<Profile /> }/>
          <Route path='/create-listing' element={<CreateListing/>}/>
        </Route>
        <Route path='/about' element={<About /> }/>
      </Routes>
    </BrowserRouter>
  )
}
