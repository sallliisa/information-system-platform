# Model Creation Guide

Quick reference for creating data models in the HKA TROM Frontend application.

## Files

- **MODEL_CREATION_GUIDE.md** - Step-by-step process (4 steps)
- **QUICK_REFERENCE.md** - Decision tree and patterns (use this for quick lookup)

## Quick Start

1. Analyze request body → identify fields and types
2. Check existing configs for similar patterns
3. Create config file with proper structure
4. Create view component
5. Add menu entry
6. Test CRUD operations

## Key Points

- Field names are semantic (`_id` = lookup, `_date` = date, `length` = number)
- Always provide fieldsAlias (display labels in Indonesian)
- Group related fields into logical form sections
- Use fieldsProxy to map API response fields
- Check existing configs first for patterns

See **QUICK_REFERENCE.md** for decision tree and common patterns.
