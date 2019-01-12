import { define } from "./Define.js";
import { HTMLIconElement } from "./Icon.js";

export class HTMLTreeViewElement extends HTMLElement
{
    constructor()
    {
        super();

        const testTrees: TreeNode[] = [
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
        ]
    
        this.addTrees(testTrees);
    }

    addTrees(bases: TreeNode[])
    {
        for (const base of bases)
        {
            this.addTree(base);
        }
    }

    addTree(base: TreeNode) {
        const newNode = (tree: TreeNode, parent: Element) => {
            const icon = document.createElement("dd-icon") as HTMLIconElement;
            icon.setIcon("folder");
            icon.classList.add("icon");
            
            const text = document.createTextNode(tree.text);

            const nodeEl = document.createElement("span");
            nodeEl.appendChild(icon);
            nodeEl.appendChild(text);

            if (tree.children)
            {
                const subtree = document.createElement("div");
                
                for (const child of tree.children)
                {
                    newNode(child, subtree);
                }

                nodeEl.appendChild(subtree);
            }

            nodeEl.addEventListener("click", evt => {
                if (evt.target === nodeEl)
                {
                    nodeEl.classList.toggle("open");
                }
            })

            parent.appendChild(nodeEl);
        }

        newNode(base, this);
    }
}

export interface TreeNode
{
    text: string;
    children?: TreeNode[];
}

define(HTMLTreeViewElement, "dd-treeview");