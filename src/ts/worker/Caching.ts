export type Strategy = (request: Request) => Promise<Response | undefined>

export type Route = (request: Request) => Strategy | false;

export const DEFAULT_CACHE = "dd-default-cache";

export function strategy(strategy: "stale-while-revalidate" | "cache-first" | "network-first" | "cache-only" | "network-only", cache?: string): Strategy
{
    if (strategy === "cache-only")
    {
        return request => caches.match(request)
    }

    else if (strategy === "network-only")
    {
        return request => fetch(request);
    }

    else if (strategy === "cache-first")
    {
        return request => caches.match(request).then(response =>
        {
            if (response)
                return response;

            return fetch(request).then(response =>
            {
                if (!response || response.status !== 200 || response.type !== "basic")
                    return response;

                caches.open(cache || DEFAULT_CACHE).then(cache => 
                    cache.put(request, response.clone()));

                return response;
            })
        });
    }

    else if (strategy === "network-first")
    {
        return request => fetch(request).then(response => caches.open(cache || DEFAULT_CACHE).then(cache =>
        {
            if(!response || response.status !== 200 || response.type !== 'basic')
            {
                return cache.match(request);
            }

            cache.put(request, response.clone());
            return response;
        }));
    }

    else if (strategy === "stale-while-revalidate")
    {
        return request=> caches.match(request).then(response =>
        {
            const fetchPromise = fetch(request).then(response =>
            {
                if (!response || response.status !== 200 || response.type !== "basic")
                    return response;

                caches.open(cache || DEFAULT_CACHE).then(cache => 
                    cache.put(request, response.clone()));

                return response;
            })

            return response ? response : fetchPromise;
        });
    }

    else
    {
        throw new Error("Unknown strategy: " + strategy);
    }
}

export function route(route: RegExp | RegExp[], strategy: Strategy): Route
{

    function isMatch(request: Request)
    {
        if (!Array.isArray(route))
            route = [route];
        
        for (const regExp of route)
            if (regExp.test(request.url))
                return true;
            
        return false;
    }

    return request => isMatch(request) 
        ? strategy 
        : false;
}

export function router(fallback?: Strategy, ...routes: Route[]): (request: Request) => Strategy | false
{
    return request =>
    {
        let strategy: Strategy | false = false;

        for (const route of routes)
            if ((strategy = route(request)) !== false)
                return strategy;

        return fallback
            ? fallback
            : false
    }
}

export function path(path: string): RegExp
{
    path = path
        .replace(/\\/g, "\\\\")
        .replace(/\./g, "\\.")
        .replace(/\//g, "\\/")

    path = path
        .replace(/\*\*/g, ".+")
        .replace(/\*/g, ".*")

    return new RegExp(path);
}