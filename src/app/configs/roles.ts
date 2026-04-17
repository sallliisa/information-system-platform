export default {
  name: 'roles',
  title: 'Roles',
  fieldsAlias: {
    role_name: 'Nama',
    role_code: 'Kode',
    role_scope_id: 'Role Scope',
  },
  transaction: {
    fields: ['role_name', 'role_code', 'role_scope_id', 'description'],
    inputConfig: {
      role_name: { type: 'text', props: { validation: ['required'] } },
      role_code: { type: 'text', props: { validation: ['required'] } },
      role_scope_id: { type: 'select', props: { validation: ['required'], getAPI: 'role-scopes' } },
      description: { type: 'textarea' },
    },
  },
  view: {
    list: {
      filter: {
        fields: ['active'],
      },
    },
    fields: ['role_name', 'role_code', 'role_scope_id', 'description', 'active', 'created_at', 'updated_at'],
    fieldsProxy: {
      role_scope_id: 'rel_role_scope_id',
    },
  },
} as CRUDCompositeConfig
