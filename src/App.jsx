import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Landing } from './pages/Landing';
import { CaseStudy } from './pages/CaseStudy';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="app">
            <Header />
            <Landing />
          </div>
        } />
        <Route path="/case/:id" element={<CaseStudy />} />
      </Routes>
    </BrowserRouter>
  );
}
