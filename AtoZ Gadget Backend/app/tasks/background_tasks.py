import os
import time
import logging
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.services.email_service import email_service
from app.models.notification import Notification

logger = logging.getLogger("app")


def bg_send_welcome_email(email: str, name: str):
    logger.info(f"Background task: Sending welcome email to {email}")
    email_service.send_welcome_email(email, name)


def bg_send_password_reset_email(email: str, reset_link: str):
    logger.info(f"Background task: Sending password reset email to {email}")
    email_service.send_password_reset_email(email, reset_link)


def bg_send_order_confirmation(email: str, order_number: str, total_amount: float):
    logger.info(f"Background task: Sending order confirmation for {order_number} to {email}")
    email_service.send_order_confirmation_email(email, order_number, total_amount)


def bg_send_payment_success(email: str, transaction_id: str, amount: float):
    logger.info(f"Background task: Sending payment success for {transaction_id} to {email}")
    email_service.send_payment_success_email(email, transaction_id, amount)


def bg_process_uploaded_image(file_path: str):
    """
    Simulates image downscaling and thumbnail generation.
    """
    logger.info(f"Background task: Starting image processing/optimization for {file_path}")
    time.sleep(2)  # Simulate computing time
    
    # Try importing PIL to resize if available
    try:
        from PIL import Image
        physical_path = os.path.join("app", file_path)
        if os.path.exists(physical_path):
            img = Image.open(physical_path)
            # Create a thumbnail
            img.thumbnail((300, 300))
            thumb_path = os.path.splitext(physical_path)[0] + "_thumb" + os.path.splitext(physical_path)[1]
            img.save(thumb_path)
            logger.info(f"Background task: Successfully generated thumbnail at {thumb_path}")
    except ImportError:
        logger.info("Background task: Pillow is not installed, image downscaling simulated without files edits.")
    except Exception as e:
        logger.error(f"Background task: Pillow process error: {str(e)}")


def bg_generate_sales_report(user_id: int, start_date: str, end_date: str):
    """
    Simulates gathering database analytics, formatting to CSV, and notifying user.
    """
    logger.info(f"Background task: Generating sales report for User {user_id}")
    time.sleep(3)  # Simulate report gathering duration

    db: Session = SessionLocal()
    try:
        # Create a notification in DB when completed
        notif = Notification(
            user_id=user_id,
            title="Sales Report Generated",
            message=f"Your sales report from {start_date} to {end_date} has been successfully generated and compiled.",
            type="system",
            is_read=False
        )
        db.add(notif)
        db.commit()
        logger.info(f"Background task: Sales report notification created for user {user_id}")
    except Exception as e:
        logger.error(f"Background task: Failed to create report notification: {str(e)}")
    finally:
        db.close()
