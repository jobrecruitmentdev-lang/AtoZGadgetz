import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.config.settings import settings

logger = logging.getLogger("app")


class EmailService:
    def _send_email_raw(self, to_email: str, subject: str, html_content: str) -> bool:
        """
        Low-level SMTP sender with mock console fallback.
        """
        # If no host or mock local
        if not settings.SMTP_HOST or (settings.SMTP_HOST in ["localhost", "127.0.0.1"] and not settings.SMTP_USER):
            logger.info(f"Mocking email send: To={to_email}, Subject={subject}")
            print(f"\n==========================================")
            print(f"MOCK SMTP EMAIL")
            print(f"To: {to_email}")
            print(f"Subject: {subject}")
            print(f"Body snippet:\n{html_content[:500]}...")
            print(f"==========================================\n")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM or "noreply@atozgadgets.com"
            msg["To"] = to_email

            part = MIMEText(html_content, "html")
            msg.attach(part)

            # Connect and send
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_USER:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            
            server.sendmail(msg["From"], [to_email], msg.as_string())
            server.quit()
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_welcome_email(self, email: str, name: str):
        subject = "Welcome to AtoZ Gadgets ecommerce!"
        html = f"""
        <html>
            <body>
                <h2>Hello {name},</h2>
                <p>Welcome to AtoZ Gadgets! Your account has been registered successfully.</p>
                <p>Start shopping our collections at unbeatable prices.</p>
                <br/>
                <p>Best Regards,</p>
                <p>AtoZ Gadgets Operations Team</p>
            </body>
        </html>
        """
        return self._send_email_raw(email, subject, html)

    def send_password_reset_email(self, email: str, reset_link: str):
        subject = "Password Reset Request - AtoZ Gadgets"
        html = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. Click the link below to verify and update it:</p>
                <a href="{reset_link}">{reset_link}</a>
                <p>If you did not request this, please ignore this email.</p>
                <br/>
                <p>Thank you,</p>
                <p>AtoZ Gadgets Security Team</p>
            </body>
        </html>
        """
        return self._send_email_raw(email, subject, html)

    def send_order_confirmation_email(self, email: str, order_number: str, total_amount: float):
        subject = f"Order Confirmed! - {order_number}"
        html = f"""
        <html>
            <body>
                <h2>Thank you for your order!</h2>
                <p>Your order <strong>{order_number}</strong> has been received and is being processed.</p>
                <p>Total amount paid/due: <strong>INR {total_amount:.2f}</strong></p>
                <p>We will notify you once your package is handed over to the courier.</p>
                <br/>
                <p>Best regards,</p>
                <p>AtoZ Gadgets Team</p>
            </body>
        </html>
        """
        return self._send_email_raw(email, subject, html)

    def send_payment_success_email(self, email: str, transaction_id: str, amount: float):
        subject = "Payment Successful - AtoZ Gadgets"
        html = f"""
        <html>
            <body>
                <h2>Payment Successful Confirmation</h2>
                <p>We have successfully processed your payment.</p>
                <p>Transaction ID: <strong>{transaction_id}</strong></p>
                <p>Amount: <strong>INR {amount:.2f}</strong></p>
                <br/>
                <p>Thank you for shopping with us!</p>
                <p>AtoZ Gadgets billing department</p>
            </body>
        </html>
        """
        return self._send_email_raw(email, subject, html)


email_service = EmailService()
