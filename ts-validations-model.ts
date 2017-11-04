import {
    IsNotEmpty,
    validateSync,
    ValidateNested,
    IsDefined,
    MinLength,
    MaxLength,
    ValidationError,
} from "class-validator";

export class Model {
    @IsNotEmpty({
        message: "Name is required",
    })
    @MinLength(1)
    @MaxLength(10)
    name: string;

    age: number;

    @ValidateNested()
    @IsDefined()
    address: Address;
}

class Address {
    @IsNotEmpty() street: string;
    city: City;
}

class City {
    id: number;

    name: string;
}

let m = new Model();
m.address = new Address();

let errors = validateSync(m);
console.log(JSON.stringify(errors));

console.log(JSON.stringify(collectErrors(errors, "name")));

function collectErrors(errors: ValidationError[], property: string) {
    return [].concat(
        ...errors.filter((x) => x.property === property).map((x) => x.constraints).map((x) => {
            return Object.keys(x).map((key: string) => x[key]);
        }),
    );
}
