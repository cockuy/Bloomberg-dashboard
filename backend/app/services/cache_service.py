from datetime import datetime, timedelta
from typing import Any, Dict, Optional

class CacheService:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str, ttl_seconds: int) -> Optional[Dict[str, Any]]:
        entry = self._cache.get(key)
        if not entry:
            return None
        
        now = datetime.now()
        is_expired = now > entry["fetched_at"] + timedelta(seconds=ttl_seconds)
        
        if is_expired:
            return {
                "payload": entry["payload"],
                "fetched_at": entry["fetched_at"],
                "stale": True
            }
        
        return {
            "payload": entry["payload"],
            "fetched_at": entry["fetched_at"],
            "stale": False
        }

    def set(self, key: str, payload: Any):
        self._cache[key] = {
            "payload": payload,
            "fetched_at": datetime.now()
        }

cache = CacheService()
