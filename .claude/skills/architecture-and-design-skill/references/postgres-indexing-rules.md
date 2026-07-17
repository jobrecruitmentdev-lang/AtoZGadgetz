# Indexing, Partitioning, and Normalization Standards
- Always index foreign keys to speed up joins.
- Create composite indexes for queries heavily filtering on multiple columns.
- Use unique indexes for identifying fields (e.g., email, slug).
- Partition large tables (e.g., order_history, audit_logs) by date range if row counts are expected to scale rapidly.
