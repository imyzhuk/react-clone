import { VDomNode } from "./types";

export const renderElement = (rootNode: VDomNode): HTMLElement | Text => {
  if (typeof rootNode == "string") {
    return document.createTextNode(rootNode);
  }

  if (typeof rootNode == "number") {
    return document.createTextNode(rootNode.toString());
  }

  if (rootNode.kind == "component") {
    const elem = renderElement(rootNode.tree);
    rootNode.node = elem;
    return elem;
  }

  const elem = document.createElement(rootNode.type);
  const { children, props } = rootNode;

  for (const att in props || {}) {
    // @ts-ignore
    elem[att] = props[att];
  }

  (children || []).forEach((child) => elem.appendChild(renderElement(child)));

  return elem;
};
