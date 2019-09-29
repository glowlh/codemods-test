export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  /**
   * All import declarations for target component import
   */
  const importDeclarations = root
    .find(j.ImportDeclaration,{
      source: {
        type: "StringLiteral", //TODO: why in the AST explorer this named by Literal
        value: "../drum",
      }
    });

  const localNameSpaces = [];
  /**
   * Finds name for ImportSpecifier with Identifier type
   */
  importDeclarations
    .find(j.ImportSpecifier, {
      imported: {
        type: 'Identifier',
        name: 'Drum',
      }
    })
    .forEach(path => {
      const node = path.node;
      localNameSpaces.push(node.local.name);
    });

  /**
   * Finds name for ImportNamespaceSpecifier with Identifier type
   */
  importDeclarations
    .find(j.ImportNamespaceSpecifier)
    .forEach(path => {
      const { node } = path;
      localNameSpaces.push(`${node.local.name}.Drum`);
    });



  // добавить цикл
  const targetAttributes = root
    .find(j.JSXOpeningElement, {
      name: {
        type: 'JSXIdentifier',
        name: localNameSpaces[0]
      }
    })
    .find(j.JSXAttribute, {
      name: {
        type: 'JSXIdentifier',
        name: 'onFetchLoad',
      }
    })

  targetAttributes
    .find(j.ArrowFunctionExpression)
    .replaceWith(path => {
      const {node} = path;
      const params = node.params;

      if (
        params[0].typeAnnotation.typeAnnotation.typeName.left.name === 'React' &&
        params[0].typeAnnotation.typeAnnotation.typeName.right.name === 'FormEvent'
      ) {
        params[0].typeAnnotation.typeAnnotation = j.tsTypeReference(
          j.tsQualifiedName(
            j.identifier('React'),
            j.identifier('ChangeEvent'),
          ),
          j.tsTypeParameterInstantiation([
            j.tsTypeReference(
              j.identifier('HTMLInputElement'),
            )
          ])
        );
      }

      return node;
    });

  return root.toSource();
}
