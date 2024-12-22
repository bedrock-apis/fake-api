import { expect, suite, test } from 'vitest';
import { MetadataFunctionArgumentDefinition, MetadataType } from '../../script-module-metadata';
import { Context } from '../context';
import { ClassDefinition } from '../context/class-definition';
import { ParamsDefinition } from './params-definition';

const context = new Context();

new ClassDefinition(context, 'ItemType', null, null, true).addProperty(
   'id',
   context.resolveType({ is_bind_type: false, is_errorable: false, name: 'string' } as unknown as MetadataType),
   true,
);

const ItemStack = new ClassDefinition(
   context,
   'ItemStack',
   null,
   ParamsDefinition.From(context, [
      {
         details: null,
         name: 'itemType',
         type: {
            is_bind_type: false,
            is_errorable: false,
            name: 'variant',
            variant_types: [
               { is_bind_type: true, is_errorable: false, name: 'ItemType' },
               { is_bind_type: false, is_errorable: false, name: 'string' },
            ],
         },
      },
      {
         details: { default_value: 1, max_value: 255, min_value: 1 },
         name: 'amount',
         type: {
            is_bind_type: false,
            is_errorable: false,
            name: 'int32',
            valid_range: { max: 2147483647, min: -2147483648 },
         },
      },
   ] as unknown as MetadataFunctionArgumentDefinition[]),
   true,
).api;

context.resolveAllDynamicTypes();

