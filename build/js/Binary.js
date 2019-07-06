export var Binary;
(function (Binary) {
    function download(blob, filename) {
        const link = document.createElement("a");
        link.download = filename;
        const url = URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    Binary.download = download;
    function read(blob, mode) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(reader.error);
            switch (mode) {
                case "dataURL":
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                    break;
                case "base64":
                    reader.onload = () => resolve(reader.result.split("base64,")[1]);
                    reader.readAsDataURL(blob);
                    break;
                case "buffer":
                    reader.onload = () => resolve(reader.result);
                    reader.readAsArrayBuffer(blob);
                    break;
                case "text":
                    reader.onload = () => resolve(reader.result);
                    reader.readAsText(blob);
                    break;
                default:
                    throw new Error("Unknown mode");
            }
            ;
        });
    }
    Binary.read = read;
    function write(data, blobType) {
        return new Promise((resolve, reject) => {
            try {
                const blob = writeSync(data, blobType);
                resolve(blob);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    Binary.write = write;
    function writeSync(data, blobType) {
        if (typeof data === "string")
            return new Blob([data], { type: blobType || "text/plain" });
        else if ('buffer' in data && 'byteLength' in data && 'byteOffset' in data)
            return new Blob([data.buffer], { type: "application/octet-stream" });
        else if ('byteLength' in data)
            return new Blob([data], { type: blobType || "application/octet-stream" });
        else if (Array.isArray(data) || Object.entries(data).length > 0)
            return new Blob([JSON.stringify(data)], { type: "application/json" });
        else
            throw new Error("Unable to decide what to do with data");
    }
    Binary.writeSync = writeSync;
})(Binary || (Binary = {}));
const testBlob = new Blob(["This is a test"], { type: "text/plain" });
console.log(testBlob);
