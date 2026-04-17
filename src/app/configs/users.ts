export default {
  name: 'users',
  title: 'Users',
  fields: ['fullname', 'gender', 'username', 'password', 'role_id', 'email', 'login_method', 'department_id', 'telephone', 'institution', 'img_photo_user', 'status_code'],
  fieldsAlias: {
    fullname: 'Nama Lengkap',
    gender: 'Jenis Kelamin',
    username: 'Username',
    password: 'Password',
    role_id: 'Role',
    email: 'Email',
    login_method: 'Tipe Akun',
    default_project_id: 'Proyek/Biro',
    department_id: 'Unit Kerja',
    default_department_id: 'Unit Kerja',
    telephone: 'Telepon',
    institution: 'Institusi',
    img_photo_user: 'Foto',
    status_code: 'Status',
  },
  view: {
    list: {
      fields: ['img_photo_user', 'fullname', 'gender', 'username', 'role_id', 'email', 'login_method', 'department_id', 'institution', 'status_code'],
      filter: {
        fields: ['status_code', 'department_id', 'role_id'],
        inputConfig: {
          department_id: {
            type: 'lookup',
            props: {
              getAPI: 'departments',
            },
          },
          role_id: { type: 'select', props: { getAPI: 'roles', view: 'role_name' } },
          status_code: {
            type: 'radio',
            props: {
              validation: ['required'],
              data: [
                { id: 'user_active', name: 'Aktif' },
                { id: 'user_inactive', name: 'Nonaktif' },
                // { id: 'user_rejected', name: 'Ditolak' },
              ],
            },
          },
        },
      },
    },
    fieldsDictionary: {
      gender: {
        L: 'Laki-Laki',
        P: 'Perempuan',
      },
      login_method: {
        local: 'Non-SSO',
        sso: 'SSO',
      },
    },
    fieldsProxy: {
      role_id: 'rel_role_id',
      department_id: 'rel_department_id',
    },
    fieldsType: {
      img_photo_user: {
        type: 'image',
      },
      status_code: {
        type: 'chip',
        props: {
          options: {
            user_active: { color: 'success', label: 'Aktif' },
            user_inactive: { color: 'error', label: 'Nonaktif' },
            // user_rejected: { color: 'error', label: 'Ditolak' },
          },
        },
      },
    },
    detail: {
      fields: ['fullname', 'gender', 'username', 'role_id', 'email', 'login_method', 'department_id', 'telephone', 'institution', 'img_photo_user', 'status_code'],
    },
  },
  transaction: {
    fields: ['fullname', 'gender', 'login_method', 'username', 'password', 'role_id', 'email', 'department_id', 'telephone', 'institution', 'img_photo_user', 'status_code'],
    inputConfig: {
      fullname: { type: 'text', props: { validation: ['required'] } },
      username: {
        type: 'text',
        props: { validation: ['required'] },
        dependency: {
          fields: ['login_method'],
          visibility: {
            validator: ({ login_method }: any) => login_method == null || login_method === 'local',
            default: true,
          },
        },
      },
      password: {
        type: 'password',
        props: { validation: ['required'], minLength: 6 },
        dependency: {
          fields: ['login_method'],
          visibility: {
            validator: ({ login_method }: any) => login_method == null || login_method === 'local',
            default: true,
          },
        },
      },
      gender: {
        type: 'radio',
        props: {
          validation: ['required'],
          defaultValue: true,
          data: [
            { name: 'Laki-Laki', id: 'L' },
            { name: 'Perempuan', id: 'P' },
          ],
        },
      },
      email: { type: 'text', props: { validation: ['required'] } },
      login_method: {
        type: 'radio',
        props: {
          validation: ['required'],
          defaultValue: 'local',
          data: [
            { id: 'local', name: 'Non-SSO' },
            { id: 'sso', name: 'SSO' },
          ],
        },
      },
      department_id: { type: 'lookup', props: { validation: ['required'], getAPI: 'departments', view: 'name' } },
      role_id: { type: 'select', props: { validation: ['required'], getAPI: 'roles', view: 'role_name' } },
      institution: { type: 'text', props: { validation: ['required'] } },
      img_photo_user: { type: 'image', props: {} },
      status_code: {
        type: 'radio',
        props: {
          validation: ['required'],
          data: [
            { id: 'user_active', name: 'Aktif' },
            { id: 'user_inactive', name: 'Nonaktif' },
          ],
        },
      },
    },
    update: {
      fields: ['fullname', 'gender', 'login_method', 'username', 'role_id', 'email', 'department_id', 'telephone', 'institution', 'img_photo_user', 'status_code'],
      inputConfig: {
        fullname: { type: 'text', props: { validation: ['required'] } },
        username: {
          type: 'text',
          props: { validation: ['required'] },
          dependency: {
            fields: ['login_method'],
            visibility: {
              validator: ({ login_method }: any) => login_method == null || login_method === 'local',
              default: true,
            },
          },
        },
        gender: {
          type: 'radio',
          props: {
            validation: ['required'],
            defaultValue: true,
            data: [
              { name: 'Laki-Laki', id: 'L' },
              { name: 'Perempuan', id: 'P' },
            ],
          },
        },
        email: { type: 'text', props: { validation: ['required'] } },
        login_method: {
          type: 'radio',
          props: {
            validation: ['required'],
            defaultValue: 'local',
            data: [
              { id: 'local', name: 'Non-SSO' },
              { id: 'sso', name: 'SSO' },
            ],
          },
        },
        department_id: { type: 'lookup', props: { validation: ['required'], getAPI: 'departments', view: 'name' } },
        role_id: { type: 'select', props: { validation: ['required'], getAPI: 'roles', view: 'role_name' } },
        institution: { type: 'text', props: { validation: ['required'] } },
        img_photo_user: { type: 'image', props: {} },
        status_code: {
          type: 'radio',
          props: {
            validation: ['required'],
            data: [
              { id: 'user_active', name: 'Aktif' },
              { id: 'user_inactive', name: 'Nonaktif' },
            ],
          },
        },
      },
    },
  },
} as CRUDCompositeConfig
