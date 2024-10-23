import "./App.css";
import { useEffect, useState } from "react";
import parse from "./Parser";
import JsonView from "react18-json-view";

function App() {
  const params = new URLSearchParams(window.location.search);

  const [value, setValue] = useState(params.get("v") || "");

  useEffect(() => {
    if (params.get("v")) {
      const res = parse(params.get("v"));
      setValue(res);
    }
  }, [value]);

  const handleChange = (event) => {
    const res = parse(event.target.value);
    setValue(res);
  };

  return (
    <div className={"container"}>
      <div>
        <h1>Bear 🐻 Log</h1>
      </div>
      <div className={"main-container"}>
        <div className={"left-container"}>
          <textarea
            type="text"
            id="message"
            onChange={handleChange}
            className={"textarea"}
            defaultValue={value}
            placeholder={"Paste your log here"}
          />
        </div>
        <div className={"right-container"}>
          <div className={"right-content"}>
            <JsonView src={value} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
