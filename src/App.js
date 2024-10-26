import "./App.css";
import { useEffect, useState } from "react";
import parse from "./Parser";
import JsonView from "react18-json-view";

function App() {
  const [value, setValue] = useState("");
  const [textValue, setTextValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("v")) {
      setValue(parse(params.get("v")));
      setTextValue(params.get("v"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            onChange={(event) => {
              setValue(parse(event.target.value));
            }}
            defaultValue={textValue}
            className={"textarea"}
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
