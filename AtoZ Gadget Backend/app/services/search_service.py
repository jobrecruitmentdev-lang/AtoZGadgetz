"""
Search Service
==============
Elasticsearch-powered product search with MySQL fallback.

Features:
- Full-text search with relevance scoring
- Typo tolerance (fuzzy matching)
- Autocomplete suggestions
- Multi-field filters (category, brand, price range, rating)
- Sorting (relevance, price, rating, newest)

Graceful Degradation:
  If Elasticsearch is unavailable, the service automatically falls back
  to MySQL LIKE-based search. No configuration required.
"""
import os
import json
import logging
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.models.product import Product
from app.models.category import Category
from app.models.brand import Brand

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Elasticsearch Client (lazy init with fallback)
# ─────────────────────────────────────────────
_es_client = None

def _get_es_client():
    global _es_client
    if _es_client is not None:
        return _es_client
    try:
        from elasticsearch import Elasticsearch
        es_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
        client = Elasticsearch(es_url, request_timeout=5)
        if client.ping():
            _es_client = client
            logger.info("✅ Elasticsearch connected: %s", es_url)
            return _es_client
        else:
            logger.warning("⚠️  Elasticsearch ping failed — falling back to MySQL search")
            return None
    except Exception as e:
        logger.warning("⚠️  Elasticsearch unavailable (%s) — falling back to MySQL search", str(e))
        return None


PRODUCT_INDEX = os.getenv("ELASTICSEARCH_INDEX_PRODUCTS", "deodap_products")


