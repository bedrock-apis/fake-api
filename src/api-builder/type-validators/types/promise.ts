import { isPromise } from 'node:util/types';
import { API_ERRORS_MESSAGES, DiagnosticsStackReport } from '../../diagnostics';
import { Type } from '../type';

export class PromiseType extends Type {
   public validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      if (!isPromise(value)) diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('type'));
      return diagnostics;
   }
}
