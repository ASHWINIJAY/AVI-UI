import { BrowserRouter,Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./screens/LoginPage.jsx";
import LandingPage from "./screens/LandingPage.jsx";
import LocoForm from "./screens/LocoForm.jsx";
import WalkAroundInspect from "./screens/WalkAroundInspect.jsx";
import FrontLocoInspect from "./screens/FrontLocoInspect.jsx";
import ShortNoseInspect from "./screens/ShortNoseInspect.jsx";
import CabLocoInspect from "./screens/CabLocoInspect.jsx";
import ElectCabInspect from "./screens/ElectCabInspect.jsx";
import BatSwitchInspect from "./screens/BatSwitchInspect.jsx";
import LeftMidDoorInspect from "./screens/LeftMidDoorInspect.jsx";
import CirBreakPanInspect from "./screens/CirBreakPanInspect.jsx";
import TopRightPanInspect from "./screens/TopRightPanInspect.jsx";
import MidPanInspect from "./screens/MidPanInspect.jsx";
import BotLeftPanInspect from "./screens/BotLeftPanInspect.jsx";
import CenAirInspect from "./screens/CenAirInspect.jsx";
import EngineDeckInspect from "./screens/EngineDeckInspect.jsx";
import ComFanInspect from "./screens/ComFanInspect.jsx";
import EndDeckInspect from "./screens/EndDeckInspect.jsx";
import CoupGearInspect from "./screens/CoupGearInspect.jsx";
import RoofInspect from "./screens/RoofInspect.jsx";
import DashBoardItems from "./screens/DashBoardItems.jsx";
import UserCreationForm from "./screens/UserCreationForm.jsx";
import UserMaintenance from "./screens/UserMaintenance.jsx";
import WelcomePage from "./screens/WelcomePage.jsx";
import MasterForm from "./screens/MasterForm.jsx";
import ChooseInspect from "./screens/ChooseInspect.jsx";
import WagonLandingPage from "./screens/WagonLandingPage.jsx";
import WagonDashboardUploaded from './screens/WagonDashboardUploaded.jsx';
import UploadedLocoDashboard from './screens/UploadedLocoDashboard.jsx';
import MapView from "./screens/MapView";
import InspectionProcess from './screens/InspectionProcess.jsx';
import CreateTeam from "./screens/CreateTeam.jsx";
import TeamMaintenance from "./screens/TeamMaintenance.jsx";
import WagonInfo from './screens/WagonInfo.jsx';
import WAWagonInspect from './screens/WAWagonInspect.jsx';
import WagonPartsInspect from './screens/WagonPartsInspect.jsx';
import AirBrakePartsInspect from './screens/AirBrakePartsInspect.jsx';
import VacBrakePartsInspect from './screens/VacBrakePartsInspect.jsx';
import WagonFloorInspect from './screens/WagonFloorInspect.jsx';
import LocoInfoCapture from './screens/LocoInfoCapture.jsx';
import E18BD001Inspect from './screens/E18Inspections/E18BD001Inspect.jsx';
import E18FL001Inspect from './screens/E18Inspections/E18FL001Inspect.jsx';
import E18BE001Inspect from './screens/E18Inspections/E18BE001Inspect.jsx';
import E18CC001Inspect from './screens/E18Inspections/E18CC001Inspect.jsx';
import E18CR001Inspect from './screens/E18Inspections/E18CR001Inspect.jsx';
import E18CT001Inspect from './screens/E18Inspections/E18CT001Inspect.jsx';
import E18EE001Inspect from './screens/E18Inspections/E18EE001Inspect.jsx';
import E18EH001Inspect from './screens/E18Inspections/E18EH001Inspect.jsx';
import E18ES001Inspect from './screens/E18Inspections/E18ES001Inspect.jsx';
import E18HC001Inspect from './screens/E18Inspections/E18HC001Inspect.jsx';
import E18HS001Inspect from './screens/E18Inspections/E18HS001Inspect.jsx';
import E18HV001Inspect from './screens/E18Inspections/E18HV001Inspect.jsx';
import E18LV001Inspect from './screens/E18Inspections/E18LV001Inspect.jsx';
import E18MA001Inspect from './screens/E18Inspections/E18MA001Inspect.jsx';
import E18MB001Inspect from './screens/E18Inspections/E18MB001Inspect.jsx';
import E18RF001Inspect from './screens/E18Inspections/E18RF001Inspect.jsx';
import E18WalkInspectForm from './screens/E18Inspections/E18WalkInspectForm.jsx';

import GM34BD001Inspect from './screens/GM34Inspections/GM34BD001Inspect.jsx';
import GM34WalkInspectForm from './screens/GM34Inspections/GM34WalkInspectForm.jsx';
import GM35WalkInspectForm from './screens/GM35Inspections/GM35WalkInspectForm.jsx';
import GM36WalkInspectForm from './screens/GM36Inspections/GM36WalkInspectForm.jsx';

import GM35WA001Inspect from './screens/GM35Inspections/GM35WA001Inspect.jsx';
import GM36WA001Inspect from './screens/GM36Inspections/GM36WA001Inspect.jsx';

import GE34BD001Inspect from './screens/GE34Inspections/GE34BD001Inspect.jsx';
import GE34FL001Inspect from './screens/GE34Inspections/GE34FL001Inspect.jsx';
import GE34SN001Inspect from './screens/GE34Inspections/GE34SN001Inspect.jsx';
import GE34CL001Inspect from './screens/GE34Inspections/GE34CL001Inspect.jsx';
import GE34EC001Inspect from './screens/GE34Inspections/GE34EC001Inspect.jsx';
import GE34BS001Inspect from './screens/GE34Inspections/GE34BS001Inspect.jsx';
import GE34OD001Inspect from './screens/GE34Inspections/GE34OD001Inspect.jsx';
import GE34BC001Inspect from './screens/GE34Inspections/GE34BC001Inspect.jsx';
import GE34AC001Inspect from './screens/GE34Inspections/GE34AC001Inspect.jsx';
import GE34ED001Inspect from './screens/GE34Inspections/GE34ED001Inspect.jsx';
import GE34CF001Inspect from './screens/GE34Inspections/GE34CF001Inspect.jsx';
import GE34DE001Inspect from './screens/GE34Inspections/GE34DE001Inspect.jsx';
import GE34RF001Inspect from './screens/GE34Inspections/GE34RF001Inspect.jsx';
import GE34InspectForm  from './screens/GE34Inspections/GE34InspectForm.jsx';

import GE35InspectForm  from './screens/GE35Inspections/GE35InspectForm.jsx';
import GE36InspectForm  from './screens/GE36Inspections/GE36InspectForm.jsx';
import GE35BD001Inspect from './screens/GE35Inspections/GE35BD001Inspect.jsx';
import GE35FL001Inspect from './screens/GE35Inspections/GE35FL001Inspect.jsx';
import GE35SN001Inspect from './screens/GE35Inspections/GE35SN001Inspect.jsx';
import GE35CL001Inspect from './screens/GE35Inspections/GE35CL001Inspect.jsx';
import GE35EC001Inspect from './screens/GE35Inspections/GE35EC001Inspect.jsx';
import GE35BS001Inspect from './screens/GE35Inspections/GE35BS001Inspect.jsx';
import GE35RF001Inspect from './screens/GE35Inspections/GE35RF001Inspect.jsx';
import GE35DE001Inspect from './screens/GE35Inspections/GE35DE001Inspect.jsx';
import GE35ED001Inspect from './screens/GE35Inspections/GE35ED001Inspect.jsx';
import GE35CF001Inspect from './screens/GE35Inspections/GE35CF001Inspect.jsx';
import GE35OD001Inspect from './screens/GE35Inspections/GE35OD001Inspect.jsx';
import GE35MG001Inspect from './screens/GE35Inspections/GE35MG001Inspect.jsx';
import GE35BC001Inspect from './screens/GE35Inspections/GE35BC001Inspect.jsx';

import GE36BD001Inspect from './screens/GE36Inspections/GE36BD001Inspect.jsx';
import GE36FL001Inspect from './screens/GE36Inspections/GE36FL001Inspect.jsx';
import GE36SN001Inspect from './screens/GE36Inspections/GE36SN001Inspect.jsx';
import GE36CL001Inspect from './screens/GE36Inspections/GE36CL001Inspect.jsx';
import GE36EC001Inspect from './screens/GE36Inspections/GE36EC001Inspect.jsx';
import GE36CA001Inspect from './screens/GE36Inspections/GE36CA001Inspect.jsx';
import GE36MG001Inspect from './screens/GE36Inspections/GE36MG001Inspect.jsx';
import GE36ED001Inspect from './screens/GE36Inspections/GE36ED001Inspect.jsx';
import GE36CF001Inspect from './screens/GE36Inspections/GE36CF001Inspect.jsx';
import GE36DE001Inspect from './screens/GE36Inspections/GE36DE001Inspect.jsx';
import GE36RF001Inspect from './screens/GE36Inspections/GE36RF001Inspect.jsx';
import WagonDoorsInspect from './screens/WagonDoorsInspect.jsx';
import WagonBottomDischargeInspect from './screens/WagonBottomDischargeInspect.jsx';
import WagonStanchionsInspect from './screens/WagonStanchionsInspect.jsx';
import WagonTankersInspect from './screens/WagonTankersInspect.jsx';
import WagonTwistlocksInspect from './screens/WagonTwistlocksInspect.jsx';
import WagonDashboard from './screens/WagonDashboard.jsx';

import PdfQuote from './pdf/PdfQuote.jsx';
import LocoDashboard from './screens/LocoDashboard.jsx';

import { hasOfflineData, syncOfflineData } from "./utils/offlineSync";
import api from "./api/axios";
// ✅ Auth guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

// ✅ Role-based guard
const RoleBasedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  if (!token) return <Navigate to="/" replace />;
  if (allowedRoles.includes(role)) return children;
  return <Navigate to="/landing" replace />;
};

