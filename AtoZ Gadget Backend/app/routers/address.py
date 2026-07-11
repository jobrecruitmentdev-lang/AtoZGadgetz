from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.address import UserAddress
from app.schemas.address_schema import AddressCreate, AddressUpdate, AddressResponse

router = APIRouter(
    prefix="/api/address",
    tags=["Address Management System"]
)


@router.post("")
def create_address(
    addr_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Check if this is the first address, if so force it to be default
    first_address = db.query(UserAddress).filter(UserAddress.user_id == current_user.id).first()
    is_default = True if not first_address else False

    # Create address
    new_addr = UserAddress(
        user_id=current_user.id,
        full_name=addr_in.full_name,
        mobile=addr_in.mobile,
        address_line1=addr_in.address_line1,
        address_line2=addr_in.address_line2,
        city=addr_in.city,
        state=addr_in.state,
        country=addr_in.country,
        pincode=addr_in.pincode,
        address_type=addr_in.address_type,
        is_default=is_default
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)

    return {
        "success": True,
        "message": "Address created successfully",
        "data": AddressResponse.model_validate(new_addr).model_dump()
    }


@router.get("")
def get_addresses(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    addrs = db.query(UserAddress).filter(UserAddress.user_id == current_user.id).all()
    items = [AddressResponse.model_validate(addr).model_dump() for addr in addrs]
    return {
        "success": True,
        "message": "Addresses retrieved successfully",
        "data": items
    }


@router.put("/{id}")
def update_address(
    id: int,
    addr_in: AddressUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    addr = db.query(UserAddress).filter(
        UserAddress.id == id,
        UserAddress.user_id == current_user.id
    ).first()

    if not addr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )

    update_data = addr_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(addr, field, value)

    db.commit()
    db.refresh(addr)

    return {
        "success": True,
        "message": "Address updated successfully",
        "data": AddressResponse.model_validate(addr).model_dump()
    }


@router.delete("/{id}")
def delete_address(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    addr = db.query(UserAddress).filter(
        UserAddress.id == id,
        UserAddress.user_id == current_user.id
    ).first()

    if not addr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )

    was_default = addr.is_default

    db.delete(addr)
    db.commit()

    # If deleted address was default, make another one default
    if was_default:
        next_addr = db.query(UserAddress).filter(UserAddress.user_id == current_user.id).first()
        if next_addr:
            next_addr.is_default = True
            db.commit()

    return {
        "success": True,
        "message": "Address deleted successfully",
        "data": {}
    }


@router.post("/{id}/default")
def set_default_address(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    addr = db.query(UserAddress).filter(
        UserAddress.id == id,
        UserAddress.user_id == current_user.id
    ).first()

    if not addr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )

    # Set all other addresses for this user to is_default = False
    db.query(UserAddress).filter(
        UserAddress.user_id == current_user.id
    ).update({"is_default": False})

    # Set this one to default
    addr.is_default = True
    db.commit()

    return {
        "success": True,
        "message": "Address set as default successfully",
        "data": {}
    }
