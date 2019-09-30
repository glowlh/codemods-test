module.exports.parser = 'tsx';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const COMPONENT_NAME = 'Drum';

  /**
   * All import declarations for target component import
   */
  const importDeclarations = root
    .find(j.ImportDeclaration,{
      source: {
        type: "StringLiteral",
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
        name: COMPONENT_NAME,
      }
    })
    .forEach(path => {
      const { node } = path;
      localNameSpaces.push(node.local.name);
    });

  /**
   * Finds name for ImportNamespaceSpecifier with Identifier type
   */
  importDeclarations
    .find(j.ImportNamespaceSpecifier)
    .forEach(path => {
      const { node } = path;
      localNameSpaces.push(`${node.local.name}.${COMPONENT_NAME}`);
    });

  console.debug(j.fromPaths);

  // добавить цикл // TODO: нужно пройтись по всем локальным именам и проверить, где используются нужные нам типы атрибутов
  const targetAttributes =
    // localNameSpaces
    //   .reduce((result, nodeObj) => {
    //
    //   }, []);

    root
    .find(j.JSXOpeningElement, {
      name: {
        type: 'JSXIdentifier',
        name: localNameSpaces[0]
      }
    })
    .find(j.JSXAttribute, {
      name: {
        type: 'JSXIdentifier',
        name: 'onChange',
      }
    });

  /**
   * Поиск стрелочных функций внутри атрибута
   */
  targetAttributes
    .find(j.ArrowFunctionExpression)
    .replaceWith(path => {
      return createType(path, j);
    });

  /**
   * Поиск передаваемых методов в проперти
   * @type {Array}
   */
  const handlerNames = [];
  targetAttributes
    .find(j.MemberExpression, {
      object: {
        type: 'ThisExpression',
      }
    })
    .forEach(path => {
      const { node } = path;
      handlerNames.push(node.property.name);
    });
  handlerNames.forEach(name => {
    /**
     * Поиск всех методов класса как свойств класса (стрелочные функции)
     */
    root
      .find(j.ClassProperty, {
        key: {
          name,
          type: 'Identifier',
        }
      })
      .find(j.ArrowFunctionExpression)
      .replaceWith(path => {
        return createType(path, j);
      });

    /**
     * Поиск всех методов класса как функций
     */
    root
      .find(j.ClassMethod, {
        key: {
          name,
          type: 'Identifier',
        }
      })
      .replaceWith(path => {
        return createType(path, j);
      });
  });

  return root.toSource();
}

/**
 * Creates FormEvent type instead of ChangeEvent
 * @param path
 * @param j
 * @returns {*}
 */
function createType(path, j) {
  const {node} = path;
  const params = node.params;
  const argumentTypeAnnotation = params[0].typeAnnotation;

  if (
    argumentTypeAnnotation &&
    argumentTypeAnnotation.typeAnnotation.typeName &&
    argumentTypeAnnotation.typeAnnotation.typeName.left.name === 'React' &&
    argumentTypeAnnotation.typeAnnotation.typeName.right.name === 'FormEvent'
  ) {
    params[0].typeAnnotation.typeAnnotation = j.tsTypeReference(
      j.tsQualifiedName(
        j.identifier('React'),
        j.identifier('ChangeEvent'),
      ),
      argumentTypeAnnotation.typeAnnotation.typeParameters
    );
  }

  return node;
}
