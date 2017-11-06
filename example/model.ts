import {
    IsAlpha,
    IsDefined,
    IsNotEmpty,
    Matches,
    MaxLength,
    MinLength,
    ValidateNested,
    validateSync,
    ValidationError,
} from "class-validator";

export class Model {
    @IsNotEmpty({
        message: "Name is required",
    })
    @MinLength(1)
    @MaxLength(10, {
        groups: [ "immediate" ],
    })
    @Matches(/^[a-zA-Z]*$/, {
        groups: [ "immediate" ],
        message: "Name may only contain letters",
    })
    name: string = "";

    @ValidateNested()
    @IsDefined()
    address: Address = new Address();
}

export class Address {
    @IsNotEmpty({
        groups: [ "immediate" ],
    })
    street: string = "";
}
