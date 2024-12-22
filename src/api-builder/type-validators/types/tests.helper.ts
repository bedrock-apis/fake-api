import { Type } from '../type';
import { DiagnosticsStackReport } from '../../diagnostics';

export function validateThrow(type: Type, value: unknown, trimStack: number = 1) {
   const diagnostics = new DiagnosticsStackReport();
   type.validate(diagnostics, value);
   if (!diagnostics.isEmpty) throw diagnostics.throw();
}
