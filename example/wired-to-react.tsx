import { Address, Model } from "./model";
import {
    DefaultValidatedFormState,
    Event,
    FormValidator,
    ValidatedFormState,
    ValidatedFormStateManager,
    ValidatedFormBuilder,
} from "../";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { validate, validateSync, ValidationError } from "class-validator";

class ModelForm extends React.PureComponent implements ValidatedFormStateManager<Model> {
    state = {
        formValidator: new FormValidator<Model>(this),
        model: new Model(),
        validationState: DefaultValidatedFormState,
    };

    setModel(model: Model): void {
        this.setState({ model });
    }

    setInternalState(state: ValidatedFormState<Model>): void {
        this.setState({ validationState: state });
    }

    render() {
        const validator = this.state.formValidator.builderForModel(this.state.model, this.state.validationState);

        return (
            <div>
                <h1>Model Form</h1>
                <Input label="Name" {...validator.inputPropsFor("name")} />
                <AddressForm validator={validator.builderForObject("address")} />
                <pre>{JSON.stringify(this.state.model, null, 2)}</pre>
                <pre>{JSON.stringify(this.state.validationState, null, 2)}</pre>
            </div>
        );
    }
}

interface AddressFormProps<K extends string> {
    validator: ValidatedFormBuilder<Address>;
}

class AddressForm<K extends string> extends React.Component<AddressFormProps<K>> {
    render() {
        return (
            <div>
                <h1>Address Form</h1>
                <Input label="Street" {...this.props.validator.inputPropsFor("street")} />
                <pre>{JSON.stringify(this.state, null, 2)}</pre>
            </div>
        );
    }
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    errors: string[];
    label: string;
};

function Input({ label, errors, ...rest }: InputProps) {
    return (
        <label>
            {label}
            <input {...rest} />
            {errors.join(",")}
        </label>
    );
}

const node = document.createElement("div");
document.body.appendChild(node);
ReactDOM.render(<ModelForm />, node);
