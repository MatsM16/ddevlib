import { define } from "./Define.js";
export class HTMLTreeViewElement extends HTMLElement {
    constructor() {
        super();
        const testTrees = [
            {
                text: "A",
                children: [
                    {
                        text: "A A"
                    },
                    {
                        text: "A B"
                    },
                    {
                        text: "A C"
                    }
                ]
            },
            {
                text: "B",
                children: [
                    {
                        text: "B A"
                    },
                    {
                        text: "B B",
                        children: [
                            {
                                text: "B B A"
                            },
                            {
                                text: "B B B"
                            },
                            {
                                text: "B B C"
                            }
                        ]
                    },
                    {
                        text: "B C"
                    }
                ]
            },
            {
                text: "C",
                children: [
                    {
                        text: "C A"
                    },
                    {
                        text: "C B"
                    },
                    {
                        text: "C C"
                    }
                ]
            }
        ];
        this.addTrees(testTrees);
    }
    addTrees(bases) {
        for (const base of bases) {
            this.addTree(base);
        }
    }
    addTree(base) {
        const newNode = (tree, parent) => {
            const icon = document.createElement("dd-icon");
            icon.setIcon("folder");
            icon.classList.add("icon");
            const text = document.createTextNode(tree.text);
            const nodeEl = document.createElement("span");
            nodeEl.appendChild(icon);
            nodeEl.appendChild(text);
            if (tree.children) {
                const subtree = document.createElement("div");
                for (const child of tree.children) {
                    newNode(child, subtree);
                }
                nodeEl.appendChild(subtree);
            }
            nodeEl.addEventListener("click", evt => {
                if (evt.target === nodeEl) {
                    nodeEl.classList.toggle("open");
                }
            });
            parent.appendChild(nodeEl);
        };
        newNode(base, this);
    }
}
define(HTMLTreeViewElement, "dd-treeview");
//# sourceMappingURL=TreeView.js.map