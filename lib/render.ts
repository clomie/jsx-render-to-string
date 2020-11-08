import { Fragment, VNode } from './vnode'

export const render = (node: VNode | string): string => {
  if (typeof node === 'string') {
    return escape(node)
  }

  const type = node.type
  const attributes = node.attributes || {}
  const children = node.children.flat()

  const renderChildren = () => children.map((child) => render(child)).join('')

  if (type === Fragment) {
    return renderChildren()
  }
  if (typeof type === 'function') {
    return render(type({ ...attributes, children }))
  }

  const { dangerouslySetInnerHTML: raw, ...attrsWithoutRawHtml } = attributes

  const attrClause = Object.entries(attrsWithoutRawHtml)
    .filter(([attrName, attrValue]) => canRenderAttribute(attrName, attrValue))
    .map(([attrName, attrValue]) => renderAttribute(attrName, attrValue))
    .join('')

  const innerHtml = raw?.__html || renderChildren()

  return `<${type}${attrClause}>${innerHtml}</${type}>`
}

const canRenderAttribute = (name: string, value: unknown): boolean => {
  // https://html.spec.whatwg.org/multipage/syntax.html#syntax-attributes
  return (
    // falsy values
    value !== false &&
    value !== null &&
    value !== undefined &&
    // name with banned characters
    !/[ "'<>=]/.test(name) &&
    // name with control characters
    !/[\u0000-\u001f]/.test(name)
  )
}

const renderAttribute = (name: string, value: unknown): string => {
  if (value === true || value === '') {
    return ' ' + name
  }
  return ` ${name}="${escape(value)}"`
}

const escape = (value: unknown): string => {
  if (typeof value !== 'string') {
    return String(value)
  }

  return value
    .replace('&', '&amp;')
    .replace('<', '&lt;')
    .replace('>', '&gt;')
    .replace('"', '&quot;')
}
