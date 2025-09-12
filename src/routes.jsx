import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './screens/LoginPage.jsx';
import LandingPage from './screens/LandingPage.jsx';
import LocoForm from './screens/LocoForm.jsx';
import WalkAroundInspect from './screens/WalkAroundInspect.jsx';
import FrontLocoInspect from './screens/FrontLocoInspect.jsx';
import ShortNoseInspect from './screens/ShortNoseInspect.jsx';
import CabLocoInspect from './screens/CabLocoInspect.jsx';
import ElectCabInspect from './screens/ElectCabInspect.jsx';
import BatSwitchInspect from './screens/BatSwitchInspect.jsx';
import LeftMidDoorInspect from './screens/LeftMidDoorInspect.jsx';
import CirBreakPanInspect from './screens/CirBreakPanInspect.jsx';
import TopRightPanInspect from './screens/TopRightPanInspect.jsx';
import MidPanInspect from './screens/MidPanInspect.jsx';
import BotLeftPanInspect from './screens/BotLeftPanInspect.jsx';
import CenAirInspect from './screens/CenAirInspect.jsx';
import EngineDeckInspect from './screens/EngineDeckInspect.jsx';
import ComFanInspect from './screens/ComFanInspect.jsx';
import EndDeckInspect from './screens/EndDeckInspect.jsx';
import CoupGearInspect from './screens/CoupGearInspect.jsx';
import RoofInspect from './screens/RoofInspect.jsx';
import DashBoardItems from './screens/DashBoardItems.jsx';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/landing" element={<PrivateRoute><LandingPage/></PrivateRoute>} />
      <Route
        path="/locoform"
        element={<PrivateRoute><LocoForm/></PrivateRoute>}
      />
      <Route
        path="/walkaroundinspect"
        element={<PrivateRoute><WalkAroundInspect/></PrivateRoute>}
      />
      <Route
        path="/frontlocoinspect"
        element={<PrivateRoute><FrontLocoInspect/></PrivateRoute>}
      />
      <Route
        path="/shortnoseinspect"
        element={<PrivateRoute><ShortNoseInspect/></PrivateRoute>}
      />
      <Route
        path="/cablocoinspect"
        element={<PrivateRoute><CabLocoInspect/></PrivateRoute>}
      />
      <Route
        path="/electcabinspect"
        element={<PrivateRoute><ElectCabInspect/></PrivateRoute>}
      />
      <Route
        path="/batswitchinspect"
        element={<PrivateRoute><BatSwitchInspect/></PrivateRoute>}
      />
      <Route
        path="/leftmiddoorinspect"
        element={<PrivateRoute><LeftMidDoorInspect/></PrivateRoute>}
      />
      <Route
        path="/cirbreakpaninspect"
        element={<PrivateRoute><CirBreakPanInspect/></PrivateRoute>}
      />
      <Route
        path="/toprightpaninspect"
        element={<PrivateRoute><TopRightPanInspect/></PrivateRoute>}
      />
      <Route
        path="/midpaninspect"
        element={<PrivateRoute><MidPanInspect/></PrivateRoute>}
      />
      <Route
        path="/botleftpaninspect"
        element={<PrivateRoute><BotLeftPanInspect/></PrivateRoute>}
      />
      <Route
        path="/cenairinspect"
        element={<PrivateRoute><CenAirInspect/></PrivateRoute>}
      />
      <Route
        path="/enginedeckinspect"
        element={<PrivateRoute><EngineDeckInspect/></PrivateRoute>}
      />
      <Route
        path="/comfaninspect"
        element={<PrivateRoute><ComFanInspect/></PrivateRoute>}
      />
      <Route
        path="/enddeckinspect"
        element={<PrivateRoute><EndDeckInspect/></PrivateRoute>}
      />
      <Route
        path="/coupgearinspect"
        element={<PrivateRoute><CoupGearInspect/></PrivateRoute>}
      />
      <Route
        path="/roofinspect"
        element={<PrivateRoute><RoofInspect/></PrivateRoute>}
      />
      <Route
        path="/dashboard"
        element={<PrivateRoute><DashBoardItems/></PrivateRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}