import { ChildUpdater, VDomNodeUpdater } from "./diff";
import { renderElement } from "./renderElement";

export const applyUpdate = (
  elem: HTMLElement | Text,
  diff: VDomNodeUpdater
): HTMLElement | Text => {
  if (diff.kind == "skip") return elem;

  if (diff.kind == "replace") {
    const newElem = renderElement(diff.newNode);
    elem.replaceWith(newElem);
    if (diff.callback) diff.callback(newElem);
    return newElem;
  }

  if ("wholeText" in elem) throw new Error("invalid update for Text node");

  for (const att in diff.attributes.remove) {
    elem.removeAttribute(att);
  }

  for (const att in diff.attributes.set) {
    (elem as any)[att] = diff.attributes.set[att];
  }

  applyChildrenDiff(elem, diff.children);

  return elem;
};

const applyChildrenDiff = (elem: HTMLElement, operations: ChildUpdater[]) => {
  let offset = 0;
  for (let i = 0; i < operations.length; i++) {
    const childUpdater = operations[i];

    if (childUpdater.kind == "skip") continue;

    if (childUpdater.kind == "insert") {
      if (elem.childNodes[i + offset - 1])
        elem.childNodes[i + offset - 1].after(renderElement(childUpdater.node));
      else elem.appendChild(renderElement(childUpdater.node));
      continue;
    }

    const childElem = elem.childNodes[i + offset];

    if (childUpdater.kind == "remove") {
      childElem.remove();
      offset -= 1;
      continue;
    }

    applyUpdate(childElem as HTMLElement, childUpdater);
  }
};
