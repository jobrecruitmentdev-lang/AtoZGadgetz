from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.inventory import Inventory, StockMovement
from app.models.product import Product
from app.models.product_variant import ProductVariant


class InventoryService:
    def _get_or_create_inventory(self, db: Session, product_id: int, variant_id: Optional[int] = None) -> Inventory:
        inv = db.query(Inventory).filter(
            Inventory.product_id == product_id,
            Inventory.variant_id == variant_id
        ).first()

        if not inv:
            # Fallback check catalog to get starting stock
            stock = 0
            if variant_id:
                var = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
                if var:
                    stock = var.stock
            else:
                prod = db.query(Product).filter(Product.id == product_id).first()
                if prod:
                    stock = prod.stock_quantity

            inv = Inventory(
                product_id=product_id,
                variant_id=variant_id,
                stock_quantity=stock,
                reserved_quantity=0
            )
            db.add(inv)
            db.commit()
            db.refresh(inv)

        return inv

    def reserve_stock(self, db: Session, product_id: int, variant_id: Optional[int], quantity: int, order_id: int) -> bool:
        inv = self._get_or_create_inventory(db, product_id, variant_id)
        
        available = inv.stock_quantity - inv.reserved_quantity
        if available < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory stock. Requested: {quantity}, Available: {available}"
            )

        inv.reserved_quantity += quantity
        
        # Synchronize catalog product columns
        prod = db.query(Product).filter(Product.id == product_id).first()
        if prod:
            prod.committed = inv.reserved_quantity
            prod.available = max(0, prod.stock_quantity - inv.reserved_quantity)
        
        # Log stock movement reference
        movement = StockMovement(
            product_id=product_id,
            type="order",
            quantity=-quantity,
            reference_type="order",
            reference_id=order_id
        )
        db.add(movement)
        return True

    def release_stock(self, db: Session, product_id: int, variant_id: Optional[int], quantity: int, order_id: int) -> bool:
        inv = self._get_or_create_inventory(db, product_id, variant_id)
        
        inv.reserved_quantity = max(0, inv.reserved_quantity - quantity)
        
        # Synchronize catalog product columns
        prod = db.query(Product).filter(Product.id == product_id).first()
        if prod:
            prod.committed = inv.reserved_quantity
            prod.available = max(0, prod.stock_quantity - inv.reserved_quantity)
        
        movement = StockMovement(
            product_id=product_id,
            type="return",
            quantity=quantity,
            reference_type="order",
            reference_id=order_id
        )
        db.add(movement)
        return True

    def finalize_stock(self, db: Session, product_id: int, variant_id: Optional[int], quantity: int, order_id: int) -> bool:
        inv = self._get_or_create_inventory(db, product_id, variant_id)
        
        inv.stock_quantity = max(0, inv.stock_quantity - quantity)
        inv.reserved_quantity = max(0, inv.reserved_quantity - quantity)
        
        # Synchronize catalog product tables
        if variant_id:
            var = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
            if var:
                var.stock = inv.stock_quantity
        
        # Always sync parent product's inventory counters
        prod = db.query(Product).filter(Product.id == product_id).first()
        if prod:
            prod.onhand_old = prod.stock_quantity
            if not variant_id:
                prod.stock_quantity = inv.stock_quantity
            prod.onhand_new = prod.stock_quantity
            prod.committed = inv.reserved_quantity
            prod.available = max(0, prod.stock_quantity - inv.reserved_quantity)
                
        return True

    def update_stock(self, db: Session, product_id: int, variant_id: Optional[int], new_quantity: int) -> Inventory:
        inv = self._get_or_create_inventory(db, product_id, variant_id)
        diff = new_quantity - inv.stock_quantity
        inv.stock_quantity = new_quantity
        
        movement = StockMovement(
            product_id=product_id,
            type="adjustment",
            quantity=diff,
            reference_type="manual"
        )
        db.add(movement)
        
        # Sync with catalog tables
        if variant_id:
            var = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
            if var:
                var.stock = new_quantity
        
        # Always sync parent product's inventory counters
        prod = db.query(Product).filter(Product.id == product_id).first()
        if prod:
            prod.onhand_old = prod.stock_quantity
            if not variant_id:
                prod.stock_quantity = new_quantity
            prod.onhand_new = prod.stock_quantity
            prod.committed = inv.reserved_quantity
            prod.available = max(0, prod.stock_quantity - inv.reserved_quantity)

        db.commit()
        db.refresh(inv)
        return inv


inventory_service = InventoryService()
