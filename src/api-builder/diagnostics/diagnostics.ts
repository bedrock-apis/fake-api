import { Mutable } from '../../helper-types';
import { Kernel } from '../kernel';
import { ErrorFactory } from './factory';
import { PANIC_ERROR_MESSAGES } from './messages';
import { ContextPanicError } from './panic';
import { BaseReport, Report } from './reports';

export class DiagnosticsStackReport extends BaseReport {
   public get isThrowable() {
      return !this.isEmpty;
   }
   public readonly stack = Kernel.NewArray<Report>();
   public get length() {
      return this.stack.length;
   }
   public report(...params: [report: Report] | [report: ErrorFactory, child?: BaseReport]): this {
      const report = params[0];
      if (report instanceof Report) this.stack.push(report);
      else this.stack.push(new Report(report, params[1] ?? null));
      return this;
   }
   public override throw(trimStackCount: number = 0): Error {
      return (
         this.stack[0]?.throw(trimStackCount + 1) ??
         new ContextPanicError(PANIC_ERROR_MESSAGES.EmptyDiagnosticsStackInstance)
      );
   }
   public clear() {
      (this as Mutable<this>).stack = Kernel.NewArray<Report>();
   }
   public get isEmpty() {
      return this.length === 0;
   }
   public follow(diagnostics: DiagnosticsStackReport) {
      this.stack.push(...Kernel.ArrayIterator(diagnostics.stack));
      return this;
   }
}
export class Diagnostics extends Kernel.Empty {
   public get success() {
      return this.errors.length === 0;
   }
   public get isEmpty() {
      return this.errors.isEmpty && this.warns.isEmpty;
   }
   public readonly errors = new DiagnosticsStackReport();
   public readonly warns = new DiagnosticsStackReport();
   public throw(trimStackCount: number = 0): Error {
      throw this.errors.throw(trimStackCount + 1);
   }
}
