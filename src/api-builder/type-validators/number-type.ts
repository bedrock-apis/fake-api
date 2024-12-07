import { Diagnostics } from '../errors';
import { Kernel } from '../kernel';
import { BaseType } from './base-types';

const IsFinite = Kernel['globalThis::isFinite'];
const Number = Kernel['globalThis::Number'];

export class NumberType extends BaseType {
  public constructor(public readonly range: { min: number; max: number }) {
    super();
  }
  public override validate(diagnostics: Diagnostics, value: unknown) {
    if (typeof value !== 'number') {
      // TODO: Test Minecraft reaction on these scenarios
      return diagnostics.report('NO ERROR SPECIFIED, CHECK TODOs', Kernel['TypeError::constructor']);
    }
    if (!IsFinite(Number(value)))
      // TODO: Test Minecraft reaction on these scenarios
      diagnostics.report('WTF, we have to test how minecraft reacts on Infinity or NaN', Kernel['Error::constructor']);

    if (value < this.range.min || value > this.range.max)
      // TODO: Test Minecraft reaction on these scenarios
      diagnostics.report('WTF, we have to test how minecraft reacts on Infinity or NaN', Kernel['Error::constructor']);

    return diagnostics;
  }
}
export class BigIntType extends NumberType {
  public override validate(diagnostics: Diagnostics, value: unknown) {
    if (typeof value !== 'bigint') {
      // TODO: Test Minecraft reaction on these scenarios
      return diagnostics.report('NO ERROR SPECIFIED, CHECK TODOs', Kernel['TypeError::constructor']);
    }

    if (value < this.range.min || value > this.range.max)
      // TODO: Test Minecraft reaction on these scenarios
      diagnostics.report('WTF, we have to test how minecraft reacts on Infinity or NaN', Kernel['Error::constructor']);

    return diagnostics;
  }
}
