import re


def slugify(text: str) -> str:
    """
    Generates a clean, lower-case, SEO friendly slug from a given string.
    Example: "Wireless Bluetooth Earbuds" -> "wireless-bluetooth-earbuds"
    """
    text = text.lower().strip()
    # Remove all non-word characters except spaces and hyphens
    text = re.sub(r"[^\w\s-]", "", text)
    # Replace spaces and multiple hyphens with a single hyphen
    text = re.sub(r"[\s_-]+", "-", text)
    # Trim leading and trailing hyphens
    text = text.strip("-")
    return text
