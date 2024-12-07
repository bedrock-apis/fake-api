import { expect, expectTypeOf, suite, test } from 'vitest';
import { Kernel } from './kernel';

suite('Kernel', () => {
  test('Construct', () => {
    expectTypeOf(Kernel.Construct('Number')).toEqualTypeOf<Number>();
  });
  test('Prototype Isolation', () => {
    const map1 = new (Kernel.Constructor('Map'))();
    const map2 = Kernel.Construct('Map');
    const map3 = new Kernel['globalThis::Map']();

    expect(delete (Kernel['Map::constructor']['prototype'] as any)['set']).toBe(true); // Prototype modification emulation

    try {
      expect(() => map1.set('Test', 'Test1')).toThrow();
      expect(() => map2.set('Test', 'Test2'));
      expect(() => map3.set('Test', 'Test3')).toThrow();
    } finally {
      Kernel['Map::constructor']['prototype']['set'] = Kernel['Map::prototype']['set'];
    }

    expect(map2).not.toBeInstanceOf(Map);
  });
});
