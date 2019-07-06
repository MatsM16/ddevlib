export type TypedArray = Float32Array | Float64Array | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray;

export namespace Binary
{
    export function download(blob: Blob, filename: string)
    {
        const link = document.createElement("a");
        link.download = filename;

        const url = URL.createObjectURL(blob);
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    export function read(blob: Blob, type: "dataURL"): Promise<string>
    export function read(blob: Blob, type: "base64"): Promise<string>
    export function read(blob: Blob, type: "text"): Promise<string>
    export function read(blob: Blob, type: "buffer"): Promise<ArrayBuffer>
    export function read(blob: Blob, mode: "dataURL" | "base64" | "buffer" | "text"): Promise<string | ArrayBuffer | null>
    {
        return new Promise((resolve, reject) =>
        {
            const reader = new FileReader();
            reader.onerror = () => reject (reader.error);

            switch (mode)
            {
                case "dataURL":
                    reader.onload  = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                    break;
                
                case "base64":
                    reader.onload  = () => resolve((reader.result as string).split("base64,")[1]);
                    reader.readAsDataURL(blob);
                    break;
                
                case "buffer":
                    reader.onload  = () => resolve(reader.result);
                    reader.readAsArrayBuffer(blob);
                    break;
                
                case "text":
                    reader.onload  = () => resolve(reader.result);
                    reader.readAsText(blob);
                    break;

                default:
                    throw new Error("Unknown mode");
            };
        });
    }

    export function write(data: string | ArrayBuffer | Record<string | number, any> | TypedArray, blobType?: string): Promise<Blob>
    {
        return new Promise<Blob>((resolve, reject) =>
        {
            try
            {
                const blob = writeSync(data, blobType);
                resolve(blob);
            }
            catch (error)
            {
                reject(error);
            }
        });
    }
    export function writeSync(data: string | ArrayBuffer | Record<string | number, any> | TypedArray, blobType?: string): Blob
    {
        if (typeof data === "string")
            return new Blob([data], { type: blobType || "text/plain"})

        else if ('buffer' in data && 'byteLength' in data && 'byteOffset' in data)
            return new Blob([data.buffer], { type: "application/octet-stream" })

        else if ('byteLength' in data)
            return new Blob([data as ArrayBuffer], { type: blobType || "application/octet-stream" })

        else if (Array.isArray(data) || Object.entries(data).length > 0)
            return new Blob([JSON.stringify(data)], { type: "application/json" })
        
        else
            throw new Error("Unable to decide what to do with data")
    }
}

const testBlob = new Blob(["This is a test"], { type: "text/plain" })

console.log(testBlob);