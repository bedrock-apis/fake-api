import { expect, suite, test } from 'vitest';
import { resolveDependencies } from './dependency-resolver';

suite('Dependency Resolver', () => {
   test('Resolve simple dependencies', () => {
      expect(
         resolveDependencies([
            { id: 'a', dependencies: ['b', 'c'], value: 'a' },
            { id: 'b', dependencies: [], value: 'b' },
            { id: 'c', dependencies: [], value: 'c' },
         ]),
      ).toMatchInlineSnapshot(`
        [
          "b",
          "c",
          "a",
        ]
      `);
   });

   test('Resolve nested dependencies', () => {
      expect(
         resolveDependencies([
            { id: 'a', dependencies: ['b', 'c'], value: 'a' },
            { id: 'b', dependencies: [], value: 'b' },
            { id: 'c', dependencies: ['b'], value: 'c' },
            { id: 'd', dependencies: ['a'], value: 'd' },
         ]),
      ).toMatchInlineSnapshot(`
        [
          "b",
          "c",
          "a",
          "d",
        ]
      `);
   });

   test('Throw error on simple cyclic dependencies', () => {
      expect(() =>
         resolveDependencies([
            { id: 'a', dependencies: ['b'], value: 'a' },
            { id: 'b', dependencies: ['a'], value: 'b' },
         ]),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Circular dependency detected! a -> b -> a]`);
   });

   test('Throw error on complex cyclic dependencies', () => {
      expect(() =>
         resolveDependencies([
            { id: 'a', dependencies: ['b', 'c'], value: 'a' },
            { id: 'b', dependencies: ['d'], value: 'b' },
            { id: 'c', dependencies: ['b', 'd'], value: 'c' },
            { id: 'd', dependencies: ['a'], value: 'd' },
         ]),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Circular dependency detected! a -> b -> d -> a]`);
   });
});

