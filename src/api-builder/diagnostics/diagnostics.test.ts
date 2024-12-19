import { describe, expect, test } from 'vitest';
import { ErrorFactory, Diagnostics, Report } from '.';

describe('Diagnostics', () => {
   test('Report multiple reports', () => {
      const diagnostics = new Diagnostics();

      diagnostics.errors.report(new ErrorFactory('Message 0'));
      diagnostics.errors.report(new ErrorFactory('Message 1'));
      diagnostics.errors.report(new ErrorFactory('Message 2'));

      expect(diagnostics.errors.length).toBe(3);
   });

   test('Diagnostics', () => {
      expect(() => new Diagnostics().throw()).toThrowErrorMatchingInlineSnapshot(
         `[Error: Failed to throw report error on empty DiagnosticsStack instance.]`,
      );
   });
});

describe('Report', () => {
   test('Throw', () => {
      const report = new Report(new ErrorFactory('Message'));

      function normalize(path: string) {
         return path.replaceAll('\\', '/');
      }

      function getAndNormalizeStack(callback: () => void) {
         try {
            throw callback();
         } catch (e) {
            if (!(e instanceof Error) || !e.stack) return e;
            return normalize(e.stack)
               .replaceAll(normalize(process.cwd()), 'cwd')
               .replace(/\(?file:\/\/\/?cwd\/node_modules\/.+/g, '<node_modules>')
               .replace(/\n\s+at\s*(runTest|runSuite|runWithTimeout)? <node_modules>/g, '')
               .replace(/\n\s+at\s*.+ \(?node:internal.+\)?/g, '')
               .replace(/\.ts:\d+:\d+/g, '');
         }
      }

      expect(getAndNormalizeStack(() => report.throw())).toMatchInlineSnapshot(`
        "Error: Message
            at cwd/src/api-builder/diagnostics/diagnostics.test
            at getAndNormalizeStack (cwd/src/api-builder/diagnostics/diagnostics.test)
            at cwd/src/api-builder/diagnostics/diagnostics.test"
      `);
      expect(getAndNormalizeStack(() => report.throw(1))).toMatchInlineSnapshot(`
        "Error: Message
            at getAndNormalizeStack (cwd/src/api-builder/diagnostics/diagnostics.test)
            at cwd/src/api-builder/diagnostics/diagnostics.test"
      `);
      expect(getAndNormalizeStack(() => report.throw(2))).toMatchInlineSnapshot(`
        "Error: Message
            at cwd/src/api-builder/diagnostics/diagnostics.test"
      `);
   });
});
