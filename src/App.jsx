import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AppRoutes from './routes.jsx';
import { Router } from 'react-router-dom';


export default function App() {
  return (
      <>
      <Header />
        <AppRoutes/>
      <Footer />
      </>
  );
}
