export class Model {
    name: string;
    age: number;
    address: Address;
}

class Address {
    street: string;
    city: City;
}

class City {
    id: number;
    name: string;
}

class ErrorMessage {
    message: string;
    critical: boolean;
}

class ModelError {
    name: ErrorMessage[] = [];
    age: ErrorMessage[] = [];
    address: AddressError = new AddressError();
}

class AddressError {
    street: ErrorMessage;
    city: CityError = new CityError();
}

class CityError {
    id: ErrorMessage[] = [];
    name: ErrorMessage[] = [];
}

class ModelValidator {
    validate(m: Model): ModelError | null {
        let x = new ModelError();
        if (!m.name) {
            x.name.push({
                message: "name is required",
                critical: false,
            });
        }
        return x;
    }
}

let m = new Model();
let errors = new ModelValidator().validate(m);
console.log(JSON.stringify(errors));
