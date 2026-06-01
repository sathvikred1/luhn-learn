import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import MapPage from './components/map/MapPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  );
}
