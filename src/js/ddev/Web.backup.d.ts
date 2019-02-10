export declare namespace Web {
    namespace _Helpers {
        function isSuccess(status: number): boolean;
        function serialize(data: any, type: DataType): any;
        function deserialize(data: any, type: DataType): any;
        function applyHeaders(request: XMLHttpRequest, headers?: Map<string, string>, type?: DataType): void;
    }
}
export declare namespace Web {
    function send(method: RequestType, url: string, responseType?: DataType, data?: any, dataType?: DataType, headers?: Map<string, string>): Promise<any>;
    function get(url: string, responseType?: DataType, headers?: Map<string, string>): Promise<any>;
    function post(url: string, data?: any, dataType?: DataType, headers?: Map<string, string>): Promise<any>;
    function put(url: string, data?: any, dataType?: DataType, headers?: Map<string, string>): Promise<any>;
    function del(url: string, headers?: Map<string, string>): Promise<any>;
    const globalHeaders: Map<string, string>;
    type DataType = "JSON" | "TEXT" | "BINARY" | "FILE";
    type RequestType = "GET" | "POST" | "PUT" | "DELETE";
}
export declare namespace Web {
    class Api {
        private _headers;
        private _functions;
        constructor(functions?: Map<string, ApiFunction>, headers?: Map<string, string>);
        setHeader(name: string, value: string): void;
        setFunction(f: ApiFunction): void;
        call(name: string, data?: any, ...args: string[]): Promise<any>;
        _consoleView(): void;
    }
    interface ApiFunction {
        name: string;
        url: string;
        method: Web.RequestType;
        dataType?: Web.DataType;
        responseType?: Web.DataType;
        urlParameterNames?: string[];
    }
}
