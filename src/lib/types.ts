export type VDOMAttributes = {
  [_: string]: string | number | boolean | Function;
};

export type VDOMElementKey = symbol | string | number;

export type Component = (props: any) => VDomNode;

export type THook<T extends any> = [T, (param: T) => void];

export interface VDOMElement {
  kind: "element";
  type: string;
  props: object;
  children?: any[];
  key?: VDOMElementKey;
}

export interface VDOMComponent {
  kind: "component";
  type: Component;
  props: object & {
    children?: any[];
  };
  tree: VDomNode;
  key: VDOMElementKey;
  hooks: Array<THook<any>>;
  node?: HTMLElement | Text;
}

export type VDomNode = VDOMElement | VDOMComponent | string | number;
