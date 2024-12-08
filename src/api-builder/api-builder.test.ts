import { expect, expectTypeOf, suite, test, vi } from 'vitest';
import { ClassDefinition } from './class-definition';
import { Kernel } from './kernel';
import { ParamsDefinition } from './type-validators';
import { ConstructionExecutionContext } from './execution-context';
import { Diagnostics } from './errors';

const EntityDefinition = new ClassDefinition('Entity', null).addMethod('methodA', new ParamsDefinition());
const PlayerDefinition = new ClassDefinition('Player', EntityDefinition, true, true).addMethod(
   'methodB',
   new ParamsDefinition(),
);

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
         new ConstructionExecutionContext(
            EntityDefinition,
            EntityDefinition.classId,
            Kernel.Construct('Array'),
            new Diagnostics(),
         ),
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
      expect(player.methodA.bind(player));
   });

   test('Error stack traces', () => {
      const player = new PlayerDefinition.api();

      try {
         player.methodA.call(undefined);
      } catch (e) {
         expect(e).toBeInstanceOf(Kernel.Constructor('ReferenceError'));
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
