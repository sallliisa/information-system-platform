# Model Creation Guide

## Overview

This guide documents the standardized process for creating new data models in the HKA TROM Frontend application. Following these steps ensures consistency across the codebase and proper integration with the BaseCRUD component system.

## Prerequisites

- Understanding of Vue 3 with TypeScript
- Familiarity with the BaseCRUDConfig type
- Knowledge of the application's menu structure
- Access to the following directories:
  - `src/app/configs/` - Model configuration files
  - `src/views/authenticated/` - View components
  - `src/menu.ts` - Application menu configuration

## Step-by-Step Process

### Step 1: Create the Model Config File

**Location:** `src/app/configs/{model-name}.ts`

**Purpose:** Define the data model structure, fields, aliases, and CRUD operations.

**Template:**

```typescript
export default {
  name: '{model-name}',
  uid: '{unique-identifier-field}',
  fields: ['{field1}', '{field2}', '{field3}'],
  actions: {
    create: true,  // or false if not allowed
    delete: true,  // or false if not allowed
    update: true   // or false if not allowed
  },
  fieldsType: {
    // Define special field types here
    '{field-name}': {
      type: 'object-array',  // or other types like 'text', 'image', etc.
      props: {
        view: '{display-field}',
      }
    }
  },
  fieldsAlias: {
    // Map field names to display labels (typically in Indonesian)
    '{field-name}': 'Display Label',
    '{uid}': 'Unique Identifier Label',
  },
} as BaseCRUDConfig
```

**Key Considerations:**

- `name`: Use kebab-case (e.g., `config-verificators`, `asset-locations`)
- `uid`: The unique identifier field for the model (e.g., `id`, `act_id`)
- `fields`: Array of field names to display in the CRUD interface
- `actions`: Control which CRUD operations are available
- `fieldsType`: Define complex field types (object-array, image, etc.)
- `fieldsAlias`: Provide user-friendly labels for all fields

**Example from codebase:**

```typescript
// src/app/configs/config-verificators.ts
export default {
  name: 'config-verificators',
  uid: "act_id",
  fields: ['activity_name', 'verificators', 'section_type_name'],
  actions: {
    create: false,
    delete: false,
    update: false
  },
  fieldsType: {
    verificators: {
      type: 'object-array',
      props: {
        view: 'job_position_name',
      }
    }
  },
  fieldsAlias: {
    activity_name: 'Nama Aktivitas',
    section_type_name: "Jenis Ruas",
    act_id: 'Aktivitas',
    verificators: 'Verifikator',
    section_type_id: 'Jenis Ruas',
    job_position_id: 'Jabatan'
  },
} as BaseCRUDConfig
```

---

### Step 2: Add Menu Entry

**Location:** `src/menu.ts`

**Purpose:** Register the model in the application's navigation menu.

**Process:**

1. Identify the appropriate menu section (e.g., `master`, `form-config`, `operation`, `hr`, `users`)
2. Add a new route entry within that section's `routes` array
3. Use the model name as the `name` property
4. Provide a user-friendly `title` for display

**Template:**

```typescript
{
  name: '{model-name}',
  title: 'Display Title',
  icon: 'folder',  // or appropriate icon
}
```

**Example from codebase:**

```typescript
// In src/menu.ts, within the 'form-config' section
{
  separator: true,
  name: 'Verifikasi'
},
{
  name: 'config-verificators',
  title: 'Konfigurasi Verifikasi',
  icon: 'folder',
}
```

**Menu Sections Reference:**

- `dashboard` - Dashboard views
- `master` - Master data (reference data)
- `form-config` - Form configurations
- `emergency` - Emergency management
- `operation` - Operational transactions
- `hr` - HR activities
- `users` - User and role management

---

### Step 3: Create the View Component

**Location:** `src/views/authenticated/{section}/{model-name}/{model-name}.vue`

**Purpose:** Create the Vue component that displays the model using BaseCRUD.

**Directory Structure:**

```
src/views/authenticated/
├── {section}/
│   └── {model-name}/
│       ├── {model-name}.vue          (main component)
│       └── _layouts/                 (optional, for detail views)
│           └── {ModelName}DetailMain.vue
```

**Template:**

```vue
<script setup lang="ts">
import {modelName} from '@/app/configs/{model-name}';
import BaseCRUD from '@/components/composites/BaseCRUD.vue';
</script>

<template>
  <BaseCRUD :config="{modelName}"/>
</template>
```

**Example from codebase:**

