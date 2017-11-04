import * as React from "react";
import * as ReactDOM from "react-dom";

class FormBuilder {}

class ModelForm extends React.Component {
    render() {
        return (
            <div>
                <h1>Model Form</h1>
            </div>
        );
    }
}

const node = document.createElement("div");
document.body.appendChild(node);
ReactDOM.render(<ModelForm />, node);
