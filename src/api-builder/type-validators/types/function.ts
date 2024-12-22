import { isGeneratorObject } from 'node:util/types';
import { API_ERRORS_MESSAGES, DiagnosticsStackReport } from '../../diagnostics';
import { Type } from '../type';

export class FunctionType extends Type {
   public override validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      // TODO: No error message
      if (typeof value !== 'function')
         // TODO: Is it really native type conversion error?
         diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('type'));
      return diagnostics;
   }
}

export class GeneratorType extends Type {
   public validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      if (!isGeneratorObject(value)) diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('type'));
      return diagnostics;
   }
}
