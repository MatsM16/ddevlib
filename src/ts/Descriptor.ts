export type Key = string | Symbol;
export type KeyType = "property" | "method" | undefined;

export type Description<T = unknown> = { key: Key, info?: T, type: KeyType }

export const _descriptions: Map<Object, Set<Description>> = new Map();

export function describe(proto: Object, description: Description)
{
    let descriptions = _descriptions.get(proto);

    if (!descriptions)
    {
        descriptions = new Set<Description>();
        _descriptions.set(proto, descriptions);
    }

    descriptions.add(description);
}

export function description(proto: Object, type: KeyType)
{
    let descriptions = _descriptions.get(proto);
    
    if (!descriptions)
        return [];
        
    return type
        ? [...descriptions].filter(desc => desc.type === type)
        : [...descriptions]
}