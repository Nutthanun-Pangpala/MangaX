import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import MangaDetail from "./pages/mangaDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manga/:id" element={<MangaDetail/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;