import { Binary } from "./Binary";
export function toRFC7515(guid) {
    return Binary.read(Binary.writeSync(guid.data, "text/plain"), "base64");
}
export function fromRFC7515(rfc7515) {
}
