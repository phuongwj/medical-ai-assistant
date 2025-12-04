import { BrowserRouter, Routes, Route } from 'react-router';

import Index from './pages/Index';
import './App.css';

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