```vue
<!-- src/views/authenticated/form-config/config-verificators/config-verificators.vue -->
<script setup lang="ts">
import configVerificators from '@/app/configs/config-verificators';
import Tabs from '@/components/base/Tabs.vue';
import BaseCRUD from '@/components/composites/BaseCRUD.vue';
import services from '@/utils/services';
import { ref } from 'vue';
import ConfigVerificatorsDetailMain from './_layouts/ConfigVerificatorsDetailMain.vue';
import { keyManager } from '@/stores/keyManager';

const sectionTypes = [{name: 'Semua', id: ''}, ...(await services.dataset('section-types', {limit: 1000})).data];
const activeTabIndex = ref()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div :class="!$route.query[`${configVerificators.name}_view`] || $route.query[`${configVerificators.name}_view`] == 'list' ? '' : 'hidden'">
      <Tabs v-model="activeTabIndex" :config="sectionTypes"/>
    </div>
    <BaseCRUD
      v-if="activeTabIndex != null"
      :key="activeTabIndex"
      :config="{
        ...configVerificators,
        list: {
          ...configVerificators.list,
          getQueryParameters: {section_type_id: sectionTypes[activeTabIndex].id}
        }
      }"
    >
      <template #list-rowActions="{data}">
        <!-- Optional: Add custom row actions here -->
      </template>
    </BaseCRUD>
  </div>
</template>
```

**Key Considerations:**

- Import the config from `@/app/configs/{model-name}`
- Import `BaseCRUD` from `@/components/composites/BaseCRUD.vue`
- Pass the config as a prop to BaseCRUD
- Use kebab-case for the filename (e.g., `config-verificators.vue`)
- Match the directory structure to the menu hierarchy

**Optional Enhancements:**

- Add tabs for filtering (see `config-verificators.vue` example)
- Add custom row actions using `#list-rowActions` slot
- Add detail view layouts in `_layouts/` subdirectory
- Add nested CRUD operations using `#detail-under` slot

---

### Step 4: Verify Router Configuration

**Location:** Router configuration (typically auto-generated or in `src/router/`)

**Purpose:** Ensure the route is properly registered.

**Note:** In many modern Vue applications with file-based routing, this step may be automatic. Verify that:

1. The component path matches the menu name
2. The route is accessible via the menu navigation
3. The component loads without errors

---

## Naming Conventions

### File Names

- **Config files:** kebab-case (e.g., `config-verificators.ts`)
- **Vue components:** kebab-case (e.g., `config-verificators.vue`)
- **Directories:** kebab-case (e.g., `config-verificators/`)

### TypeScript/JavaScript

- **Config object name:** camelCase (e.g., `configVerificators`)
- **Model name property:** kebab-case (e.g., `'config-verificators'`)
- **Field names:** snake_case (e.g., `activity_name`, `section_type_id`)

### Display Labels (fieldsAlias)

- Use Indonesian language for user-facing labels
- Use PascalCase for proper nouns
- Be descriptive and clear

---

## BaseCRUDConfig Type Reference

```typescript
interface BaseCRUDConfig {
  name: string;                    // Unique model identifier (kebab-case)
  uid: string;                     // Unique identifier field name
  fields: string[];                // Array of field names to display
  actions?: {
    create?: boolean;              // Allow create operations
    delete?: boolean;              // Allow delete operations
    update?: boolean;              // Allow update operations
  };
  fieldsType?: {
    [fieldName: string]: {
      type: string;                // Field type (text, image, object-array, etc.)
      props?: Record<string, any>;  // Field-specific properties
    };
  };
  fieldsAlias?: {
    [fieldName: string]: string;   // Display labels for fields
  };
  list?: {
    getQueryParameters?: Record<string, any>;  // Query params for list API
  };
  create?: {
    postAdditionalData?: Record<string, any>;  // Additional data for create
  };
  // ... other optional properties
}
```

---

## Common Patterns

### Pattern 1: Simple CRUD Model

```typescript
// Config
export default {
  name: 'vehicles',
  uid: 'id',
  fields: ['name', 'type', 'brand'],
  actions: { create: true, delete: true, update: true },
  fieldsAlias: {
    id: 'ID',
    name: 'Nama Kendaraan',
    type: 'Tipe',
    brand: 'Merk'
  }
} as BaseCRUDConfig
```

```vue
<!-- View -->
<script setup lang="ts">
import vehicles from '@/app/configs/vehicles';
import BaseCRUD from '@/components/composites/BaseCRUD.vue';
</script>

<template>
  <BaseCRUD :config="vehicles"/>
</template>
```

