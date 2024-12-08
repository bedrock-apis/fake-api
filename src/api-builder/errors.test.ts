import { describe, expect, test } from 'vitest';
import { Diagnostics, Report } from './errors';

describe('Diagnostics', () => {
   test('Report multiple reports', () => {
      const diagnostics = new Diagnostics();

      diagnostics.report(new Report('Message 0', Error));
      diagnostics.report(new Report('Message 1', Error), new Report('Message 2', Error));

      expect(diagnostics.errors).toMatchInlineSnapshot(`
        [
          Report {
            "message": "Message 0",
            "type": [Function],
          },
          Report {
            "message": "Message 1",
            "type": [Function],
          },
          Report {
            "message": "Message 2",
            "type": [Function],
          },
        ]
      `);
   });
   test('Report with string', () => {
      const diagnostics = new Diagnostics();

      diagnostics.report('Message', Error);

      expect(diagnostics.errors).toMatchInlineSnapshot(`
        [
          Report {
            "message": "Message",
            "type": [Function],
          },
        ]
      `);
   });

   test('Diagnostics', () => {
      expect(() => new Diagnostics().throw()).toThrowErrorMatchingInlineSnapshot(`[Error: Failed to throw report error on successfull diagnostics instance]`);
   });
});
