export interface SingleNumberData {
    value: number;
    name?: string;
    color?: string;
}
export interface MultiNumberData {
    values: number[];
    name?: string;
    color?: string;
}
export declare type ChartType = "TABLE";
export declare namespace Chart {
    function table(data: SingleNumberData[]): HTMLTableElement;
}