### Pattern 2: Read-Only Model with Tabs

```typescript
// Config
export default {
  name: 'config-verificators',
  uid: 'act_id',
  fields: ['activity_name', 'verificators'],
  actions: { create: false, delete: false, update: false },
  fieldsAlias: {
    activity_name: 'Nama Aktivitas',
    verificators: 'Verifikator'
  }
} as BaseCRUDConfig
```

```vue
<!-- View with tabs -->
<script setup lang="ts">
import configVerificators from '@/app/configs/config-verificators';
import Tabs from '@/components/base/Tabs.vue';
import BaseCRUD from '@/components/composites/BaseCRUD.vue';
import { ref } from 'vue';

const tabs = [{name: 'All', id: ''}, ...otherTabs];
const activeTabIndex = ref();
</script>

<template>
  <div class="flex flex-col gap-4">
    <Tabs v-model="activeTabIndex" :config="tabs"/>
    <BaseCRUD
      v-if="activeTabIndex != null"
      :config="{
        ...configVerificators,
        list: {
          getQueryParameters: {tab_id: tabs[activeTabIndex].id}
        }
      }"
    />
  </div>
</template>
```

### Pattern 3: Nested CRUD (Parent-Child Relationship)

```vue
<!-- View with nested CRUD -->
<script setup lang="ts">
import parentConfig from '@/app/configs/parent';
import childConfig from '@/app/configs/child';
import BaseCRUD from '@/components/composites/BaseCRUD.vue';
</script>

<template>
  <BaseCRUD :config="parentConfig">
    <template #detail-under="{data}">
      <BaseCRUD
        :config="{
          ...childConfig,
          list: {
            getQueryParameters: {parent_id: data.id}
          },
          create: {
            postAdditionalData: {parent_id: data.id}
          }
        }"
      />
    </template>
  </BaseCRUD>
</template>
```

---

## Checklist for New Model Creation

- [ ] **Step 1:** Create config file in `src/app/configs/{model-name}.ts`
  - [ ] Define `name` (kebab-case)
  - [ ] Define `uid` (unique identifier field)
  - [ ] Define `fields` array
  - [ ] Define `actions` object
  - [ ] Define `fieldsType` for complex fields
  - [ ] Define `fieldsAlias` with display labels
  - [ ] Export as `BaseCRUDConfig`

- [ ] **Step 2:** Add menu entry in `src/menu.ts`
  - [ ] Choose appropriate section
  - [ ] Add route entry with `name`, `title`, and `icon`
  - [ ] Verify menu structure

- [ ] **Step 3:** Create view component
  - [ ] Create directory: `src/views/authenticated/{section}/{model-name}/`
  - [ ] Create `{model-name}.vue` file
  - [ ] Import config and BaseCRUD
  - [ ] Pass config to BaseCRUD component
  - [ ] Test component loads correctly

- [ ] **Step 4:** Verify integration
  - [ ] Menu item appears in navigation
  - [ ] Route is accessible
  - [ ] Component renders without errors
  - [ ] CRUD operations work as expected

---

## Troubleshooting

### Issue: Component not appearing in menu

**Solution:** Verify that:
1. Menu entry name matches the route name
2. Menu entry is in the correct section
3. Menu file is saved and reloaded

### Issue: BaseCRUD not rendering data

**Solution:** Check that:
1. Config `name` property is correct
2. API endpoints are accessible
3. `uid` field exists in the data
4. `fields` array contains valid field names

### Issue: Fields not displaying correctly

**Solution:** Verify:
1. Field names in `fields` array match API response
2. `fieldsAlias` has entries for all fields
3. `fieldsType` is correctly configured for special types

### Issue: CRUD operations not working

**Solution:** Check:
1. `actions` object has correct boolean values
2. API endpoints support the operations
3. User has appropriate permissions

---

## Related Files

- **BaseCRUD Component:** `src/components/composites/BaseCRUD.vue`
- **Form Component:** `src/components/composites/Form.vue`
- **Type Definitions:** `src/types/index.d.ts`
- **Menu Configuration:** `src/menu.ts`
- **Config Examples:** `src/app/configs/`

---

## Additional Resources

- Vue 3 Documentation: https://vuejs.org/
- TypeScript Documentation: https://www.typescriptlang.org/
- Application Architecture: See project README.md

---

**Last Updated:** December 3, 2025
**Version:** 1.0
