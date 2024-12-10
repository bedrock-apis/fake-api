import { expect, expectTypeOf, suite, test } from 'vitest';
import { Kernel } from './kernel';

suite('Kernel', () => {
   test('Construct', () => {
      expectTypeOf(Kernel.Construct('Number')).toEqualTypeOf<Number>();
   });

   test('Prototype Isolation', () => {
      const normalMap = new (Kernel.Constructor('Map'))();
      const kernelMap = new Kernel['globalThis::Map']();
      const kernelConstructedMap = Kernel.Construct('Map');

      expect(kernelConstructedMap).not.toBeInstanceOf(Map);
      expect(delete (Kernel['Map::constructor']['prototype'] as any)['set']).toBe(true); // Prototype modification emulation

      try {
         expect(() => normalMap.set('Test', 'Test1')).toThrow();
         expect(() => kernelMap.set('Test', 'Test3')).toThrow();
         expect(() => kernelConstructedMap.set('Test', 'Test2')).not.toThrow();
      } finally {
         Kernel['Map::constructor']['prototype']['set'] = Kernel['Map::prototype']['set'];
      }
   });

   test('Array Prototype Isolation', () => {
      const normalArray = [];
      const kernelArray = Kernel.Construct('Array') as number[];

      expect(delete (Kernel['Array::constructor']['prototype'] as any)['push']).toBe(true); // Prototype modification emulation

      try {
         expect(() => normalArray.push(1)).toThrow();
         expect(() => kernelArray.push(1)).not.toThrow();
      } finally {
         Kernel['Array::constructor']['prototype']['push'] = Kernel['Array::prototype']['push'];
      }
   });

   test('Array', () => {
      expect(Array.isArray([])).toBe(true);
      expect(Kernel.Constructor('Array').isArray([])).toBe(true);
   });

   test('Native Functions', () => {
      expect(Kernel.Constructor('Map').toString()).toMatchInlineSnapshot(`"function Map() { [native code] }"`);
      expect(Map.toString()).toMatchInlineSnapshot(`"function Map() { [native code] }"`);

      expect(Kernel.IsFakeNative(Kernel.Constructor('Map'))).toBe(false);
      expect(Kernel.IsFakeNative(Kernel['Map::constructor'])).toBe(false);
      expect(Kernel.IsFakeNative(Map)).toBe(false);
      // @ts-expect-error
      expect(Kernel.IsFakeNative('not a function')).toBe(false);

      expect(Kernel.IsFakeNative(Function.prototype.toString)).toBe(true);

      class Testing {
         method(a: unknown) {
            // Do nothing
         }
      }

      expect(Testing.toString()).toMatchInlineSnapshot(`
      "class Testing {
            method(a) {
            }
          }"
    `);

      Kernel.SetFakeNative(Testing);
      expect(Testing.toString()).toMatchInlineSnapshot(`
      "function Testing() {
          [native code]
      }"
    `);
   });

   test('Prototype', () => {
      expect(Kernel.Prototype('Map') === Kernel['Map::prototype']).toBeTruthy();
   });

   test('Static', () => {
      expect(Kernel.Static('Object') === Kernel['Object::static']).toBeTruthy();
   });
});
