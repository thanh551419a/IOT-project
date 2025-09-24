import { BrowserRouter as Router } from "react-router-dom";
import Menu from "../components/Menu";
import Render from "../components/Render";
import "../app/App.css";
function App() {
  return (
    <Router>
      <div
        style={{
          width: "95vw",
          height: "95vh",
          marginTop: "20px",
          backgroundColor: "white",
          border: "2px solid black",
          borderRadius: "100px",
          backgroundClip: "padding-box",
          display: "flex",
          alignSelf: "center",
        }}
      >
        <Menu />

        <Render />
      </div>
    </Router>
  );
}

export default App;
