import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BeatDetail from './pages/BeatDetail';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/beat/:slug" element={<BeatDetail />} />
      </Route>
    </Routes>
  );
}