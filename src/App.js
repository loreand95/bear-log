import './App.css';
import {useState} from "react";
import parse from "./Parser";
import JsonView from "react18-json-view";

function App() {

    const [value, setValue] = useState("");

    const handleChange = event => {
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
                        placeholder={"Paste your log here"}
                    />
                </div>
                <div className={"right-container"}>
                    <div className={"right-content"}>
                        <JsonView src={value}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
