import { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Home from './pages/Home'
import CustomizedPage from './pages/CustomizedPage'
import { userDataContext } from './context/UserContext'
import Hello from './pages/Hello'
import CustomizedPage2 from './pages/CustomizedPage2'

function App() {
  const { currentUser, setCurrentUser } = useContext(userDataContext);

  return (
    <div>
      <Routes>
        <Route 
          path="/" 
          element={
            (currentUser?.assistantImage && currentUser?.assistantName)
              ? <Home /> 
              : <Navigate to="/customized" />
          }  
        />
        <Route 
          path="/signup" 
          element={
            !currentUser ? <SignUp /> : <Navigate to="/" />
          } 
        />
        <Route 
          path="/login" 
          element={
            !currentUser ? <Login /> : <Navigate to="/" />
          } 
        />
        <Route 
          path="/customized" 
          element={
            currentUser ? <CustomizedPage /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/customized2" 
          element={
            currentUser ? <CustomizedPage2 /> : <Navigate to="/login" />
          } 
        />
        <Route path='/hello' to='/hello' element={<Hello/>} />
      </Routes>
    </div>
  );
}

export default App;
