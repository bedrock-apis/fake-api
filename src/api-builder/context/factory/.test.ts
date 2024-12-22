import { expect, expectTypeOf, suite, test, vi } from 'vitest';
import { Context } from '..';
import { Kernel } from '../../kernel';
import { BooleanType, ParamsDefinition } from '../../type-validators';
import { ConstructionExecutionContext } from '../execution-context';

const context = new Context();
const EntityDefinition = context.createClassDefinition('Entity', null).addMethod('methodA');
const PlayerDefinition = context
   .createClassDefinition('Player', EntityDefinition, new ParamsDefinition(), true, true)
   .addMethod('methodB')
   .addProperty('test', new BooleanType(), false);

const Player = PlayerDefinition.api;
const Entity = EntityDefinition.api;

suite('Base API', () => {
   test('Construction', () => {
      const mock = vi.fn();
      EntityDefinition.onConstruct.subscribe(mock);

      const player = new Player();

      expect(player).toBeInstanceOf(Player);
      expect(player).toBeInstanceOf(Entity);
      expect(EntityDefinition.isThisType(player)).toBeTruthy();
      expect(mock).toHaveBeenCalledOnce();
   });

   test('Native Construction', () => {
      const entity_handle = EntityDefinition.__construct(
         new ConstructionExecutionContext(null, EntityDefinition, EntityDefinition.classId, Kernel.Construct('Array')),
      );

      expect(entity_handle).not.toBeInstanceOf(Player);
      expect(entity_handle).not.toBeInstanceOf(Entity);
      expect(entity_handle).not.toBeInstanceOf(Object);
      expect(() => Player.prototype.methodA.call(entity_handle));
   });

   test('Normal Constructor', () => {
      const Player = PlayerDefinition.api;

      expect(new Player()).toBeInstanceOf(Player);
      expect(new Player()).toBeInstanceOf(Entity);
   });

   test('Methods', () => {
      const player = new PlayerDefinition.api();

      // TS Check
      expectTypeOf(player.methodA).toBeFunction;
      expectTypeOf(player.methodB).toBeFunction;
      // JS Check
      expect(player.methodA).toBeTypeOf('function');
      expect(player.methodB).toBeTypeOf('function');

      expect(player.methodA).toThrowErrorMatchingInlineSnapshot(
         `[ReferenceError: Native function [Entity::methodA] object bound to prototype does not exist.]`, //👌
      );
      expect(player.methodA.bind(player)).not.toThrow();
      expect(() => player.methodA()).not.toThrow();
   });

   test('Property', () => {
      const player = new PlayerDefinition.api();

      const { get, set } = Object.getOwnPropertyDescriptor(PlayerDefinition.api.prototype, 'test') ?? {};
      expect(set).toThrowError();
      expect(get).not.toThrow();
      expect(() => (set as any)?.call(player)).toThrow();
      expect(() => set?.call(player, 5)).toThrow();
      expect(() => set?.call(player, false)).not.toThrow();
      expect(get?.call({})).toBeTypeOf('undefined');

      expect(() => (player.test = 5)).toThrow();
      // TODO Fix test expected undefined not to be type of 'undefined'
      // expect(get?.call(player)).not.toBeTypeOf('undefined');
   });

   test('Error stack traces', () => {
      const player = new PlayerDefinition.api();

      try {
         player.methodA.call(undefined);
      } catch (e) {
         expect(e).toBeInstanceOf(Kernel['ReferenceError::constructor']);
         expect(e).toBeInstanceOf(ReferenceError);
         expect(e).toMatchInlineSnapshot(
            `[ReferenceError: Native function [Entity::methodA] object bound to prototype does not exist.]`,
         );
      }
   });

   test('Invalid params', () => {
      const player = new PlayerDefinition.api();

      expect(() => player.methodA(undefined)).toThrowError();
   });
});
