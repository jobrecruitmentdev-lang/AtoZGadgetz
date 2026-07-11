import json
import logging
import functools
from typing import Optional, Callable, Any
from app.config.settings import settings

logger = logging.getLogger("app")

# Fallback memory cache: {key: (value_json, expiry_timestamp)}
_memory_cache = {}

# Try connecting to Redis
redis_client = None
try:
    import redis
    if hasattr(settings, "REDIS_URL") and settings.REDIS_URL:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        redis_client.ping()
        logger.info("Caching service successfully connected to Redis")
except Exception as e:
    logger.warning(f"Could not connect to Redis for caching, falling back to Memory cache: {str(e)}")


def cached(ttl: int = 300, prefix: str = "cache"):
    """
    Caching decorator for FastAPI endpoints or service functions.
    Serializes output to JSON.
    """
    def decorator(func: Callable[..., Any]):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Compute cache key from function name and arguments
            # Filter out non-serializable args like db Session
            arg_str = ":".join([str(a) for a in args if "Session" not in str(type(a))])
            kwarg_str = ":".join([f"{k}={v}" for k, v in kwargs.items() if "Session" not in str(type(v))])
            cache_key = f"{prefix}:{func.__name__}:{arg_str}:{kwarg_str}"

            # 1. Try fetching from cache
            cached_val = None
            if redis_client:
                try:
                    cached_val = redis_client.get(cache_key)
                except Exception as e:
                    logger.error(f"Redis get failed: {str(e)}")
            else:
                import time
                if cache_key in _memory_cache:
                    val_str, expiry = _memory_cache[cache_key]
                    if time.time() < expiry:
                        cached_val = val_str
                    else:
                        del _memory_cache[cache_key]

            if cached_val is not None:
                try:
                    return json.loads(cached_val)
                except Exception:
                    pass

            # 2. Cache miss: execute function
            result = func(*args, **kwargs)

            # 3. Store result in cache
            try:
                res_str = json.dumps(result)
                if redis_client:
                    redis_client.setex(cache_key, ttl, res_str)
                else:
                    import time
                    _memory_cache[cache_key] = (res_str, time.time() + ttl)
            except Exception as e:
                logger.error(f"Caching write failed: {str(e)}")

            return result
        return wrapper
    return decorator


def invalidate_cache(prefix: str):
    """
    Clear all keys starting with prefix.
    """
    logger.info(f"Invalidating cache with prefix: {prefix}")
    if redis_client:
        try:
            keys = redis_client.keys(f"{prefix}:*")
            if keys:
                redis_client.delete(*keys)
            return
        except Exception as e:
            logger.error(f"Redis delete keys failed: {str(e)}")
            
    # Fallback to memory
    keys_to_remove = [k for k in _memory_cache.keys() if k.startswith(f"{prefix}:")]
    for k in keys_to_remove:
        _memory_cache.pop(k, None)
