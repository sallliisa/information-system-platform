function translate(str) {
  return str
}

const menu = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    icon: 'home',
    description: 'Pengelolaan pengguna dan hak akses pengguna',
    routes: [
      {
        name: 'dashboard',
        title: 'Dashboard',
        icon: 'home',
      },
    ],
  },
  {
    name: 'data-master',
    title: 'Data Master',
    icon: 'database',
    description: 'Pengelolaan dokumen kontrak yang diikuti',
    routes: [
      {
        name: 'divisions',
        title: translate('division'),
        icon: 'folder',
      },
      {
        name: 'units',
        title: translate('unit'),
        icon: 'folder',
      },
      {
        name: 'projects',
        title: 'Proyek',
        icon: 'folder',
      },
      {
        name: 'owners',
        title: translate('owner'),
        icon: 'folder',
      },
      {
        separator: 'Konfigurasi Form',
      },
      {
        name: 'document-names',
        title: 'Konfigurasi Form',
        icon: 'folder',
      },
      {
        separator: 'General',
      },
      {
        name: 'checklist-documents',
        title: 'Dokumen Umum',
        icon: 'folder',
      },
      {
        name: 'addendum-categories',
        title: 'Kriteria Perubahan Addendum',
        icon: 'folder',
      },
      {
        name: 'kso-types',
        title: `Tipe ${translate('kso')}`,
        icon: 'folder',
      },
      {
        name: 'contract-types',
        title: 'Jenis Kontrak',
        icon: 'folder',
      },
      {
        name: 'project-categories',
        title: 'Kategori Proyek',
        icon: 'folder',
      },
      {
        name: 'risk-categories',
        title: 'Kategori Risiko',
        icon: 'folder',
      },
      {
        name: 'pmos',
        title: `${translate('pmo')} Proyek`,
        icon: 'folder',
      },
      {
        name: 'owner-categories',
        title: 'Kategori Perusahaan',
        icon: 'folder',
      },
      {
        name: 'stakeholder-types',
        title: 'Jenis Stakeholder',
        icon: 'folder',
      },
      {
        name: 'addendum-categories',
        title: 'Potensi/Dampak',
        icon: 'folder',
      },
      {
        name: 'business-sectors',
        title: 'Bidang Usaha',
        icon: 'folder',
      },
      {
        name: 'implementation-base',
        title: 'Landasan Pelaksanaan',
        icon: 'folder',
      },
      {
        name: 'fund-resources',
        title: 'Sumber Dana',
        icon: 'folder',
      },
      {
        name: 'payment-types',
        title: 'Jenis Pembayaran',
        icon: 'folder',
      },
    ],
  },
  {
    name: 'proses-tender',
    title: translate('tender_process'),
    icon: 'folder',
    description: 'Pengelolaan dokumen kontrak yang diikuti',
    routes: [
      {
        name: 'tender-preparation',
        title: 'Persiapan Tender',
        icon: 'folder',
        meta: { step_code: 'TENDER_PREPARATION' },
      },
      {
        separator: translate('tender_process'),
      },
      {
        name: 'tender-n-approval',
        title: 'Tender & Persetujuan Kontrak',
        icon: 'folder',
        meta: { step_code: 'TENDER_N_APPROVAL' },
      },
      {
        name: 'implementation',
        title: 'Pelaksanaan Kontrak',
        icon: 'folder',
        meta: { step_code: 'IMPLEMENTATION' },
      },
      {
        name: 'handover',
        title: 'Serah Terima',
        icon: 'folder',
        meta: { step_code: 'HANDOVER' },
      },
      {
        name: 'closing',
        title: 'Penutupan Kontrak',
        icon: 'folder',
        meta: { step_code: 'CLOSING' },
      },
      {
        separator: 'Download Dokumen',
      },
      {
        name: 'document-downloads',
        title: 'Download Dokumen',
        icon: 'folder',
      },
    ],
  },
  {
    name: 'claim-anticlaim',
    title: 'PPKAK',
    icon: 'folder',
    description: 'Pengelolaan data claim dan anticlaim',
    routes: [
      { separator: 'Change log & VO' },
      {
        name: 'claim-change-log',
        title: 'Change Log',
        icon: 'folder',
      },
      {
        name: 'variation-orders',
        title: 'Variation Order',
        icon: 'folder',
      },
    ],
  },
  {
    name: 'pengaturan',
    title: 'Pengaturan',
    icon: 'settings',
    description: 'Pengelolaan pengguna dan hak akses pengguna',
    routes: [
      {
        separator: 'Pengguna',
      },
      {
        name: 'users',
        title: 'User',
        icon: 'folder',
      },
      {
        name: 'employees',
        title: 'Karyawan',
        icon: 'folder',
      },
      {
        separator: 'Konfigurasi Akses',
      },
      {
        name: 'roles',
        title: 'Roles',
        icon: 'folder',
      },
      {
        name: 'role-groups',
        title: 'Role Group',
        icon: 'folder',
      },
      {
        name: 'tasks',
        title: 'Permissions',
        icon: 'folder',
      },
    ],
  },
  {
    name: 'my-action',
    title: 'My Action',
    icon: 'notifications',
    description: 'Pengelolaan pengguna dan hak akses pengguna',
    routes: [
      {
        name: 'my-action',
        title: 'My Action',
        icon: 'folder',
      },
    ],
  },
]

// const fs = require('fs')
// eslint-disable-next-line no-undef
const fs = require('fs')
menu.forEach((item) => {
  const dir = `./src/views/${item.name}`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
    console.log('MODULE: folder created', dir)
  } else console.log('MODULE: folder exists', dir)
  item.routes.forEach((route) => {
    if (!route.separator) {
      const module = `./src/views/${item.name}/${route.name}`
      if (!fs.existsSync(module)) {
        fs.mkdirSync(module)
        console.log('SUBMODULE: folder created', module)
      } else console.log('SUBMODULE: folder exists', module)
      if (!fs.existsSync(`${module}/${route.name}.vue`)) {
        fs.copyFile('./BASETEMPLATE.txt', `${module}/${route.name}.vue`, (err) => {
          if (err) throw err
          console.log('SUBMODULE: generated vue template to', `${module}/${route.name}.vue`)
        })
      } else console.log('SUBMODULE: vue file already exist')
    }
  })
})
