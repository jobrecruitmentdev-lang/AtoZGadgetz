"""
DeoDap Load Testing — Locust
=============================
Simulates realistic e-commerce user journeys:
  1. Browse product catalog
  2. Search products
  3. View product detail
  4. Add to cart
  5. Place order (light percentage)

Usage:
  # Web UI mode (recommended):
  locust -f locustfile.py --host http://localhost:8000

  # Headless 10k users:
  locust -f locustfile.py --headless -u 10000 -r 100 --run-time 120s --host http://localhost:8000

  # Headless 50k users:
  locust -f locustfile.py --headless -u 50000 -r 500 --run-time 120s --host http://localhost:8000

  # Headless 100k users:
  locust -f locustfile.py --headless -u 100000 -r 1000 --run-time 120s --host http://localhost:8000
"""
import random
import json
from locust import HttpUser, task, between, tag, events
from locust.exception import RescheduleTask


# ─────────────────────────────────────────────
# TEST DATA
# ─────────────────────────────────────────────
SEARCH_QUERIES = [
    "phone", "laptop", "headphones", "camera", "watch",
    "shoes", "shirt", "bag", "sunglasses", "earphones",
    "samsung", "apple", "oneplus", "boat", "jbl",
]

PRODUCT_IDS = list(range(1, 50))   # Assumes product IDs 1-49 exist


# ─────────────────────────────────────────────
# ANONYMOUS CUSTOMER (Browse Only)
# ─────────────────────────────────────────────
class AnonymousUser(HttpUser):
    """
    Simulates an unauthenticated visitor.
    Weight: 40% of traffic (majority of web traffic is anonymous).
    """
    weight = 4
    wait_time = between(1, 4)

    @task(5)
    @tag("catalog", "homepage")
    def browse_homepage(self):
        self.client.get("/api/store/home", name="GET /api/store/home")

    @task(8)
    @tag("catalog", "product")
    def browse_products(self):
        page = random.randint(1, 5)
        self.client.get(
            f"/api/store/products?page={page}&size=20",
            name="GET /api/store/products"
        )

    @task(5)
    @tag("search", "autocomplete")
    def autocomplete_search(self):
        q = random.choice(SEARCH_QUERIES)[:3]
        self.client.get(
            f"/api/search/autocomplete?q={q}",
            name="GET /api/search/autocomplete"
        )

    @task(6)
    @tag("search")
    def search_products(self):
        q = random.choice(SEARCH_QUERIES)
        self.client.get(
            f"/api/search?q={q}&size=10",
            name="GET /api/search"
        )

    @task(10)
    @tag("catalog", "product")
    def view_product(self):
        pid = random.choice(PRODUCT_IDS)
        self.client.get(
            f"/api/store/products/{pid}",
            name="GET /api/store/products/{id}"
        )

    @task(3)
    @tag("recommendations")
    def view_similar_products(self):
        pid = random.choice(PRODUCT_IDS)
        self.client.get(
            f"/api/recommendations/similar/{pid}",
            name="GET /api/recommendations/similar"
        )

    @task(2)
    @tag("catalog")
    def browse_categories(self):
        self.client.get("/api/store/categories", name="GET /api/store/categories")

    @task(1)
    @tag("health")
    def health_check(self):
        self.client.get("/api/health", name="GET /api/health")


