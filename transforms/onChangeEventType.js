module.exports.parser = 'tsx';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const COMPONENTS = [
    'Input',
    'InputMask',
    'Select',
    'Textarea',
    'Autocomplete',
    'Checkbox',
  ];
  const COMPONENT_NAME = 'Input';
  const SOURCE_PACKAGE_NAME = '@fcc/rbo-ui';

  /**
   * Finds import declarations for target component import
   */
  const importDeclarations = root
    .find(j.ImportDeclaration,{
      source: {
        type: "StringLiteral",
        value: SOURCE_PACKAGE_NAME,
      }
    });

  const localNameSpaces = [];
  /**
   * Finds name for ImportSpecifier
   * like import { Input } from '@fcc/rbo-ui'
   * or import { Input as newInput } from '@fcc/rbo-ui'
   */
  COMPONENTS.forEach(component => {
    importDeclarations
      .find(j.ImportSpecifier, {
        imported: {
          type: 'Identifier',
          name: component,
        }
      })
      .forEach(path => {
        const { node } = path;
        localNameSpaces.push(node.local.name);
      });
  });

  /**
   * Finds name for ImportNamespaceSpecifier
   * like import * as Components from '@fcc/rbo-ui'
   */
  importDeclarations
    .find(j.ImportNamespaceSpecifier)
    .forEach(path => {
      const { node } = path;
      localNameSpaces.push(`${node.local.name}.${COMPONENT_NAME}`);
    });

  let targetAttributesArray = [];
  /**
   * Makes array of target collections with JSXAttribute elements
   */
  localNameSpaces.forEach(item => {
    const collection = root
      .find(j.JSXOpeningElement, {
        name: {
          type: 'JSXIdentifier',
          name: item,
        }
      })
      .find(j.JSXAttribute, {
        name: {
          type: 'JSXIdentifier',
          name: 'onChange',
        }
      });
    targetAttributesArray = targetAttributesArray.concat(collection);
  });

  targetAttributesArray.forEach(targetAttributes => {
    replaceInInlineArrowFunctions(targetAttributes, j);
    replaceInMemberExpression(targetAttributes, j, root);
    replaceInVariableDeclarator(targetAttributes, j, root);
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
  const { node } = path;
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

/**
 * Replaces event object type in ArrowFunctions such as inline property
 * @param {Collection} targetAttributes
 * @param {object} j
 */
function replaceInInlineArrowFunctions(targetAttributes, j) {
  targetAttributes
    .find(j.ArrowFunctionExpression)
    .replaceWith(path => {
      return createType(path, j);
    });
}

/**
 * Replaces event object type in MemberExpressions such as ClassProperty or ClassMethod
 * @param {Collection} targetAttributes
 * @param j
 * @param {Collection} root
 */
function replaceInMemberExpression(targetAttributes, j, root) {
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
     * Replaces types for method argument such as ClassProperty
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
     * Replaces types for method argument such as ClassMethod
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
}

function replaceInVariableDeclarator(targetAttributes, j, root) {
  const handlerNames = [];
  targetAttributes
    .find(j.JSXExpressionContainer)
    .forEach(path => {
      const { node } = path;
      handlerNames.push(node.expression.name);
    });

  handlerNames.forEach(name => {
    /**
     * Replaces types for method argument such as VariableDeclarator
     */
    root
      .find(j.VariableDeclarator, {
        id: {
          name,
          type: 'Identifier',
        }
      })
      .find(j.ArrowFunctionExpression)
      .replaceWith(path => {
        return createType(path, j);
      });

    /**
     * Replaces types for method argument such as ClassMethod
     */
    root
      .find(j.FunctionDeclaration, {
        id: {
          name,
          type: 'Identifier',
        }
      })
      .replaceWith(path => {
        return createType(path, j);
      });
  });
}
