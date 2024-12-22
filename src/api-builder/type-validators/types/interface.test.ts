import { expect, suite, test } from 'vitest';
import { MetadataType } from '../../../script-module-metadata';
import { Context } from '../../context';
import { InterfaceBindType } from './interface';
import { validateThrow } from './tests.helper';

suite('InterfaceType', () => {
   function ref(name: string) {
      return { is_bind_type: true, name } as unknown as MetadataType;
   }

   test('Dependency Resolution', () => {
      const context = new Context();
      context.registerType('a', new InterfaceBindType('a').addProperty('b', context.resolveType(ref('b'))));
      context.registerType('b', new InterfaceBindType('b'));
      context.resolveAllDynamicTypes();

      const bType = context.resolveType(ref('b'));
      expect(bType).toBeInstanceOf(InterfaceBindType);
      expect(bType).toMatchInlineSnapshot(`
        InterfaceBindType {
          "name": "b",
          "properties": Map {},
        }
      `);

      expect([...(bType as InterfaceBindType).properties.entries()]).toMatchInlineSnapshot(`[]`);

      const aType = context.resolveType(ref('a'));
      expect(aType).toBeInstanceOf(InterfaceBindType);
      expect(aType).toMatchInlineSnapshot(`
        InterfaceBindType {
          "name": "a",
          "properties": Map {
            "b" => DynamicType {
              "type": InterfaceBindType {
                "name": "b",
                "properties": Map {},
              },
            },
          },
        }
      `);

      expect([...(aType as InterfaceBindType).properties.entries()]).toMatchInlineSnapshot(`
        [
          [
            "b",
            DynamicType {
              "type": InterfaceBindType {
                "name": "b",
                "properties": Map {},
              },
            },
          ],
        ]
      `);
   });

   test('Complex Dependency Resolution', () => {
      const context = new Context();
      context.registerType('b', new InterfaceBindType('b').addProperty('c', context.resolveType(ref('c'))));
      context.registerType('a', new InterfaceBindType('a').addProperty('b', context.resolveType(ref('b'))));
      context.registerType('c', new InterfaceBindType('c').addProperty('a', context.resolveType(ref('a'))));
      context.resolveAllDynamicTypes();

      const aType = context.resolveType(ref('a'));

      expect(aType).toBeInstanceOf(InterfaceBindType);
      expect(aType).toMatchInlineSnapshot(`
        InterfaceBindType {
          "name": "a",
          "properties": Map {
            "b" => InterfaceBindType {
              "name": "b",
              "properties": Map {
                "c" => DynamicType {
                  "type": InterfaceBindType {
                    "name": "c",
                    "properties": Map {
                      "a" => [Circular],
                    },
                  },
                },
              },
            },
          },
        }
      `);

      expect([...(aType as InterfaceBindType).properties.entries()]).toMatchInlineSnapshot(`
        [
          [
            "b",
            InterfaceBindType {
              "name": "b",
              "properties": Map {
                "c" => DynamicType {
                  "type": InterfaceBindType {
                    "name": "c",
                    "properties": Map {
                      "a" => InterfaceBindType {
                        "name": "a",
                        "properties": Map {
                          "b" => [Circular],
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        ]
      `);

      expect(() => validateThrow(aType, {})).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });
});
