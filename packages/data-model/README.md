# @client/data-model

Client-owned model definitions package.

## Structure

```txt
src/models/
  base/
  web/
  mobile/
```

## Base model

```ts
import type { ModelConfig } from '@southneuhof/is-data-model'

const users = {
  name: 'users',
  title: 'Users',
} satisfies ModelConfig

export default users
```

## Re-export for platform

```ts
export { default } from '../base/users.model'
```

## Manual override for platform

```ts
import users from '../base/users.model'

export default {
  ...users,
  title: 'Web Users',
}
```

## App imports

```ts
import users from '@client/data-model/models/web/users.model'
import usersMobile from '@client/data-model/models/mobile/users.model'
```
