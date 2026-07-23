export declare class MemoryCache {
    private cache;
    get(key: string): any;
    set(key: string, value: any, ttlSeconds?: number): void;
    delete(key: string): void;
    clear(): void;
}
export declare const globalCache: MemoryCache;
//# sourceMappingURL=cache.d.ts.map