import { createRoot, useState } from "./lib/create";
import { createComponent, createElement } from "./lib/create";
import "./style.css";

const Counter = () => {
  const [counter, setCounter] = useState(0);
  console.count("Counter")

  return createElement(
    "li",
    {className: "counter"},
    createElement("h1", {}, counter),
    createElement("button", { onclick: () => setCounter(counter + 1) }, "+"),
  );
}

const Comp = ({text}: {text: string}) => {
  const [counter, setCounter] = useState(0);
  console.count('Comp')
  return (
    createElement(
      "div",
      {},
      createElement("h1", {}, text),
      createElement("h1", {}, counter),
      createElement("button", { onclick: () => setCounter(counter + 1) }, "+")
    )
  )
};

const App = ({ text, children }: { text: string; children: any[] }) => {
  const [counter, setCounter] = useState(0);
  const [name, setName] = useState("Arindam");
  const [isTagAnchor, setIsTagAnchor] = useState(true);
  console.count("App")

  return createElement(
    "div",
    {},
    text,
    (children[0])(),
    createElement('div', {className: "counter"}, createElement("button", { onclick: () => setCounter(counter + 1) }, "+"),
    createElement("h1", {}, counter)),
    createElement("input", { value: name, oninput: (e: any) => setName(e.target.value) }),
    createElement(
      isTagAnchor ? "a" : "span",
      { href: "#!", onclick: () => setIsTagAnchor(!isTagAnchor) },
      "Click me"
    ),
    createComponent(Counter),
    createComponent(Counter),
    createComponent(Comp, { text: name })
  );
};

const SuperApp = ({text, children}: {text: string, children: any}) => {
  console.count("SuperApp")
  return createComponent(App, { text }, children[0]);
}

createRoot(document.getElementById("root")).render(
  createElement(
    "div",
    {className: "container"},
    "hello",
    createElement("a", { href: "/" }, "ciao"),
    createElement("a", { href: "/home" }, "home"),
    createComponent(SuperApp, { text: "Come va?" }, () => "     Va bene!")
  )
);
