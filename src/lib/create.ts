import { applyUpdate } from "./applyUpdate";
import { createDiff } from "./diff";
import { renderElement } from "./renderElement";
import {
  Component,
  THook,
  VDOMAttributes,
  VDOMComponent,
  VDOMElement,
  VDomNode,
} from "./types";

let VDOM: object | null | string | number = null;

let hooks: Array<THook<any>> = [];
let hooksMode: "add" | "remove" = "add";

export const useState = <T>(initialState: T): [T, (newState: T) => void] => {
  // @ts-ignore
  let component = hooks.parent as VDOMComponent;
  let hook: THook<T> | null = null;
  const setState = (newState: T) => {
    hooksMode = "remove";
    const index = component.hooks.indexOf(hook!);

    const oldHooks = hooks;
    hooks = [...component.hooks];
    hooks[index] = [newState, hooks[index][1]];
    // @ts-ignore
    hooks.parent = component;
    const newTree = component.type(component.props);
    hooks = oldHooks;
    const diff = createDiff(component.tree, newTree);
    if (diff.kind == "replace")
      diff.callback = (elem) => (component.node = elem);
    hook![0] = newState;
    component.tree = newTree;
    applyUpdate(component.node!, diff);
  };

  if (hooksMode === "add") {
    hook = [initialState, setState];
    hooks.push(hook);
    return hook;
  }

  hook = hooks.shift() as THook<T>;
  return hook;
};

export const createElement = (
  type: string,
  props: VDOMAttributes & { key?: string } = {},
  ...children: any[]
): VDOMElement => {
  const key = props?.key;
  delete props?.key;

  return {
    kind: "element",
    type,
    props: { ...props },
    children: children,
    key: key,
  };
};

export const createComponent = <P extends object>(
  component: Component,
  props?: P & { key?: string },
  ...children: any[]
): VDOMComponent => {
  const key = props?.key;
  delete props?.key;

  const _props = { ...props, children: children };
  const result = {
    hooks: [],
  };

  let newHooks: Array<THook<any>> = [];

  const oldHooksLength = hooks.length;
  // @ts-ignore
  hooks.parent = result;
  const tree = component(_props);
  if (hooksMode === "add") {
    newHooks = hooks.slice(oldHooksLength - hooks.length);
  }
  // @ts-ignore
  return Object.assign(result, {
    type: component,
    props: _props,
    kind: "component",
    tree: tree,
    hooks: newHooks,
    key: key,
  });
};

export const createRoot = (rootElement: HTMLElement | null) => {
  if (!rootElement) {
    throw new Error("container not found");
  }
  return {
    render(el: VDomNode) {
      VDOM = el;

      rootElement.replaceWith(renderElement(el));
    },
  };
};
