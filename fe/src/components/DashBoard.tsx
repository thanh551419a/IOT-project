import React from "react";
//import SquareInformation from "../../components/SquareInformation/SquareInformation";
//import Logo from "./assets/Humidity.png"; // import trực tiếp ảnh
import ImageLoader from "../components/ImageLoader";
function DashBoard() {
  return (
    <div>
      <ImageLoader name="Humidity" alt="Humidity" />
    </div>
  );
}

export default DashBoard;
