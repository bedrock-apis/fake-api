import { expect, expectTypeOf, suite, test, vi } from 'vitest';
import { ClassDefinition } from './class-definition';
import { Kernel } from './kernel';
import { ParamsDefinition } from './type-validators';

const EntityDefinition = new ClassDefinition('Entity', null).addMethod('methodA', false, new ParamsDefinition());
const PlayerDefinition = new ClassDefinition('Player', EntityDefinition, true, true).addMethod(
  'methodB',
  false,
  new ParamsDefinition(),
);

const Player = PlayerDefinition.apiClass;
const Entity = EntityDefinition.apiClass;

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
    const entity_handle = EntityDefinition.construct([])[0];

    expect(entity_handle).not.toBeInstanceOf(Player);
    expect(entity_handle).not.toBeInstanceOf(Entity);
    expect(entity_handle).not.toBeInstanceOf(Object);
    expect(() => Player.prototype.methodA.call(entity_handle));
  });

  test('Normal Constructor', () => {
    const Player = PlayerDefinition.apiClass;

    expect(new Player()).toBeInstanceOf(Player);
    expect(new Player()).toBeInstanceOf(Entity);
  });

  test('Methods', () => {
    const player = new PlayerDefinition.apiClass();

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
    const player = new PlayerDefinition.apiClass();

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
});
