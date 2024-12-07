export * from './params-definition';
export * from './base-types';
export * from './number-type';
export * from './string-type';
export * from './boolean-type';
export * from './function-type';
/*
export class FunctionValidator{
    get min(){return this.metadata.min;}
    get max(){return this.metadata.max;}
    get arguments(){return this.metadata.arguments;}
    get privilege(){return this.metadata.privilege;}
    constructor(metadata){ this.metadata = metadata; }
    ValidArgumentTypes(args){
        if(args.length > this.max || args.length < this.min) return {
            ctor: ErrorConstructors.IncorrectNumberOfArguments,
            message: ErrorMessages.IncorrectNumberOfArguments(this, args.length)
        };
    }
    ResolveReturnType(bruh){}
}
export class Validator{
    static IsValidType(value, typeOf){

    }
}*/
