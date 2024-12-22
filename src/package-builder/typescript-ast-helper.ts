import ts, { factory } from 'typescript';

export const TYPESCRIPT_AST_HELPER = {
   accessBy(origin: ts.Expression, by: string | ts.Identifier) {
      return factory.createPropertyAccessExpression(origin, by);
   },
   importAsFrom(identity: ts.Identifier, src: string) {
      return factory.createImportDeclaration(
         undefined,
         factory.createImportClause(false, undefined, factory.createNamespaceImport(identity)),
         factory.createStringLiteral(src),
         undefined,
      );
   },
   importStarFrom(path: string, identifies: ts.Identifier[]) {
      return factory.createImportDeclaration(
         undefined,
         factory.createImportClause(
            false,
            undefined,
            factory.createNamedImports(identifies.map(e => factory.createImportSpecifier(false, undefined, e))),
         ),
         this.asIs(path),
         undefined,
      );
   },
   exportConst(identifierName: string, value: ts.Expression) {
      return factory.createVariableStatement(
         [factory.createToken(ts.SyntaxKind.ExportKeyword)],
         factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(factory.createIdentifier(identifierName), undefined, undefined, value)],
            ts.NodeFlags.Const,
         ),
      );
   },
   createNewCall(target: ts.Expression, params: ts.Expression[]) {
      return factory.createNewExpression(target, undefined, params);
   },
   call(nodeToBeCalled: ts.Expression, params: ts.Expression[]) {
      return factory.createCallExpression(nodeToBeCalled, undefined, params);
   },
   methodCall(nodeToBeCalled: ts.Expression, methodName: string, params: ts.Expression[]) {
      return factory.createCallExpression(
         this.accessBy(nodeToBeCalled, factory.createIdentifier(methodName)),
         undefined,
         params,
      );
   },
   i(name: TemplateStringsArray, ...params: unknown[]) {
      return factory.createIdentifier(name.map((e, i) => e + (params[i] ?? '')).join(''));
   },
   asIs(data: unknown): ts.Expression {
      switch (typeof data) {
         case 'boolean':
            return data ? factory.createTrue() : factory.createFalse();
         case 'number':
            if (data < 0)
               return factory.createPrefixUnaryExpression(
                  ts.SyntaxKind.MinusToken,
                  factory.createNumericLiteral(-data),
               );
            return factory.createNumericLiteral(data);

         case 'string':
            return factory.createStringLiteral(data);
         case 'object':
            return data ? objectToExpression(data) : factory.createNull();
         case 'undefined':
            return this.i`undefined`;
         case 'bigint':
            return factory.createBigIntLiteral(data + 'n');
         default:
            throw new TypeError(`Unknown type: ${data}`);
      }
   },

   null: factory.createNull(),

   /**
    * Emits compiled enum
    * ```
    * var Example = function(Example$1) {
    *	Example$1["a"] = "b";
    *	Example$1["c"] = "e";
    *	return Example$1;
    * }(Example || {});
    * ```
    *
    * @param name
    * @param values
    * @returns
    */
   createEnum(name: string, values: [name: string, value: ts.Expression][]) {
      return factory.createVariableStatement(
         [factory.createToken(ts.SyntaxKind.ExportKeyword)],
         factory.createVariableDeclarationList(
            [
               factory.createVariableDeclaration(
                  factory.createIdentifier(name),
                  undefined,
                  undefined,
                  factory.createObjectLiteralExpression(
                     values.map(e => factory.createPropertyAssignment(factory.createStringLiteral(e[0]), e[1])),
                     true,
                  ),
                  /*
            factory.createCallExpression(
              factory.createFunctionExpression(
                undefined,
                undefined,
                undefined,
                undefined,
                [
                  factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    factory.createIdentifier(name + '$1'),
                    undefined,
                    undefined,
                    undefined,
                  ),
                ],
                undefined,
                factory.createBlock(
                  [
                    ...values.map(([name, value]) =>
                      factory.createExpressionStatement(
                        factory.createBinaryExpression(
                          factory.createElementAccessExpression(
                            factory.createIdentifier(name + '$1'),
                            factory.createStringLiteral(name),
                          ),
                          factory.createToken(ts.SyntaxKind.EqualsToken),
                          value,
                        ),
                      ),
                    ),
                    factory.createReturnStatement(factory.createIdentifier(name + '$1')),
                  ],
                  true,
                ),
              ),
              undefined,
              [
                factory.createBinaryExpression(
                  factory.createIdentifier('Example'),
                  factory.createToken(ts.SyntaxKind.BarBarToken),
                  factory.createObjectLiteralExpression([], false),
                ),
              ],
            ),*/
               ),
            ],
            ts.NodeFlags.Const,
         ),
      );
   },
};

function objectToExpression(object: object) {
   if (Array.isArray(object)) {
      return factory.createArrayLiteralExpression(
         object.map(e => TYPESCRIPT_AST_HELPER.asIs(e)),
         false,
      );
   }
   return factory.createObjectLiteralExpression(
      Object.entries(object).map(([key, value]) =>
         factory.createPropertyAssignment(factory.createIdentifier(key), TYPESCRIPT_AST_HELPER.asIs(value)),
      ),
      false,
   );
}
