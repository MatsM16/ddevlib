export declare class HTMLTreeViewElement extends HTMLElement {
    constructor();
    addTrees(bases: TreeNode[]): void;
    addTree(base: TreeNode): void;
}
export interface TreeNode {
    text: string;
    children?: TreeNode[];
}
