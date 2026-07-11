from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from app.models.offer import Offer, OfferProduct, OfferCategory
from app.schemas.offer_schema import OfferCreate


class OfferService:
    def create_offer(self, db: Session, req: OfferCreate) -> Offer:
        db_offer = Offer(
            name=req.name,
            description=req.description,
            offer_type=req.offer_type,
            discount_type=req.discount_type,
            discount_value=req.discount_value,
            minimum_order_amount=req.minimum_order_amount,
            maximum_discount=req.maximum_discount,
            start_date=req.start_date,
            end_date=req.end_date,
            status=req.status or "active"
        )
        db.add(db_offer)
        db.commit()
        db.refresh(db_offer)

        # Link product targets if Product offer
        if req.offer_type == "Product" and req.product_ids:
            for p_id in req.product_ids:
                db.add(OfferProduct(offer_id=db_offer.id, product_id=p_id))

        # Link category targets if Category offer
        if req.offer_type == "Category" and req.category_ids:
            for c_id in req.category_ids:
                db.add(OfferCategory(offer_id=db_offer.id, category_id=c_id))

        db.commit()
        db.refresh(db_offer)
        return db_offer

    def update_offer(self, db: Session, offer_id: int, req: OfferCreate) -> Offer:
        db_offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not db_offer:
            return None

        db_offer.name = req.name
        db_offer.description = req.description
        db_offer.offer_type = req.offer_type
        db_offer.discount_type = req.discount_type
        db_offer.discount_value = req.discount_value
        db_offer.minimum_order_amount = req.minimum_order_amount
        db_offer.maximum_discount = req.maximum_discount
        db_offer.start_date = req.start_date
        db_offer.end_date = req.end_date
        db_offer.status = req.status or "active"

        # Re-link product and category mappings (delete old, insert new)
        db.query(OfferProduct).filter(OfferProduct.offer_id == offer_id).delete()
        db.query(OfferCategory).filter(OfferCategory.offer_id == offer_id).delete()

        if req.offer_type == "Product" and req.product_ids:
            for p_id in req.product_ids:
                db.add(OfferProduct(offer_id=offer_id, product_id=p_id))

        if req.offer_type == "Category" and req.category_ids:
            for c_id in req.category_ids:
                db.add(OfferCategory(offer_id=offer_id, category_id=c_id))

        db.commit()
        db.refresh(db_offer)
        return db_offer

    def delete_offer(self, db: Session, offer_id: int) -> bool:
        db_offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not db_offer:
            return False
        db.delete(db_offer)
        db.commit()
        return True

    def calculate_discounts(self, db: Session, items: List[any], subtotal: Decimal) -> dict:
        """
        Calculate discounts for items inside the cart using active offers.
        Each item is expected to have 'product_id', 'quantity', 'price', and 'product' (with category_id).
        """
        now = datetime.now()
        active_offers = db.query(Offer).options(
            joinedload(Offer.products),
            joinedload(Offer.categories)
        ).filter(
            Offer.status == "active",
            Offer.start_date <= now,
            Offer.end_date >= now
        ).all()

        total_item_discount = Decimal("0.00")
        applied_offer_names = []

        # 1. Evaluate Item-Level Offers (Product and Category Offers)
        # We compute discounts for matching items
        for offer in active_offers:
            if offer.offer_type == "Product":
                prod_ids = {op.product_id for op in offer.products}
                for item in items:
                    p_id = getattr(item, "product_id", None)
                    qty = getattr(item, "quantity", 1)
                    price = getattr(item, "price", Decimal("0.00"))
                    
                    if p_id in prod_ids:
                        item_total = price * qty
                        if offer.discount_type == "Percentage":
                            disc = item_total * (offer.discount_value / Decimal("100.00"))
                        else:  # Flat
                            # Flat discount per quantity unit or flat on overall matching items
                            disc = offer.discount_value * qty
                        
                        # Apply cap if present
                        if offer.maximum_discount and disc > offer.maximum_discount:
                            disc = offer.maximum_discount

                        total_item_discount += disc
                        applied_offer_names.append(offer.name)

            elif offer.offer_type == "Category":
                cat_ids = {oc.category_id for oc in offer.categories}
                for item in items:
                    qty = getattr(item, "quantity", 1)
                    price = getattr(item, "price", Decimal("0.00"))
                    prod = getattr(item, "product", None)
                    c_id = getattr(prod, "category_id", None) if prod else None

                    if c_id in cat_ids:
                        item_total = price * qty
                        if offer.discount_type == "Percentage":
                            disc = item_total * (offer.discount_value / Decimal("100.00"))
                        else:  # Flat
                            disc = offer.discount_value * qty

                        if offer.maximum_discount and disc > offer.maximum_discount:
                            disc = offer.maximum_discount

                        total_item_discount += disc
                        applied_offer_names.append(offer.name)

        # 2. Evaluate Cart-Level/Festival Offers
        total_cart_discount = Decimal("0.00")
        remaining_subtotal = subtotal - total_item_discount

        for offer in active_offers:
            if offer.offer_type in ["Cart", "Festival"]:
                if remaining_subtotal >= offer.minimum_order_amount:
                    if offer.discount_type == "Percentage":
                        disc = remaining_subtotal * (offer.discount_value / Decimal("100.00"))
                    else:  # Flat
                        disc = offer.discount_value

                    if offer.maximum_discount and disc > offer.maximum_discount:
                        disc = offer.maximum_discount

                    total_cart_discount += disc
                    applied_offer_names.append(offer.name)

        # Ensure discounts do not exceed subtotal
        total_discount = total_item_discount + total_cart_discount
        if total_discount > subtotal:
            total_discount = subtotal

        return {
            "total_offer_discount": total_discount,
            "applied_offers": list(set(applied_offer_names))
        }


offer_service = OfferService()
