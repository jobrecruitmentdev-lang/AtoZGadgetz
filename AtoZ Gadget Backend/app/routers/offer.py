from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_permission
from app.models.offer import Offer
from app.schemas.offer_schema import OfferCreate, OfferResponse
from app.services.offer_service import offer_service
from app.services.audit_service import audit_service

router = APIRouter(
    tags=["Campaign & Offer Engine"]
)


def serialize_offer(offer: Offer) -> dict:
    data = OfferResponse.model_validate(offer).model_dump()
    data["product_ids"] = [p.product_id for p in offer.products]
    data["category_ids"] = [c.category_id for c in offer.categories]
    return data


@router.post("/api/admin/offers", status_code=status.HTTP_201_CREATED)
def admin_create_offer(
    req: OfferCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("offer.manage"))
):
    offer = offer_service.create_offer(db, req)
    
    serialized = serialize_offer(offer)
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Offer",
        action="Create",
        description=f"Campaign offer '{req.name}' created",
        new_data=serialized
    )

    return {
        "success": True,
        "message": "Campaign offer created successfully",
        "data": serialized
    }


@router.get("/api/offers")
def get_all_offers(db: Session = Depends(get_db)):
    offers = db.query(Offer).options(
        joinedload(Offer.products),
        joinedload(Offer.categories)
    ).all()

    return {
        "success": True,
        "message": "Campaign offers retrieved successfully",
        "data": [serialize_offer(o) for o in offers]
    }


@router.put("/api/admin/offers/{id}")
def admin_update_offer(
    id: int,
    req: OfferCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("offer.manage"))
):
    db_offer = db.query(Offer).options(
        joinedload(Offer.products),
        joinedload(Offer.categories)
    ).filter(Offer.id == id).first()

    if not db_offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign offer not found"
        )

    old_serialized = serialize_offer(db_offer)
    
    updated = offer_service.update_offer(db, id, req)
    
    new_serialized = serialize_offer(updated)
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Offer",
        action="Update",
        description=f"Campaign offer '{updated.name}' updated",
        old_data=old_serialized,
        new_data=new_serialized
    )

    return {
        "success": True,
        "message": "Campaign offer updated successfully",
        "data": new_serialized
    }


@router.delete("/api/admin/offers/{id}")
def admin_delete_offer(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("offer.manage"))
):
    db_offer = db.query(Offer).options(
        joinedload(Offer.products),
        joinedload(Offer.categories)
    ).filter(Offer.id == id).first()

    if not db_offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign offer not found"
        )

    old_serialized = serialize_offer(db_offer)
    
    offer_service.delete_offer(db, id)

    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Offer",
        action="Delete",
        description=f"Campaign offer '{db_offer.name}' deleted",
        old_data=old_serialized
    )

    return {
        "success": True,
        "message": "Campaign offer deleted successfully",
        "data": {}
    }