# ─────────────────────────────────────────────
# AUTHENTICATED CUSTOMER (Full Journey)
# ─────────────────────────────────────────────
class AuthenticatedCustomer(HttpUser):
    """
    Simulates a logged-in customer doing a full shopping journey.
    Weight: 50% of traffic.
    """
    weight = 5
    wait_time = between(2, 6)

    def on_start(self):
        """Login before starting user tasks."""
        self.token = None
        # Use different test users to avoid conflicts
        user_num = random.randint(1, 100)
        response = self.client.post(
            "/api/auth/login",
            json={
                "email": f"testuser{user_num}@loadtest.com",
                "password": "TestPass@123",
            },
            name="POST /api/auth/login",
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("data", {}).get("access_token")
        else:
            # If test user doesn't exist, skip this user
            raise RescheduleTask()

    def get_headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    @task(10)
    @tag("catalog")
    def browse_products(self):
        page = random.randint(1, 5)
        self.client.get(
            f"/api/store/products?page={page}&size=20",
            headers=self.get_headers(),
            name="GET /api/store/products"
        )

    @task(8)
    @tag("search")
    def search_products(self):
        q = random.choice(SEARCH_QUERIES)
        self.client.get(
            f"/api/search?q={q}",
            headers=self.get_headers(),
            name="GET /api/search"
        )

    @task(12)
    @tag("product")
    def view_product(self):
        pid = random.choice(PRODUCT_IDS)
        self.client.get(
            f"/api/store/products/{pid}",
            headers=self.get_headers(),
            name="GET /api/store/products/{id}"
        )
        # Track behaviour
        self.client.post(
            "/api/behaviour/track",
            json={"product_id": pid, "action": "view", "source": "catalog"},
            headers=self.get_headers(),
            name="POST /api/behaviour/track"
        )

    @task(6)
    @tag("recommendations")
    def get_recommendations(self):
        self.client.get(
            "/api/recommendations/for-you",
            headers=self.get_headers(),
            name="GET /api/recommendations/for-you"
        )

    @task(4)
    @tag("cart")
    def add_to_cart(self):
        pid = random.choice(PRODUCT_IDS)
        self.client.post(
            "/api/cart/add",
            json={"product_id": pid, "quantity": 1},
            headers=self.get_headers(),
            name="POST /api/cart/add"
        )
        self.client.post(
            "/api/behaviour/track",
            json={"product_id": pid, "action": "cart"},
            headers=self.get_headers(),
            name="POST /api/behaviour/track (cart)"
        )

    @task(3)
    @tag("cart")
    def view_cart(self):
        self.client.get(
            "/api/cart",
            headers=self.get_headers(),
            name="GET /api/cart"
        )

    @task(2)
    @tag("wishlist")
    def add_to_wishlist(self):
        pid = random.choice(PRODUCT_IDS)
        self.client.post(
            "/api/wishlist/toggle",
            json={"product_id": pid},
            headers=self.get_headers(),
            name="POST /api/wishlist/toggle"
        )

    @task(1)
    @tag("profile")
    def view_profile(self):
        self.client.get(
            "/api/profile",
            headers=self.get_headers(),
            name="GET /api/profile"
        )

    @task(1)
    @tag("orders")
    def view_orders(self):
        self.client.get(
            "/api/orders/my-orders",
            headers=self.get_headers(),
            name="GET /api/orders/my-orders"
        )


# ─────────────────────────────────────────────
# ADMIN USER (Dashboard & Reports)
# ─────────────────────────────────────────────
class AdminUser(HttpUser):
    """
    Simulates admin user checking dashboard and reports.
    Weight: 10% of traffic (admins are minority).
    """
    weight = 1
    wait_time = between(5, 15)

    def on_start(self):
        self.token = None
        response = self.client.post(
            "/api/auth/login",
            json={"email": "admin@deodap.com", "password": "Admin@123456"},
            name="POST /api/auth/login (admin)"
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("data", {}).get("access_token")

    def get_headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(3)
    def view_dashboard(self):
        self.client.get(
            "/api/admin/dashboard",
            headers=self.get_headers(),
            name="GET /api/admin/dashboard"
        )

    @task(2)
    def daily_report(self):
        self.client.get(
            "/api/analytics/reports/daily",
            headers=self.get_headers(),
            name="GET /api/analytics/reports/daily"
        )

    @task(2)
    def list_orders(self):
        self.client.get(
            "/api/orders?page=1&size=20",
            headers=self.get_headers(),
            name="GET /api/orders (admin)"
        )

    @task(1)
    def view_inventory(self):
        self.client.get(
            "/api/inventory?page=1&size=20",
            headers=self.get_headers(),
            name="GET /api/inventory"
        )


# ─────────────────────────────────────────────
# EVENT HOOKS
# ─────────────────────────────────────────────
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("\n🚀 DeoDap Load Test Starting...")
    print(f"   Target: {environment.host}")
    print(f"   Users:  {environment.runner.target_user_count if environment.runner else 'N/A'}")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    stats = environment.runner.stats
    print("\n✅ Load Test Complete")
    print(f"   Total Requests:    {stats.total.num_requests}")
    print(f"   Failed Requests:   {stats.total.num_failures}")
    print(f"   Avg Response Time: {stats.total.avg_response_time:.1f}ms")
    print(f"   Requests/sec:      {stats.total.current_rps:.1f}")
