# Model Creation - Quick Reference Guide

## Field Type Decision Tree

When deciding on input type, check field name patterns:

1. **Ends with `_id`?** → Foreign key field

   - **Large dataset** (many records) → `lookup` type (supports multiple display fields)
   - **Small dataset** (handful of options) → `select` type (single display field via `view`)
   - **Very small** (2-3 options) → `radio` type (hardcoded options)

2. **Date field?** (`_date`, `_at`, `created_at`) → `date` type

3. **Measurement?** (`length`, `width`, `height`) → `number` type

4. **Boolean?** (`active`, `enabled`) → `checkbox` type

5. **Fixed options from dataset?**

   - **Very small** (2-3, or even 5 options) → `radio` type
   - **Any other size** → `select` type

6. **Text field?** → `text` or `textarea` type

## Required vs Optional

- **Required:** Mark fields that must be filled (from API docs or null values in examples)
- **Optional:** Everything else (null values in request body = optional)

## Form Organization

Group related fields into logical sections:

1. Basic/Required Information
2. Relationships/References
3. Specific Details
4. Optional/Metadata
5. System Fields (created_at, updated_at - detail view only)

## Display Labels (fieldsAlias)

- Always provide labels for all fields
- Use Indonesian language
- Include units where applicable (e.g., "(m)" for meters)
- Be clear and descriptive

## Lookup vs Select vs Radio

| Type     | Data Size            | Display Fields            | Use Case                    |
| -------- | -------------------- | ------------------------- | --------------------------- |
| `lookup` | Large (many records) | Multiple fields           | Foreign keys, relationships |
| `select` | Small (handful)      | Single field (via `view`) | Small datasets from API     |
| `radio`  | Very small (2-3)     | N/A                       | Hardcoded options           |

**Key Difference:** `lookup` supports displaying multiple fields per row (e.g., section name + code), while `select` only shows one field.

## API Integration

- **fieldsProxy:** Maps form field names to API response field names (e.g., `section_id` → `rel_section_id`)
- **inputConfig:** Specifies input type and API endpoints for lookups/selects
- **getAPI:** The endpoint to fetch data from (e.g., `toll-sections`, `asset-locations`)
- **fields:** (lookup only) Multiple fields to display
- **view:** (select only) Single field to display

## Config Structure

```typescript
{
  name: 'model-name',           // kebab-case
  title: 'Display Title',       // User-friendly title
  list: { fields: [...] },      // What shows in list view
  create: { fields: [...] },    // What shows in create form
  detail: { fields: [...] },    // What shows in detail/edit view
  fieldsAlias: { ... },         // Display labels
  fieldsProxy: { ... },         // API response mapping
  inputConfig: { ... }          // Input type configurations
}
```

## Common Patterns

**Lookup Field (large dataset, multiple display fields):**

```typescript
section_id: {
  type: 'lookup',
  props: { getAPI: 'toll-sections', fields: ['name'] }
}
```

**Select Field (small dataset, single display field):**

```typescript
lane: {
  type: 'select',
  props: { getAPI: 'asset-lanes', view: 'name' }
}
```

**Radio Field (very small dataset, 2-3 options):**

```typescript
track: {
  type: 'radio',
  props: {
    options: [
      {label: 'A', value: 'A'},
      {label: 'B', value: 'B'}
    ]
  }
}
```

**Optional Measurement:**

```typescript
length: {
  type: 'number',
  props: { required: false }
}
```

## Things to Remember

1. **Always check existing configs first** - Similar fields often have established patterns
2. **Field names are semantic** - The name usually indicates the type
3. **Infer from examples** - Null values = optional, marked as required = required
4. **Group logically** - Related fields should be together
5. **Labels matter** - Always provide clear, translated labels
6. **Consistency is key** - Use same patterns across all configs
7. **API endpoints follow naming** - `toll-sections`, `asset-locations`, `asset-types`
8. **fieldsProxy maps responses** - API returns `rel_*` fields, map them to form fields

## File Locations

- **Configs:** `src/app/configs/{model-name}.ts`
- **Views:** `src/views/authenticated/{section}/{model-name}/{model-name}.vue`
- **Menu:** `src/menu.ts`

## View Component Template

```vue
<script setup lang="ts">
import { modelName } from '@/app/configs/{model-name}'
import BaseCRUD from '@/components/composites/BaseCRUD.vue'
</script>

<template>
  <BaseCRUD :config="{ modelName }" />
</template>
```

## Menu Entry Template

```typescript
{
  name: '{model-name}',
  title: 'Display Title',
  icon: 'folder'
}
```

---

**Use this guide as a quick reference when creating new models.**
