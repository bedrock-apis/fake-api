import { V } from 'vitest/dist/chunks/reporters.D7Jzd9GS';
import { Diagnostics } from '../errors';
import { Kernel } from '../kernel';
import { BaseType } from './base-types';
import { MetadataFunctionArgumentDefinition } from '../../package-builder/ScriptModule';

export class ParamsDefinition {
  public requiredParams: number = 0;
  public params: ArrayLike<ParamType> = Kernel.__setPrototypeOf([], null);
  public addType(type: ParamType): this {
    if (this.params.length === this.requiredParams && !type.isOptional) {
      (this.params as unknown[])[this.params.length] = type;
      this.requiredParams = this.params.length;
    } else if (!type.isOptional) {
      throw new (Kernel.Constructor('TypeError'))('Required parameter can not be set after optional was defined');
    } else (this.params as unknown[])[this.params.length] = type;
    return this;
  }
  public static resolve(metadata: MetadataFunctionArgumentDefinition): ParamsDefinition {
    /**
     * Special logic for handling ranges as the could be different from defined type, check example below 
            {
              "details": {
                "max_value": 1000.0,
                "min_value": 0.0
              },
              "name": "radius",
              "type": {
                "is_bind_type": false,
                "is_errorable": false,
                "name": "float",
                "valid_range": {
                  "max": 2147483647,
                  "min": -2147483648
                }
              }
            },
     */
    return new this();
  }
}
export class ParamType extends BaseType {
  public constructor(
    public readonly isOptional: boolean,
    public readonly type: BaseType,
  ) {
    super();
  }
  public validate(diagnostics: Diagnostics, value: unknown): void {
    //TODO: do something with optional?
    this.type.validate(diagnostics, value);
  }
}
