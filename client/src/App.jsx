import Contact from './pages/Contact';
import Genre from './pages/Genre';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import BeatDetail from './pages/BeatDetail';
import Videos from './pages/Videos';
import Admin from './pages/Admin';
import Blog from './pages/Blog';
import PostDetail from './pages/PostDetail';
import { ToastProvider } from './components/Toast';
import './App.css';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
                    <Route path="/contact" element={<Contact />} />
          <Route path="/beat/:slug" element={<BeatDetail />} />
                    <Route path="/genre/:tag" element={<Genre />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/news" element={<Blog />} />
          <Route path="/news/:slug" element={<PostDetail />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Routes>
    </ToastProvider>
  );
}