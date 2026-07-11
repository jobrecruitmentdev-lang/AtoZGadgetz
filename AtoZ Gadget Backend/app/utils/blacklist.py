import logging
from typing import Set
from app.config.settings import settings

logger = logging.getLogger("security")

# Fallback in-memory blacklist
_memory_blacklist: Set[str] = set()

# Try initializing redis connection
redis_client = None
try:
    import redis
    if hasattr(settings, "REDIS_URL") and settings.REDIS_URL:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        # Ping connection
        redis_client.ping()
        logger.info("Token blacklist successfully connected to Redis")
except Exception as e:
    logger.warning(f"Could not connect to Redis for token blacklisting, falling back to Memory: {str(e)}")


def blacklist_token(token: str, expires_in_seconds: int = 3600):
    """
    Mark an access token as blacklisted.
    """
    if redis_client:
        try:
            redis_client.setex(f"blacklist:{token}", expires_in_seconds, "1")
            return
        except Exception as e:
            logger.error(f"Redis setex failed: {str(e)}")
            
    # Fallback to memory
    _memory_blacklist.add(token)


def is_token_blacklisted(token: str) -> bool:
    """
    Check if an access token is in the blacklist.
    """
    if redis_client:
        try:
            return redis_client.exists(f"blacklist:{token}") > 0
        except Exception as e:
            logger.error(f"Redis exists check failed: {str(e)}")
            
    return token in _memory_blacklist
