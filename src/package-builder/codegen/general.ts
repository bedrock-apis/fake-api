import ts, { factory } from 'typescript';
import { NodeConstructor } from './base';

export class ValueLiteral extends NodeConstructor {
   public constructor(value: string | number | boolean | undefined | null) {
      let node: ts.Node;
      switch (typeof value) {
         case 'boolean':
            node = value ? factory.createTrue() : factory.createFalse();
            break;
         case 'number':
            if (value < 0)
               node = factory.createPrefixUnaryExpression(
                  ts.SyntaxKind.MinusToken,
                  factory.createNumericLiteral(-value),
               );
            else node = factory.createNumericLiteral(value);
            break;
         case 'string':
            node = factory.createStringLiteral(value);
            break;
         case 'undefined':
            node = factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
            break;
         default:
            if (value === null) {
               node = factory.createNull();
               break;
            }
            node = value;
            break;
      }
      super(node);
   }
   public static GetValue<T extends number | string | boolean | null | undefined>(v: T | ValueLiteral): ValueLiteral {
      return v instanceof ValueLiteral ? v : new ValueLiteral(v);
   }
}
export const IDENTIFIERS = new WeakMap<object, Identifier>();
export class Identifier extends NodeConstructor {
   public static Unique(constructor: { name: string }) {
      let unique = IDENTIFIERS.get(constructor);
      if (!unique) IDENTIFIERS.set(constructor, (unique = new Identifier(constructor.name)));
      return unique;
   }
   public static Create(name: string) {
      return new Identifier(name);
   }

   // We want to avoid property collisions with typescript's internal properties
   // eslint-disable-next-line @typescript-eslint/naming-convention
   public readonly _text: string;
   protected constructor(name: string) {
      super(factory.createIdentifier(name));
      this._text = name;
   }
}