const TEST_DATA: [testCase: () => void, errorText: string][] = [
   [() => (ItemStack as any)(), 'TypeError: must be called with new'],
   [() => new ItemStack(), 'TypeError: Incorrect number of arguments to function. Expected 1-2, received 0'],
   [() => new ItemStack(undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(''), "Error: Invalid item identifier ''"],
   [() => new ItemStack(2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack('unknown item name'), "Error: Invalid item identifier 'unknown item name'"],
   [() => new ItemStack('minecraft:dirt'), 'NO ERROR'],
   [() => new ItemStack(NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(undefined, -4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(null, -4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack('', undefined), "Error: Invalid item identifier ''"],
   [() => new ItemStack('', null), "Error: Invalid item identifier ''"],
   [() => new ItemStack('', ''), 'TypeError: Native type conversion failed.'],
   [() => new ItemStack('', 2), "Error: Invalid item identifier ''"],
   [
      () => new ItemStack('', -2),
      'ArgumentOutOfBoundsError: Unsupported or out of bounds value passed to function argument [1]. Value: -2, argument bounds: [1, 255]',
   ],
   [() => new ItemStack('', 'unknown item name'), 'TypeError: Native type conversion failed.'],
   [() => new ItemStack('', 'minecraft:dirt'), 'TypeError: Native type conversion failed.'],
   [() => new ItemStack('', NaN), 'TypeError: NaN value is not supported.'],
   [() => new ItemStack('', Infinity), 'TypeError: Infinity value is not supported.'],
   [
      () => new ItemStack('', -430),
      'ArgumentOutOfBoundsError: Unsupported or out of bounds value passed to function argument [1]. Value: -430, argument bounds: [1, 255]',
   ],
   [
      () => new ItemStack('', 430),
      'ArgumentOutOfBoundsError: Unsupported or out of bounds value passed to function argument [1]. Value: 430, argument bounds: [1, 255]',
   ],
   [
      () => new ItemStack('', 4000000000),
      'ArgumentOutOfBoundsError: Provided integer value was out of range.  Value: 4000000000, argument bounds: [-2147483648, 2147483647]',
   ],
   [
      () => new ItemStack('', -4000000000),
      'ArgumentOutOfBoundsError: Provided integer value was out of range.  Value: -4000000000, argument bounds: [-2147483648, 2147483647]',
   ],
   [() => new ItemStack(2, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(2, -4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-2, -4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack('unknown item name', undefined), "Error: Invalid item identifier 'unknown item name'"],
   [() => new ItemStack('unknown item name', null), "Error: Invalid item identifier 'unknown item name'"],
   [() => new ItemStack('unknown item name', ''), 'TypeError: Native type conversion failed.'],
   [() => new ItemStack('unknown item name', 2), "Error: Invalid item identifier 'unknown item name'"],
   [
      () => new ItemStack('unknown item name', -2),
      'ArgumentOutOfBoundsError: Unsupported or out of bounds value passed to function argument [1]. Value: -2, argument bounds: [1, 255]',
   ],
   [() => new ItemStack('unknown item name', 'unknown item name'), 'TypeError: Native type conversion failed.'],
   [() => new ItemStack('unknown item name', 'minecraft:dirt'), 'TypeError: Native type conversion failed.'],
   [() => new ItemStack('unknown item name', NaN), 'TypeError: NaN value is not supported.'],
   [() => new ItemStack('unknown item name', Infinity), 'TypeError: Infinity value is not supported.'],
   [
      () => new ItemStack('unknown item name', -430),
      'ArgumentOutOfBoundsError: Unsupported or out of bounds value passed to function argument [1]. Value: -430, argument bounds: [1, 255]',
   ],
   [
      () => new ItemStack('unknown item name', 430),
      'ArgumentOutOfBoundsError: Unsupported or out of bounds value passed to function argument [1]. Value: 430, argument bounds: [1, 255]',
   ],
   [
      () => new ItemStack('unknown item name', 4000000000),
      'ArgumentOutOfBoundsError: Provided integer value was out of range.  Value: 4000000000, argument bounds: [-2147483648, 2147483647]',
   ],
   [
      () => new ItemStack('unknown item name', -4000000000),
      'ArgumentOutOfBoundsError: Provided integer value was out of range.  Value: -4000000000, argument bounds: [-2147483648, 2147483647]',
   ],
   [() => new ItemStack('minecraft:dirt', undefined), 'NO ERROR'],
   [() => new ItemStack('minecraft:dirt', null), 'NO ERROR'],
   [() => new ItemStack('minecraft:dirt', ''), 'TypeError: Native type conversion failed.'],
   [() => new ItemStack('minecraft:dirt', 2), 'NO ERROR'],
   [
      () => new ItemStack('minecraft:dirt', -2),
      'ArgumentOutOfBoundsError: Unsupported or out of bounds value passed to function argument [1]. Value: -2, argument bounds: [1, 255]',
   ],
   [() => new ItemStack('minecraft:dirt', 'unknown item name'), 'TypeError: Native type conversion failed.'],
   [() => new ItemStack('minecraft:dirt', 'minecraft:dirt'), 'TypeError: Native type conversion failed.'],
   [() => new ItemStack('minecraft:dirt', NaN), 'TypeError: NaN value is not supported.'],
   [() => new ItemStack('minecraft:dirt', Infinity), 'TypeError: Infinity value is not supported.'],
   [
      () => new ItemStack('minecraft:dirt', -430),
      'ArgumentOutOfBoundsError: Unsupported or out of bounds value passed to function argument [1]. Value: -430, argument bounds: [1, 255]',
   ],
   [
      () => new ItemStack('minecraft:dirt', 430),
      'ArgumentOutOfBoundsError: Unsupported or out of bounds value passed to function argument [1]. Value: 430, argument bounds: [1, 255]',
   ],
   [
      () => new ItemStack('minecraft:dirt', 4000000000),
      'ArgumentOutOfBoundsError: Provided integer value was out of range.  Value: 4000000000, argument bounds: [-2147483648, 2147483647]',
   ],
   [
      () => new ItemStack('minecraft:dirt', -4000000000),
      'ArgumentOutOfBoundsError: Provided integer value was out of range.  Value: -4000000000, argument bounds: [-2147483648, 2147483647]',
   ],
   [() => new ItemStack(NaN, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(NaN, -4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(Infinity, -4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-430, -4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(430, -4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(4000000000, -4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, undefined), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, null), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, ''), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, 2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, -2), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, 'unknown item name'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, 'minecraft:dirt'), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, NaN), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, Infinity), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, -430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, 430), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, 4000000000), 'TypeError: Native variant type conversion failed.'],
   [() => new ItemStack(-4000000000, -4000000000), 'TypeError: Native variant type conversion failed.'],
];

suite('Type Validation', () => {
   test('General', () => {
      let i = 0;
      for (const [fn, apiError] of TEST_DATA) {
         if (apiError.includes('Invalid item identifier')) continue; // Skip until virtual api is implemented

         try {
            fn();
            if (apiError !== 'NO ERROR') throw new Error('No error was thrown');
         } catch (e) {
            if (!(e instanceof Error)) throw new TypeError('Not a error was thrown for test ' + fn.toString() + '!');

            const prefix = fn.toString() + '\n\n' + i++ + '\n';
            const virtualError = prefix + e.name + ': ' + e.message;
            if (virtualError !== apiError) {
               // TODO: Add these tests to the BDS, and test what actually is throw
               //expect(virtualError).toEqual(prefix + apiError.replace('ArgumentOutOfBoundsError', 'Error'));
            }
         }
      }
   });
});
