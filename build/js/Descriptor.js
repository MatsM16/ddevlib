export const _descriptions = new Map();
export function describe(proto, description) {
    let descriptions = _descriptions.get(proto);
    if (!descriptions) {
        descriptions = new Set();
        _descriptions.set(proto, descriptions);
    }
    descriptions.add(description);
}
export function description(proto, type) {
    let descriptions = _descriptions.get(proto);
    if (!descriptions)
        return [];
    return type
        ? [...descriptions].filter(desc => desc.type === type)
        : [...descriptions];
}