export default function AppRoutes() {
  useEffect(() => {
  let syncInProgress = false;
 const checkInternetConnection = async () => {
    try {
     const token = localStorage.getItem("token");
        const response = await api.get("Landing/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          return true;
        }
      return true;
    } catch {
      return false;
    }
  };
  // ✅ Helper to safely run sync (avoid multiple triggers)
  const trySyncOfflineData = async () => {
    if (!hasOfflineData()) return;
    const isActuallyOnline = await checkInternetConnection();
    if (!isActuallyOnline || syncInProgress) return;
    syncInProgress = true;
    console.log("🌐 Internet available, syncing offline data...");
    try {
      await syncOfflineData();
    } catch (err) {
      console.error("⚠️ Error during offline sync:", err);
    } finally {
      syncInProgress = false;
    }
  };

  // ✅ 1️⃣ Run once when app loads and internet is available
  if (navigator.onLine) {
    trySyncOfflineData();
  }

  // ✅ 2️⃣ Listen for actual connection restore event
  window.addEventListener("online", trySyncOfflineData);

  // ✅ 3️⃣ Optional: periodically check connection status
  const intervalId = setInterval(() => {
    if (navigator.onLine) trySyncOfflineData();
  }, 10000); // every 10 seconds

  // ✅ Cleanup
  return () => {
    window.removeEventListener("online", trySyncOfflineData);
    clearInterval(intervalId);
  };
}, []);


  return (
    <>
    
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Super User gets MasterForm layout */}
        <Route
          path="/master"
          element={
            <RoleBasedRoute allowedRoles={["Super User", "Assessor", "Asset Monitor"]}>
              <MasterForm />
            </RoleBasedRoute>
          }
        >
          <Route path="choose" element={<ChooseInspect />} />
           <Route path="wagon" element={<WagonLandingPage />} />
          <Route path="landing" element={<LandingPage />} />
          <Route path="map" element={<MapView />} />
          <Route path="dashboard1" element={<DashBoardItems />} />
          <Route path="wagondashboard" element={<WagonDashboard />} />
          <Route path="dashboard" element={<LocoDashboard />} />
          <Route path="wagonuploaded" element={<WagonDashboardUploaded />} />
          <Route path="locouploaded" element={<UploadedLocoDashboard />} />
          <Route path="locoform" element={<LocoForm />} />
          <Route
        path="/inspection/:formId?"
        element={<InspectionProcess/>}
      />
          <Route path="usercreation" element={<UserCreationForm />} />
          <Route path="teamcreation" element={<CreateTeam />} />
          <Route path="teams" element={<TeamMaintenance />} />
          <Route path="users" element={<UserMaintenance />} />
          <Route path="welcome" element={<WelcomePage />} />
          <Route path="walkaroundinspect" element={<WalkAroundInspect />} />
          <Route path="frontlocoinspect" element={<FrontLocoInspect />} />
          <Route path="shortnoseinspect" element={<ShortNoseInspect />} />
          <Route path="cablocoinspect" element={<CabLocoInspect />} />
          <Route path="electcabinspect" element={<ElectCabInspect />} />
          <Route path="batswitchinspect" element={<BatSwitchInspect />} />
          <Route path="leftmiddoorinspect" element={<LeftMidDoorInspect />} />
          <Route path="cirbreakpaninspect" element={<CirBreakPanInspect />} />
          <Route path="toprightpaninspect" element={<TopRightPanInspect />} />
          <Route path="midpaninspect" element={<MidPanInspect />} />
          <Route path="botleftpaninspect" element={<BotLeftPanInspect />} />
          <Route path="cenairinspect" element={<CenAirInspect />} />
          <Route path="enginedeckinspect" element={<EngineDeckInspect />} />
          <Route path="comfaninspect" element={<ComFanInspect />} />
          <Route path="enddeckinspect" element={<EndDeckInspect />} />
          <Route path="coupgearinspect" element={<CoupGearInspect />} />
          <Route path="roofinspect" element={<RoofInspect />} />
        </Route>
<Route path="/choose" element={<PrivateRoute><ChooseInspect /></PrivateRoute>} />
          <Route path="/wagon" element={<PrivateRoute><WagonLandingPage /></PrivateRoute>} />
           <Route
        path="/wagoninfo"
        element={<PrivateRoute><WagonInfo/></PrivateRoute>}
      />
      <Route
        path="/locoinfo"
        element={<PrivateRoute><LocoInfoCapture/></PrivateRoute>}
      />
      <Route
        path="/E18BD001"
        element={<PrivateRoute><E18BD001Inspect/></PrivateRoute>}
      />
      <Route
        path="/E18FL001"
        element={<PrivateRoute><E18FL001Inspect/></PrivateRoute>}
      />
      <Route
  path="/E18BE001"
  element={<PrivateRoute><E18BE001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18CC001"
  element={<PrivateRoute><E18CC001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18CR001"
  element={<PrivateRoute><E18CR001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18CT001"
  element={<PrivateRoute><E18CT001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18EE001"
  element={<PrivateRoute><E18EE001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18EH001"
  element={<PrivateRoute><E18EH001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18ES001"
  element={<PrivateRoute><E18ES001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18HC001"
  element={<PrivateRoute><E18HC001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18HS001"
  element={<PrivateRoute><E18HS001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18HV001"
  element={<PrivateRoute><E18HV001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18LV001"
  element={<PrivateRoute><E18LV001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18MA001"
  element={<PrivateRoute><E18MA001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18MB001"
  element={<PrivateRoute><E18MB001Inspect/></PrivateRoute>}
/>
<Route
  path="/E18RF001"
  element={<PrivateRoute><E18RF001Inspect/></PrivateRoute>}
/>
<Route
  path="/inspectE18/:formID"
  element={<PrivateRoute><E18WalkInspectForm/></PrivateRoute>}
/>
     <Route
                path="/GE34BD001"
                element={<PrivateRoute><GE34BD001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34FL001"
                element={<PrivateRoute><GE34FL001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34SN001"
                element={<PrivateRoute><GE34SN001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34CL001"
                element={<PrivateRoute><GE34CL001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34EC001"
                element={<PrivateRoute><GE34EC001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34BS001"
                element={<PrivateRoute><GE34BS001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34OD001"
                element={<PrivateRoute><GE34OD001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34BC001"
                element={<PrivateRoute><GE34BC001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34AC001"
                element={<PrivateRoute><GE34AC001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34ED001"
                element={<PrivateRoute><GE34ED001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34CF001"
                element={<PrivateRoute><GE34CF001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34DE001"
                element={<PrivateRoute><GE34DE001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE34RF001"
                element={<PrivateRoute><GE34RF001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35BD001"
                element={<PrivateRoute><GE35BD001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35FL001"
                element={<PrivateRoute><GE35FL001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35SN001"
                element={<PrivateRoute><GE35SN001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35MG001"
                element={<PrivateRoute><GE35MG001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35OD001"
                element={<PrivateRoute><GE35OD001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35CL001"
                element={<PrivateRoute><GE35CL001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35ED001"
                element={<PrivateRoute><GE35ED001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35DE001"
                element={<PrivateRoute><GE35DE001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35RF001"
                element={<PrivateRoute><GE35RF001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35BC001"
                element={<PrivateRoute><GE35BC001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35EC001"
                element={<PrivateRoute><GE35EC001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35BS001"
                element={<PrivateRoute><GE35BS001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE35CF001"
                element={<PrivateRoute><GE35CF001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE36BD001"
                element={<PrivateRoute><GE36BD001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE36FL001"
                element={<PrivateRoute><GE36FL001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE36SN001"
                element={<PrivateRoute><GE36SN001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE36CL001"
                element={<PrivateRoute><GE36CL001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE36MG001"
                element={<PrivateRoute><GE36MG001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE36EC001"
                element={<PrivateRoute><GE36EC001Inspect /></PrivateRoute>}
            />
            
            <Route
                path="/GE36ED001"
                element={<PrivateRoute><GE36ED001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE36DE001"
                element={<PrivateRoute><GE36DE001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE36CF001"
                element={<PrivateRoute><GE36CF001Inspect /></PrivateRoute>}
            />
            
            <Route
                path="/GE36RF001"
                element={<PrivateRoute><GE36RF001Inspect /></PrivateRoute>}
            />
            <Route
                path="/GE36CA001"
                element={<PrivateRoute><GE36CA001Inspect /></PrivateRoute>}
            />
      <Route
        path="/GM34BD001"
        element={<PrivateRoute><GM34BD001Inspect/></PrivateRoute>}
      />
      <Route path="/inspect/:formID" element={<GM34WalkInspectForm />} />
<Route path="/inspectGm35/:formID" element={<GM35WalkInspectForm />} />
<Route path="/inspectGm36/:formID" element={<GM36WalkInspectForm />} />
<Route path="/inspectGe34/:formID" element={<GE34InspectForm />} />
<Route path="/inspectGe35/:formID" element={<GE35InspectForm />} />
<Route path="/inspectGe36/:formID" element={<GE36InspectForm />} />
      <Route
        path="/GM35WA001"
        element={<PrivateRoute><GM35WA001Inspect/></PrivateRoute>}
      />
      <Route
        path="/GM36WA001"
        element={<PrivateRoute><GM36WA001Inspect/></PrivateRoute>}
      />
      <Route
        path="/walkaroundwagon"
        element={<PrivateRoute><WAWagonInspect/></PrivateRoute>}
      />
      <Route
        path="/wagonparts"
        element={<PrivateRoute><WagonPartsInspect/></PrivateRoute>}
      />
      <Route
        path="/airbrakeparts"
        element={<PrivateRoute><AirBrakePartsInspect/></PrivateRoute>}
      />
      <Route
        path="/vacbrakeparts"
        element={<PrivateRoute><VacBrakePartsInspect/></PrivateRoute>}
      />
      <Route
        path="/wagonfloor"
        element={<PrivateRoute><WagonFloorInspect/></PrivateRoute>}
      />
      <Route
                path="/wagondoors"
                element={<PrivateRoute><WagonDoorsInspect /></PrivateRoute>}
            />
            <Route
                path="/wagonbottom"
                element={<PrivateRoute><WagonBottomDischargeInspect /></PrivateRoute>}
            />
            <Route
                path="/wagontanker"
                element={<PrivateRoute><WagonTankersInspect /></PrivateRoute>}
            />
            <Route
                path="/wagontwist"
                element={<PrivateRoute><WagonTwistlocksInspect /></PrivateRoute>}
            />
            <Route
                path="/wagonstan"
                element={<PrivateRoute><WagonStanchionsInspect /></PrivateRoute>}
            />
             <Route
                path="/wagondash"
                element={<PrivateRoute><WagonDashboard /></PrivateRoute>}
            />
            <Route
                path="/pdfquote"
                element={<PrivateRoute><PdfQuote /></PrivateRoute>}
            />
        {/* Normal users → existing flat routes */}
        <Route path="/landing" element={<PrivateRoute><LandingPage /></PrivateRoute>} />
        <Route path="/welcome" element={<PrivateRoute><WelcomePage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><LocoDashboard /></PrivateRoute>} />
        <Route path="/locoform" element={<PrivateRoute><LocoForm /></PrivateRoute>} />
        <Route
        path="/inspection/:formId?"
        element={<PrivateRoute><InspectionProcess/></PrivateRoute>}
      />
        <Route path="/walkaroundinspect" element={<PrivateRoute><WalkAroundInspect /></PrivateRoute>} />
        <Route path="/frontlocoinspect" element={<PrivateRoute><FrontLocoInspect /></PrivateRoute>} />
        <Route path="/shortnoseinspect" element={<PrivateRoute><ShortNoseInspect /></PrivateRoute>} />
        <Route path="/cablocoinspect" element={<PrivateRoute><CabLocoInspect /></PrivateRoute>} />
        <Route path="/electcabinspect" element={<PrivateRoute><ElectCabInspect /></PrivateRoute>} />
        <Route path="/batswitchinspect" element={<PrivateRoute><BatSwitchInspect /></PrivateRoute>} />
        <Route path="/leftmiddoorinspect" element={<PrivateRoute><LeftMidDoorInspect /></PrivateRoute>} />
        <Route path="/cirbreakpaninspect" element={<PrivateRoute><CirBreakPanInspect /></PrivateRoute>} />
        <Route path="/toprightpaninspect" element={<PrivateRoute><TopRightPanInspect /></PrivateRoute>} />
        <Route path="/midpaninspect" element={<PrivateRoute><MidPanInspect /></PrivateRoute>} />
        <Route path="/botleftpaninspect" element={<PrivateRoute><BotLeftPanInspect /></PrivateRoute>} />
        <Route path="/cenairinspect" element={<PrivateRoute><CenAirInspect /></PrivateRoute>} />
        <Route path="/enginedeckinspect" element={<PrivateRoute><EngineDeckInspect /></PrivateRoute>} />
        <Route path="/comfaninspect" element={<PrivateRoute><ComFanInspect /></PrivateRoute>} />
        <Route path="/enddeckinspect" element={<PrivateRoute><EndDeckInspect /></PrivateRoute>} />
        <Route path="/coupgearinspect" element={<PrivateRoute><CoupGearInspect /></PrivateRoute>} />
        <Route path="/roofinspect" element={<PrivateRoute><RoofInspect /></PrivateRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
