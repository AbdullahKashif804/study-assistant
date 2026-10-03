import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import VerifyEmail from './pages/Auth/VerifyEmail'
import {Routes,Route} from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard';
import Notes from './pages/Notes/Notes';
import Assignments from './pages/Assignments/Assignments'
import Courses from './pages/Courses/Courses'
import DailyTasks from './pages/DailyTasks/DailyTasks';
import TodoTasks from './pages/TodoTasks/TodoTasks';
import Quizzes from './pages/Quizzes/Quizzes';
import Projects from './pages/Projects/Projects';
import Profile from "./pages/Profile/Profile";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import Terms from "./pages/Legal/Terms";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Settings from "./pages/Settings/Settings";
function App() {
  return (
    <>
    <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/verify-email' element={<VerifyEmail/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/notes' element={<Notes/>}/>
        <Route path='/assignment' element={<Assignments/>}/>
        <Route path='/course' element={<Courses/>}/>
        <Route path='/dailyTask' element={<DailyTasks/>}/>
        <Route path='/todoTask' element={<TodoTasks/>}/>
        <Route path='/quiz' element={<Quizzes/>}/>
        <Route path='/project' element={<Projects/>}/>
        <Route path="/profile" element={<Profile />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/settings" element={<Settings />} />
    </Routes>
    </>
      

  );
}

export default App;