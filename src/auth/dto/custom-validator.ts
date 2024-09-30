import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: false})
class IsPasswordRequiredConstraint implements ValidatorConstraintInterface {
    validate(password: any, args: ValidationArguments) {
        const object = args.object as any;
        if (object.isApiUser) {
            return true;
        }
        return password != null && password.length > 0;
    }   
    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'El passowrd es requerido a no ser que se trate de un usuario de tipo API'; 
    } 
}

export function IsPasswordRequired(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName:propertyName,
            options:validationOptions,
            constraints: [],
            validator: IsPasswordRequiredConstraint,
        })
    }
}