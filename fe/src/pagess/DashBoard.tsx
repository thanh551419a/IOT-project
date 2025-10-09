import React, { useState } from "react";
//import SquareInformation from "../../components/SquareInformation/SquareInformation";
//import Logo from "./assets/Humidity.png"; // import trực tiếp ảnh
import HumidityIcon from "../assets/WidgetImage/Humidity.svg";
import LightBubs from "../assets/WidgetImage/LightBub.svg";
import TemperatureIcon from "../assets/WidgetImage/Temperature.svg";
import Widget from "../components/Widget";
import ToggleSwitch from "../components/ToggleSwitch";
import airConditioner from "../assets/ToggleImage/airConditioner.svg";
import fan from "../assets/ToggleImage/fan.svg";
import Light from "../assets/ToggleImage/Light.svg";
function DashBoard() {
  const [state, setState] = useState({
    air: true,
    fan: false,
    light: true,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "95vh", // full màn hình
        width: "100%",
        border: "2px solid red", // debug cha
      }}
    >
      {/* Box chứa Widget - chiếm 33% */}
      <div
        style={{
          flex: "0 0 33%", // đúng 33% chiều cao
          display: "flex",
          flexDirection: "row",
          width: "97%",
          position: "relative",
          left: "0%",
          border: "2px solid blue", // debug box widget
          alignItems: "center",
        }}
      >
        <Widget
          source={TemperatureIcon}
          name="Temperature"
          value="60"
          unit="°C"
        />
        <Widget source={HumidityIcon} name="Humidity" value="60" unit="%" />
        <Widget source={LightBubs} name="Light" value="600" unit="LUX" />
      </div>

      {/* Box chứa ToggleSwitch - chiếm 67% */}
      <div
        style={{
          flex: "0 0 67%", // chiếm phần còn lại
          display: "flex",
          justifyContent: "flex-end", // sang phải
          alignItems: "flex-end", // xuống dưới
          border: "2px solid green", // debug box toggle
        }}
      >
        <div
          style={{
            width: "25%", // 25% ngang cha
            height: "100%", // chiếm hết phần còn lại
            display: "flex",
            flexDirection: "column",
            // justifyContent: "space-evenly", // ✅ thay vì space-around
            alignItems: "center",
            // border: "2px solid orange", // debug container toggle switch
          }}
        >
          <ToggleSwitch
            source={airConditioner}
            isOn={state.air}
            onToggle={() => setState({ ...state, air: !state.air })}
          />
          <ToggleSwitch
            source={fan}
            isOn={state.fan}
            onToggle={() => setState({ ...state, fan: !state.fan })}
          />
          <ToggleSwitch
            source={Light}
            isOn={state.light}
            onToggle={() => setState({ ...state, light: !state.light })}
          />
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
