import type { MetadataType } from '../../package-builder/ScriptModule';
import { Report, Diagnostics } from '../errors';
import { Kernel } from '../kernel';
import { BigIntType, NumberType } from './number-type';
import { BooleanType } from './boolean-type';
import { StringType } from './string-type';
import { FunctionType } from './function-type';

export abstract class BaseType {
  public static readonly BIND_TYPE_TYPES = Kernel.Construct('Map') as Map<string, BaseType>;
  public static registerBindType(name: string, type: BaseType) {
    this.BIND_TYPE_TYPES.set(name, type);
  }
  public static resolve(metadataType: MetadataType) {
    const { name } = metadataType;

    if (metadataType.is_bind_type) {
      const bindType = this.BIND_TYPE_TYPES.get(name);
      if (!bindType) throw Kernel['ReferenceError::constructor']('Unknown bind type: ' + name);
      return bindType;
    }

    switch (name) {
      case 'uint8':
      case 'int8':
      case 'uint16':
      case 'int16':
      case 'uint32':
      case 'int32':
      case 'float':
      case 'double':
        return new NumberType(metadataType.valid_range);
      case 'uint64':
      case 'int64':
        return new BigIntType(metadataType.valid_range);
      case 'boolean':
        return new BooleanType();
      case 'string':
        return new StringType();
      case 'closure':
        return new FunctionType();
      case 'undefined':
        return new VoidType();
      default:
        // TODO: Metadata type
        throw new Kernel['ReferenceError::constructor'](`BaseType::resolve - UnknownType: ${name}`);
    }
  }
  // Diagnostics are always passed by someone who requested this type check
  public abstract validate(diagnostics: Diagnostics, value: unknown): void;
}

export class VoidType extends BaseType {
  public override validate(diagnostics: Diagnostics, value: unknown) {
    if (value !== undefined) diagnostics.report(new Report('Type Report', Kernel['TypeError::constructor']));
    throw diagnostics;
  }
  public constructor() {
    super();
  }
}
