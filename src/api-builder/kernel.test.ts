import { expect, expectTypeOf, it, suite, test } from 'vitest';
import { Kernel } from './kernel';
import { time } from 'console';

suite('Kernel', () => {
   test('Construct', () => {
      expectTypeOf(Kernel.Construct('Number')).toEqualTypeOf<Number>();
   });

   test('Prototype Isolation', () => {
      const normalMap = new Kernel['Map::constructor']();
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
      expect(Kernel['Array::static'].isArray([])).toBe(true);
   });

   test('Native Functions', () => {
      expect(Kernel['Map::constructor'].toString()).toMatchInlineSnapshot(`"function Map() { [native code] }"`);
      expect(Map.toString()).toMatchInlineSnapshot(`"function Map() { [native code] }"`);

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

   test('For of isolation', () => {
      const iterator = Array.prototype[Symbol.iterator];

      // @ts-ignore
      delete Array.prototype[Symbol.iterator];
      expect(() => {
         let _ = [...[5]];
      }).toThrow();
      Array.prototype[Symbol.iterator] = iterator;

      expect(() => {
         try {
            // @ts-ignore
            delete Array.prototype[Symbol.iterator];
            let _ = [...Kernel.ArrayIterator([5])];
         } finally {
            Array.prototype[Symbol.iterator] = iterator;
         }
      }).not.toThrow();
   });
   test('For of isolation 2', () => {
      const iteratorPrototype = Object.getPrototypeOf(Array.prototype[Symbol.iterator].call([]));
      const next = iteratorPrototype.next;
      // @ts-ignore
      console.log(delete iteratorPrototype.next);
      expect(() => [...[5]]).toThrow();
      iteratorPrototype.next = next;

      expect(() => {
         try {
            delete iteratorPrototype.next;
            [...Kernel.ArrayIterator([5])];
         } finally {
            iteratorPrototype.next = next;
         }
      }).not.toThrow();
   });
});
