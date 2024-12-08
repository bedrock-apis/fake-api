import { Diagnostics, Errors } from '../errors';
import { Type } from './base-types';

export class BooleanType extends Type {
  public override validate(diagnostics: Diagnostics, value: unknown): void {
    if (typeof value !== 'boolean') diagnostics.report(Errors.NativeTypeConversationFailed());
  }
}
