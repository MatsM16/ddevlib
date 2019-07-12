export const DEFAULT_CACHE = "dd-default-cache";
export function strategy(strategy, cache) {
    if (strategy === "cache-only") {
        return request => caches.match(request);
    }
    else if (strategy === "network-only") {
        return request => fetch(request);
    }
    else if (strategy === "cache-first") {
        return request => caches.match(request).then(response => {
            if (response)
                return response;
            return fetch(request).then(response => {
                if (!response || response.status !== 200 || response.type !== "basic")
                    return response;
                caches.open(cache || DEFAULT_CACHE).then(cache => cache.put(request, response.clone()));
                return response;
            });
        });
    }
    else if (strategy === "network-first") {
        return request => fetch(request).then(response => caches.open(cache || DEFAULT_CACHE).then(cache => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return cache.match(request);
            }
            cache.put(request, response.clone());
            return response;
        }));
    }
    else if (strategy === "stale-while-revalidate") {
        return request => caches.match(request).then(response => {
            const fetchPromise = fetch(request).then(response => {
                if (!response || response.status !== 200 || response.type !== "basic")
                    return response;
                caches.open(cache || DEFAULT_CACHE).then(cache => cache.put(request, response.clone()));
                return response;
            });
            return response ? response : fetchPromise;
        });
    }
    else {
        throw new Error("Unknown strategy: " + strategy);
    }
}
export function route(route, strategy) {
    function isMatch(request) {
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
export function router(fallback, ...routes) {
    return request => {
        let strategy = false;
        for (const route of routes)
            if ((strategy = route(request)) !== false)
                return strategy(request);
        if (fallback)
            return fallback(request);
        throw new Error("No strategy available for: " + request.url);
    };
}
export function path(path) {
    path = path
        .replace(/\\/g, "\\\\")
        .replace(/\./g, "\\.")
        .replace(/\//g, "\\/");
    path = path
        .replace(/\*\*/g, ".+")
        .replace(/\*/g, ".*");
    return new RegExp(path);
}
export function cache(urls, cache) {
    // Download all the files
    return Promise.all(urls.map(url => fetch(url).then(response => ({ url, response }))))
        .then(requests => 
    // Open the cache
    caches.open(cache || DEFAULT_CACHE)
        .then(cache => 
    // Store the files
    Promise.all(requests.map(({ url, response }) => cache.put(url, response)))));
}
export function reloadCache(cacheName) {
    return caches.open(cacheName || DEFAULT_CACHE).then(cache => cache.keys()
        .then(requests => requests.map(request => fetch(request).then(response => ({ request, response }))))
        .then(requests => Promise.all(requests))
        .then(requests => requests.map(({ request, response }) => cache.put(request, response)))
        .then(added => Promise.all(added)));
}
export function update(cacheName, urls) {
    return urls
        ? cache(urls, cacheName)
        : reloadCache(cacheName);
}
