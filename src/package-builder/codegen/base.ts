import ts, { factory } from 'typescript';
import type { Identifier } from './general';

class TheNode {
   public constructor(node: ts.Node) {
      return Object.setPrototypeOf(node, new.target.prototype);
   }
   public access(by: Identifier): NodeType {
      return new TheNode(
         factory.createPropertyAccessExpression(this as unknown as ts.Expression, by as unknown as ts.Identifier),
      ) as NodeType;
   }
   public construct(params: ts.Node[] = []): NodeType {
      return new TheNode(
         factory.createNewExpression(this as unknown as ts.Expression, undefined, params as ts.Expression[]),
      ) as NodeType;
   }
   public invoke(params: ts.Node[] = []): NodeType {
      return new TheNode(
         factory.createCallExpression(this as unknown as ts.Expression, undefined, params as ts.Expression[]),
      ) as NodeType;
   }
   public methodCall(method: Identifier, params: ts.Node[] = []): NodeType {
      return this.access(method).invoke(params);
   }
}
export type NodeType = ts.Node & TheNode;
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NodeConstructor: { new (node: ts.Node): NodeType; readonly prototype: NodeType } = TheNode as unknown as {
   new (node: ts.Node): NodeType;
   readonly prototype: NodeType;
};
export type TsNode = ts.Node;
