import { BrowserRouter, Route, Routes } from "react-router-dom";
import Reader from "./pages/Reader";
import Home from "./pages/home";
import MangaDetail from "./pages/mangaDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manga/:id" element={<MangaDetail/>}/>
        <Route path="/read/:chapterId" element={<Reader/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;