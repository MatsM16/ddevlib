export declare namespace Web {
    function send(method: RequestMethod, url: string, responseType?: RequestDataType, data?: any, dataType?: RequestDataType, headerSettings?: RequestHeaderSettings): Promise<any>;
    function setGlobalHeader(name: string, value: string): void;
    function get(url: string, responseType?: RequestDataType): Promise<any>;
}
export declare namespace Web {
    type RequestMethod = "GET" | "PUT" | "POST" | "DELETE";
    type RequestDataType = "TEXT" | "JSON" | "XML" | "BLOB" | "BYTEARRAY";
    type RequestHeaderSettings = {
        useBlobalHeaders?: boolean;
        customHeaders?: Map<string, string>;
    };
}
export declare namespace Web.Requests {
    const globalHeaders: Map<string, string>;
    function createRequest(method: RequestMethod, url: string): XMLHttpRequest;
    function applyHeaderSettings(xhr: XMLHttpRequest, settings: RequestHeaderSettings): void;
    function applyResponseType(xhr: XMLHttpRequest, type: RequestDataType): void;
    function handleError(reject: Function, { status, statusText }: XMLHttpRequest): void;
    function isSuccessfull({ status }: XMLHttpRequest): boolean;
    function deserializeResponse({ response }: XMLHttpRequest, responseType: RequestDataType): any;
    function serializeData(data: any, type: RequestDataType): null | undefined;
}