class SearchService:

    # ─────────────────────────────────────────────
    # INDEX MANAGEMENT
    # ─────────────────────────────────────────────
    def create_index(self):
        """Create Elasticsearch index with proper mappings."""
        es = _get_es_client()
        if not es:
            return False

        mapping = {
            "settings": {
                "analysis": {
                    "analyzer": {
                        "autocomplete_analyzer": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase", "autocomplete_filter"],
                        }
                    },
                    "filter": {
                        "autocomplete_filter": {
                            "type": "edge_ngram",
                            "min_gram": 1,
                            "max_gram": 20,
                        }
                    },
                }
            },
            "mappings": {
                "properties": {
                    "id":          {"type": "integer"},
                    "name":        {"type": "text", "analyzer": "autocomplete_analyzer", "search_analyzer": "standard"},
                    "description": {"type": "text"},
                    "sku":         {"type": "keyword"},
                    "category_id": {"type": "integer"},
                    "category":    {"type": "keyword"},
                    "brand_id":    {"type": "integer"},
                    "brand":       {"type": "keyword"},
                    "price":       {"type": "float"},
                    "rating":      {"type": "float"},
                    "status":      {"type": "keyword"},
                    "created_at":  {"type": "date"},
                    "tags":        {"type": "text"},
                    "handle":      {"type": "keyword"},
                    "title":       {"type": "text", "analyzer": "autocomplete_analyzer", "search_analyzer": "standard"},
                    "option1_name": {"type": "keyword"},
                    "option2_name": {"type": "keyword"},
                    "option3_name": {"type": "keyword"},
                    "hs_code":     {"type": "keyword"},
                    "country_of_origin": {"type": "keyword"},
                    "location":    {"type": "keyword"},
                    "bin_name":    {"type": "keyword"},
                }
            }
        }

        if not es.indices.exists(index=PRODUCT_INDEX):
            es.indices.create(index=PRODUCT_INDEX, body=mapping)
            logger.info("Created Elasticsearch index: %s", PRODUCT_INDEX)
        return True

    def index_product(self, product: Any) -> bool:
        """Index or re-index a single product document."""
        es = _get_es_client()
        if not es:
            return False
        try:
            doc = {
                "id":          product.id,
                "name":        product.name,
                "description": product.description or "",
                "sku":         product.sku,
                "category_id": product.category_id,
                "category":    product.category.name if product.category else "",
                "brand_id":    product.brand_id,
                "brand":       product.brand.name if product.brand else "",
                "price":       float(product.price or 0),
                "rating":      getattr(product, 'rating', 0.0) or 0.0,
                "status":      product.status,
                "created_at":  product.created_at.isoformat() if product.created_at else None,
                "tags":        getattr(product, 'tags', '') or "",
                "handle":      product.handle or "",
                "title":       product.title or product.name,
                "option1_name": product.option1_name or "",
                "option2_name": product.option2_name or "",
                "option3_name": product.option3_name or "",
                "hs_code":     product.hs_code or "",
                "country_of_origin": product.country_of_origin or "",
                "location":    product.location or "",
                "bin_name":    product.bin_name or "",
            }
            es.index(index=PRODUCT_INDEX, id=str(product.id), document=doc)
            return True
        except Exception as e:
            logger.error("Failed to index product %s: %s", product.id, e)
            return False

    def delete_product_from_index(self, product_id: int) -> bool:
        """Remove a product from the Elasticsearch index."""
        es = _get_es_client()
        if not es:
            return False
        try:
            es.delete(index=PRODUCT_INDEX, id=str(product_id), ignore=[404])
            return True
        except Exception as e:
            logger.error("Failed to delete product %s from index: %s", product_id, e)
            return False

    def bulk_index_products(self, db: Session) -> Dict:
        """Rebuild entire product index from database."""
        es = _get_es_client()
        if not es:
            return {"success": False, "reason": "Elasticsearch unavailable"}

        self.create_index()
        products = db.query(Product).filter(Product.status == "active").all()
        success_count = 0
        for product in products:
            if self.index_product(product):
                success_count += 1

        return {"success": True, "indexed": success_count, "total": len(products)}

    # ─────────────────────────────────────────────
    # ELASTICSEARCH SEARCH
    # ─────────────────────────────────────────────
    def _es_search(
        self,
        q: str,
        category_id: Optional[int] = None,
        brand_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        sort_by: str = "relevance",
        page: int = 1,
        size: int = 20,
    ) -> Optional[Dict]:
        """Execute Elasticsearch query. Returns None if ES unavailable."""
        es = _get_es_client()
        if not es:
            return None

        try:
            must = []
            filters = [{"term": {"status": "active"}}]

            # Multi-field fuzzy full-text query
            if q:
                must.append({
                    "multi_match": {
                        "query": q,
                        "fields": ["name^3", "title^3", "description^1", "category^2", "brand^2", "sku^2", "handle^2", "tags^1"],
                        "fuzziness": "AUTO",
                        "operator": "or",
                    }
                })

            # Category filter
            if category_id:
                filters.append({"term": {"category_id": category_id}})

            # Brand filter
            if brand_id:
                filters.append({"term": {"brand_id": brand_id}})

            # Price range filter
            price_range = {}
            if min_price is not None:
                price_range["gte"] = min_price
            if max_price is not None:
                price_range["lte"] = max_price
            if price_range:
                filters.append({"range": {"price": price_range}})

            # Rating filter
            if min_rating is not None:
                filters.append({"range": {"rating": {"gte": min_rating}}})

            # Sort
            sort_options = {
                "relevance": ["_score"],
                "price_asc":  [{"price": "asc"}],
                "price_desc": [{"price": "desc"}],
                "rating":     [{"rating": {"order": "desc", "missing": "_last"}}],
                "newest":     [{"created_at": "desc"}],
            }
            sort_list = sort_options.get(sort_by, ["_score"])

            query = {
                "query": {
                    "bool": {
                        "must": must if must else [{"match_all": {}}],
                        "filter": filters,
                    }
                },
                "sort": sort_list,
                "from": (page - 1) * size,
                "size": size,
                "highlight": {
                    "fields": {"name": {}, "description": {}}
                },
            }

            response = es.search(index=PRODUCT_INDEX, body=query)
            hits = response["hits"]

            return {
                "total": hits["total"]["value"],
                "product_ids": [int(h["_id"]) for h in hits["hits"]],
                "scores": {int(h["_id"]): h["_score"] for h in hits["hits"]},
            }
        except Exception as e:
            logger.error("Elasticsearch search error: %s", e)
            return None

    # ─────────────────────────────────────────────
    # MYSQL FALLBACK SEARCH
    # ─────────────────────────────────────────────
    def _mysql_search(
        self,
        db: Session,
        q: str,
        category_id: Optional[int] = None,
        brand_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        sort_by: str = "relevance",
        page: int = 1,
        size: int = 20,
    ) -> Tuple[List[Product], int]:
        """MySQL LIKE-based search fallback."""
        pat = f"%{q}%"
        query = db.query(Product).filter(
            Product.status == "active",
            or_(
                Product.name.like(pat),
                Product.title.like(pat),
                Product.handle.like(pat),
                Product.description.like(pat),
                Product.sku.like(pat),
                Product.tags.like(pat) if hasattr(Product, 'tags') and Product.tags is not None else False,
            )
        )

        if category_id:
            query = query.filter(Product.category_id == category_id)
        if brand_id:
            query = query.filter(Product.brand_id == brand_id)
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        # min_rating filter skipped - Product model has no rating column yet

        sort_map = {
            "price_asc":  Product.price.asc(),
            "price_desc": Product.price.desc(),
            "newest":     Product.id.desc(),
        }
        order_clause = sort_map.get(sort_by, Product.id.desc())
        query = query.order_by(order_clause)

        total = query.count()
        products = query.offset((page - 1) * size).limit(size).all()
        return products, total

    # ─────────────────────────────────────────────
    # PUBLIC SEARCH API
    # ─────────────────────────────────────────────
    def search_products(
        self,
        db: Session,
        q: str = "",
        category_id: Optional[int] = None,
        brand_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        sort_by: str = "relevance",
        page: int = 1,
        size: int = 20,
    ) -> Dict[str, Any]:
        """
        Main search entry point.
        Tries Elasticsearch first, falls back to MySQL.
        """
        engine_used = "elasticsearch"

        # Try Elasticsearch
        es_result = self._es_search(
            q=q, category_id=category_id, brand_id=brand_id,
            min_price=min_price, max_price=max_price,
            min_rating=min_rating, sort_by=sort_by, page=page, size=size,
        )

        if es_result:
            # Fetch full product objects from DB in ES score order
            product_ids = es_result["product_ids"]
            if not product_ids:
                return {"products": [], "total": 0, "page": page, "size": size, "engine": engine_used}

            products_by_id = {
                p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).all()
            }
            products = [products_by_id[pid] for pid in product_ids if pid in products_by_id]
            return {
                "products": products,
                "total": es_result["total"],
                "page": page,
                "size": size,
                "engine": engine_used,
            }
        else:
            # Fallback to MySQL
            engine_used = "mysql"
            products, total = self._mysql_search(
                db=db, q=q, category_id=category_id, brand_id=brand_id,
                min_price=min_price, max_price=max_price,
                min_rating=min_rating, sort_by=sort_by, page=page, size=size,
            )
            return {
                "products": products,
                "total": total,
                "page": page,
                "size": size,
                "engine": engine_used,
            }

    # ─────────────────────────────────────────────
    # AUTOCOMPLETE
    # ─────────────────────────────────────────────
    def autocomplete(self, db: Session, q: str, limit: int = 8) -> List[str]:
        """
        Return autocomplete suggestions for partial queries.
        Uses Elasticsearch prefix matching, falls back to MySQL LIKE.
        """
        if len(q) < 1:
            return []

        es = _get_es_client()
        if es:
            try:
                response = es.search(
                    index=PRODUCT_INDEX,
                    body={
                        "suggest": {
                            "product_suggest": {
                                "prefix": q,
                                "completion": {
                                    "field": "name",
                                    "size": limit,
                                    "fuzzy": {"fuzziness": "AUTO"},
                                }
                            }
                        },
                        "query": {
                            "bool": {
                                "must": [{"match_phrase_prefix": {"name": {"query": q}}}],
                                "filter": [{"term": {"status": "active"}}],
                            }
                        },
                        "_source": ["name"],
                        "size": limit,
                    }
                )
                hits = response.get("hits", {}).get("hits", [])
                suggestions = list({h["_source"]["name"] for h in hits})
                return suggestions[:limit]
            except Exception:
                pass

        # MySQL fallback
        pat = f"{q}%"
        results = (
            db.query(Product.name)
            .filter(Product.status == "active", Product.name.like(pat))
            .limit(limit)
            .all()
        )
        return [r[0] for r in results]

    # ─────────────────────────────────────────────
    # SEARCH SUGGESTIONS (Popular Terms)
    # ─────────────────────────────────────────────
    def get_suggestions(self, db: Session, limit: int = 10) -> List[str]:
        """Return popular search suggestions (top product names)."""
        results = (
            db.query(Product.name)
            .filter(Product.status == "active")
            .order_by(Product.id.desc())
            .limit(limit)
            .all()
        )
        return [r[0] for r in results]


search_service = SearchService()
