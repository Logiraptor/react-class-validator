import { validate, validateSync, ValidationError } from "class-validator";

function update<T extends object>(base: T, data: Partial<T>): T {
    return Object.assign(Object.create(base), base, data);
}

export type Event<T, K extends string> = {
    currentTarget: {
        name: K;
        value: T;
    };
};

export interface ValidatedFormState<T> {
    blurredFields: string[];
}

export const DefaultValidatedFormState: ValidatedFormState<any> = {
    blurredFields: [],
};

export interface ValidatedFormStateMutator<T> {
    addBlurredField(field: string): void;
    fieldHasBlurred(field: string): boolean;
    setModel(model: T): void;
}

export interface ValidatedFormStateManager<T> {
    setModel(model: T): void;
    setInternalState(state: ValidatedFormState<T>): void;
}

export class FormValidator<T extends object> {
    constructor(private stateManager: ValidatedFormStateManager<T>) {}

    builderForModel(model: T, state: ValidatedFormState<T>): ValidatedFormBuilder<T> {
        return new ValidatedFormBuilder(model, state, {
            fieldHasBlurred: (field: keyof T) => {
                return state.blurredFields.indexOf(field) !== -1;
            },
            addBlurredField: (field: keyof T) => {
                if (state.blurredFields.indexOf(field) !== -1) {
                    return;
                }
                this.stateManager.setInternalState({
                    blurredFields: [ ...state.blurredFields, field ],
                });
            },
            setModel: (model: T) => {
                this.stateManager.setModel(model);
            },
        });
    }
}

export class ValidatedFormBuilder<T extends object> {
    private allErrors: ValidationError[];
    private immediateErrors: ValidationError[];

    constructor(
        private model: T,
        private state: ValidatedFormState<T>,
        private stateManager: ValidatedFormStateMutator<T>,
    ) {
        this.immediateErrors = validateSync(this.model, {
            groups: [ "immediate" ],
        });
        this.allErrors = validateSync(this.model);

        this.renderErrors = this.renderErrors.bind(this);
        this.change = this.change.bind(this);
        this.blur = this.blur.bind(this);
    }

    inputPropsFor<K extends keyof T>(field: K) {
        return {
            name: field,
            value: this.model[field],
            onChange: this.change as (event: Event<T[K], string>) => void,
            onBlur: this.blur as (event: Event<T[K], string>) => void,
            errors: this.renderErrors(field),
        };
    }

    builderForObject<K extends keyof T>(field: K) {
        return new ValidatedFormBuilder<T[K]>(this.model[field], this.state, {
            setModel: (subField) => {
                this.change({
                    currentTarget: {
                        name: field,
                        value: subField,
                    },
                });
            },
            fieldHasBlurred: (subField: keyof T) => {
                return this.stateManager.fieldHasBlurred(`${field}.${subField}`);
            },
            addBlurredField: (subField: keyof T) => {
                return this.stateManager.addBlurredField(`${field}.${subField}`);
            },
        });
    }

    builderForArray<ElementType extends object>(field: keyof T) {
        return new ValidatedArrayFormBuilder<ElementType>(this.model[field], this.state, {
            setModel: (subField) => {
                this.change({
                    currentTarget: {
                        name: field,
                        value: subField,
                    },
                });
            },
            fieldHasBlurred: (subField: keyof T) => {
                return this.stateManager.fieldHasBlurred(`${field}.${subField}`);
            },
            addBlurredField: (subField: keyof T) => {
                return this.stateManager.addBlurredField(`${field}.${subField}`);
            },
        });
    }

    private change<K extends keyof T>(event: Event<T[K], K>) {
        const newFields: Partial<T> = {};
        newFields[event.currentTarget.name] = event.currentTarget.value;
        const newModel = update(this.model, newFields);
        this.stateManager.setModel(newModel);
    }

    private blur<K extends keyof T>(event: Event<T[K], K>) {
        const name = event.currentTarget.name;
        this.stateManager.addBlurredField(event.currentTarget.name);
    }

    private collectErrors(errors: ValidationError[], property: string) {
        return [].concat(
            ...errors.filter((x) => x.property === property).map((x) => x.constraints).map((x) => {
                return Object.keys(x).map((key: string) => x[key]);
            }),
        );
    }

    private renderErrors(field: keyof T): string[] {
        if (this.stateManager.fieldHasBlurred(field)) {
            return this.collectErrors(this.allErrors, field);
        }
        return this.collectErrors(this.immediateErrors, field);
    }
}

export class ValidatedArrayFormBuilder<K extends object> {
    constructor(
        private model: K[],
        private state: ValidatedFormState<K[]>,
        private stateManager: ValidatedFormStateMutator<K[]>,
    ) {}

    builderForElement(index: number) {
        return new ValidatedFormBuilder<K>(this.model[index], this.state, {
            setModel: (subField) => {
                const newModel = [ ...this.model ];
                newModel[index] = subField;
                this.stateManager.setModel(newModel);
            },
            fieldHasBlurred: (subField: keyof K) => {
                return this.stateManager.fieldHasBlurred(`${index}.${subField}`);
            },
            addBlurredField: (subField: keyof K) => {
                return this.stateManager.addBlurredField(`${index}.${subField}`);
            },
        });
    }
}
