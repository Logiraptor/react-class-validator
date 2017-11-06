import { IsDefined, MinLength } from "class-validator";
import {
    DefaultValidatedFormState,
    FormValidator,
    ValidatedFormBuilder,
    ValidatedFormState,
    ValidatedFormStateManager,
} from "./";
import "mocha";
import { expect } from "chai";

describe("ValidatedForm", () => {
    function setupValidationBuilder<T extends object>(model: T) {
        let validatorState = DefaultValidatedFormState;
        const mockFormStateManager = {
            setInternalState(s: ValidatedFormState<T>) {
                validatorState = s;
            },
            setModel(m: T) {
                model = m;
            },
        };
        const formValidator = new FormValidator<T>(mockFormStateManager);

        return {
            get builder() {
                return formValidator.builderForModel(model, validatorState);
            },
            get currentModel() {
                return model;
            },
        };
    }

    describe("Array fields", () => {
        class Model {
            @MinLength(1)
            name: string = "";
            subModels: SubModel[] = [ new SubModel() ];
            strings: string[];
        }

        class SubModel {
            @MinLength(1)
            name: string = "";
        }

        it("prevents name collisions on fields", () => {
            const model = new Model();
            const subject = setupValidationBuilder(model);

            // blurring a field on the base model is independent from
            // blurring a field on a sub model
            const modelProps = subject.builder.inputPropsFor("name");
            expect(modelProps.errors).to.be.empty;
            modelProps.onBlur({ currentTarget: { name: "name", value: "" } });
            const newModelProps = subject.builder.inputPropsFor("name");
            expect(newModelProps.errors).not.to.be.empty;

            const subModelProps = subject.builder
                .builderForArray<SubModel>("subModels")
                .builderForElement(0)
                .inputPropsFor("name");

            expect(subModelProps.errors).to.be.empty;
            subModelProps.onBlur({ currentTarget: { name: "name", value: "" } });
            const newSubModelProps = subject.builder
                .builderForArray<SubModel>("subModels")
                .builderForElement(0)
                .inputPropsFor("name");
            expect(newSubModelProps.errors).not.to.be.empty;
        });

        it("clones the entire structure on subModel change", () => {
            const model = new Model();
            const subject = setupValidationBuilder(model);
            subject.builder.builderForArray<SubModel>("subModels").builderForElement(0).inputPropsFor("name").onChange({
                currentTarget: {
                    name: "name",
                    value: "Bob",
                },
            });
            expect(model).to.not.eql(subject.currentModel);
            expect(subject.currentModel.subModels[0].name).to.eq("Bob");
            expect(subject.currentModel).to.be.an.instanceOf(Model);
            expect(subject.currentModel.subModels[0]).to.be.an.instanceOf(SubModel);
        });
    });

    describe("Nested Models", () => {
        class Model {
            @MinLength(1)
            name: string = "";
            subModel: SubModel = new SubModel();
        }
        class SubModel {
            @MinLength(1)
            name: string = "";
        }

        it("prevents name collisions on fields", () => {
            const model = new Model();
            const subject = setupValidationBuilder(model);

            // blurring a field on the base model is independent from
            // blurring a field on a sub model
            const modelProps = subject.builder.inputPropsFor("name");
            expect(modelProps.errors).to.be.empty;
            modelProps.onBlur({ currentTarget: { name: "name", value: "" } });
            const newModelProps = subject.builder.inputPropsFor("name");
            expect(newModelProps.errors).not.to.be.empty;

            const subModelProps = subject.builder.builderForObject("subModel").inputPropsFor("name");
            expect(subModelProps.errors).to.be.empty;
            subModelProps.onBlur({ currentTarget: { name: "name", value: "" } });
            const newSubModelProps = subject.builder.builderForObject("subModel").inputPropsFor("name");
            expect(newSubModelProps.errors).not.to.be.empty;
        });

        it("clones the entire structure on subModel change", () => {
            const model = new Model();
            const subject = setupValidationBuilder(model);
            subject.builder.builderForObject("subModel").inputPropsFor("name").onChange({
                currentTarget: {
                    name: "name",
                    value: "Bob",
                },
            });
            expect(model).to.not.eql(subject.currentModel);
            expect(subject.currentModel.subModel.name).to.eq("Bob");
            expect(subject.currentModel).to.be.an.instanceOf(Model);
            expect(subject.currentModel.subModel).to.be.an.instanceOf(SubModel);
        });
    });

    describe("value binding", () => {
        class Model {
            name: string = "";
        }

        it("binds model values to props", () => {
            const testModel = new Model();
            testModel.name = "Bob";
            const subject = setupValidationBuilder(testModel);

            const props = subject.builder.inputPropsFor("name");
            expect(props.value).to.eq("Bob");
            props.onChange({
                currentTarget: {
                    name: "name",
                    value: "Joe",
                },
            });

            expect(testModel.name).to.eq("Bob", "Original model should not change");
            const newProps = subject.builder.inputPropsFor("name");
            expect(subject.currentModel.name).to.eq("Joe", "New model should have updated");
            expect(newProps.value).to.eq("Joe", "Props value should have updated");
        });
    });

    describe("error generation", () => {
        describe("immediate error group", () => {
            class ModelWithOneImmediateValidation {
                @IsDefined({ groups: [ "immediate" ] })
                name: string;
            }

            it("always renders immediate errors", () => {
                const testModel = new ModelWithOneImmediateValidation();
                const subject = setupValidationBuilder(testModel);

                const props = subject.builder.inputPropsFor("name");
                expect(props.errors).not.to.be.empty;
            });
        });

        describe("all errors", () => {
            class ModelWithMixedValidations {
                @IsDefined({ groups: [ "immediate" ] })
                @MinLength(1)
                name: string;
            }

            it("hides non-immediate errors until blur", () => {
                const testModel = new ModelWithMixedValidations();
                const subject = setupValidationBuilder(testModel);

                const props = subject.builder.inputPropsFor("name");
                expect(props.errors).to.have.length(1);

                props.onBlur({
                    currentTarget: {
                        name: "name",
                        value: "",
                    },
                });

                const newProps = subject.builder.inputPropsFor("name");
                expect(newProps.errors).to.have.length(2);
            });
        });
    });
});
