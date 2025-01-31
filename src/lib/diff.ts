import { VDOMAttributes, VDomNode } from "./types";

type AttributesUpdater = {
  set: VDOMAttributes;
  remove: string[];
};

interface InsertOperation {
  kind: "insert";
  node: VDomNode;
}

interface UpdateOperation {
  kind: "update";
  attributes: AttributesUpdater;
  children: ChildUpdater[];
}

interface ReplaceOperation {
  kind: "replace";
  newNode: VDomNode;
  callback?: (elem: HTMLElement | Text) => void;
}

interface RemoveOperation {
  kind: "remove";
}

interface SkipOperation {
  kind: "skip";
}

export type VDomNodeUpdater =
  | UpdateOperation
  | ReplaceOperation
  | SkipOperation;

export type ChildUpdater =
  | UpdateOperation
  | ReplaceOperation
  | RemoveOperation
  | SkipOperation
  | InsertOperation;

const skip = (): SkipOperation => ({ kind: "skip" });

const replace = (newNode: VDomNode): ReplaceOperation => ({
  kind: "replace",
  newNode,
});

const update = (
  attributes: AttributesUpdater,
  children: ChildUpdater[]
): UpdateOperation => ({
  kind: "update",
  attributes,
  children,
});

const remove = (): RemoveOperation => ({ kind: "remove" });

const insert = (node: VDomNode): InsertOperation => ({ kind: "insert", node });

//TODO: check keys

export const createDiff = (
  oldNode: VDomNode,
  newNode: VDomNode
): VDomNodeUpdater => {
  // skip over text nodes with the same text
  if (
    typeof oldNode != "object" &&
    typeof newNode != "object" &&
    oldNode == newNode
  ) {
    return skip();
  }

  if (typeof oldNode != "object" || typeof newNode != "object") {
    return replace(newNode);
  }

  if (oldNode.kind == "component" && newNode.kind == "component") {
    if (oldNode.type != newNode.type) {
      return replace(newNode);
    }

    const oldTree = oldNode.tree;
    const newTree = newNode.tree;
    return createDiff(oldTree, newTree);
  }

  if (oldNode.kind == "component" || newNode.kind == "component") {
    return replace(newNode);
  }

  if (oldNode.type != newNode.type) {
    return replace(newNode);
  }

  const attUpdater: AttributesUpdater = {
    remove: Object.keys(oldNode.props).filter(
      (att) => Object.keys(newNode.props).indexOf(att) == -1
    ),
    set: Object.keys(newNode.props || {})
      // @ts-ignore
      .filter((att) => oldNode.props[att] != newNode.props[att])
      // @ts-ignore
      .reduce((upd, att) => ({ ...upd, [att]: newNode.props[att] }), {}),
  };

  oldNode.children ??= [];
  newNode.children ??= [];

  const childsUpdater: ChildUpdater[] = newNode.children.map(
    (newChild, newChildIndex) => {
      if (oldNode.children?.[newChildIndex] == undefined) {
        return insert(newChild);
      }
      return createDiff(oldNode.children[newChildIndex], newChild);
    }
  );

  if (oldNode.children.length > newNode.children.length) {
    const removedChildren = oldNode.children.slice(newNode.children.length);
    removedChildren.forEach(() => {
      childsUpdater.push(remove());
    });
  }

  //const childsUpdater: ChildUpdater[] = childsDiff((oldNode.children || []), (newNode.children || []))

  return update(attUpdater, childsUpdater);
};
