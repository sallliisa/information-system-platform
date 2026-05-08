import type {
  DefaultDetailConfig,
  DefaultFormConfig,
  DefaultGlobalConfig,
  DefaultsConfigBundle,
  DefaultTableConfig,
} from './types'
import { z } from 'zod'

export const baseDefaultGlobalConfig: DefaultGlobalConfig = {
  fieldSlots: {},
  fieldsProxy: {
    created_by: 'rel_created_by',
    updated_by: 'rel_updated_by',
  },
  inputConfig: {
    title: { type: 'text', props: { required: true } },
    name: { type: 'text', props: { required: true } },
    fullname: { type: 'text', props: { required: true } },
    username: { type: 'text', props: { required: true } },
    code: { type: 'text', props: { required: true } },
    email: {
      type: 'text',
      props: {
        required: true,
        validation: z.string().email('Format email tidak valid!'),
      },
    },
    telephone: { type: 'text', props: { required: true } },
    description: { type: 'textarea' },
    active: {
      type: 'radio',
      props: {
        required: true,
        defaultValue: true,
        data: [
          { name: 'Aktif', id: true },
          { name: 'Nonaktif', id: false },
        ],
      },
    },
    status_code: {
      type: 'radio',
      props: {
        required: true,
        data: [
          { name: 'Aktif', id: 'active' },
          { name: 'Nonaktif', id: 'non_active' },
          { name: 'Kadaluwarsa', id: 'expired' },
          { name: 'Akan Kadaluwarsa', id: 'expiring_soon' },
        ],
      },
    },
    start_date: { type: 'date' },
    end_date: { type: 'date' },
    year: { type: 'year' },
  },
  fieldsAlias: {
    name: 'Nama',
    code: 'Kode',
    file: 'File',
    description: 'Keterangan',
    active: 'Status',
    created_at: 'Dibuat',
    updated_at: 'Diperbarui Pada',
    updated_by: 'Diperbarui Oleh',
    rel_created_by: 'Dibuat Oleh',
    rel_updated_by: 'Diperbarui Oleh',
    department_id: 'Unit Kerja',
    created_by: 'Dibuat Oleh',
    year: 'Tahun',
    number: 'Nomor',
    section_name: 'Ruas',
    section_id: 'Ruas',
    gate_name: 'Gerbang',
    gate_id: 'Gerbang',
    status_code: 'Status',
    date: 'Tanggal',
    start_date: 'Tanggal Mulai',
    end_date: 'Tanggal Selesai',
    published_at: 'Diterbitkan Pada',
    title: 'Judul',
    start_month: 'Periode Mulai',
    end_month: 'Periode Selesai',
    approval_description: 'Keterangan',
    array_approval_attachment: 'Lampiran',
    verification_description: 'Keterangan',
    array_verification_attachment: 'Lampiran',
    submission_description: 'Keterangan',
    array_submission_attachment: 'Lampiran',
  },
  fieldsParse: {
    created_at: 'datetime',
    updated_at: 'datetime',
    published_at: 'datetime',
    date: 'date',
  },
  fieldsType: {
    approval_description: { type: 'html' },
    verification_description: { type: 'html' },
    submission_description: { type: 'html' },
    array_approval_attachment: { type: 'file' },
    array_verification_attachment: { type: 'file' },
    array_submission_attachment: { type: 'file' },
    active: {
      type: 'chip',
      props: {
        options: {
          true: { color: 'success', label: 'Aktif' },
          false: { color: 'error', label: 'Nonaktif' },
        },
      },
    },
    status_code: {
      type: 'chip',
      props: {
        options: {
          active: { color: 'success', label: 'Aktif' },
          non_active: { color: 'neutral', label: 'Nonaktif' },
          expired: { color: 'error', label: 'Kadaluwarsa' },
          expiring_soon: { color: 'warning', label: 'Akan Kadaluwarsa' },
        },
      },
    },
  },
}

export const baseDefaultTableConfig: DefaultTableConfig = {
  fieldSlots: baseDefaultGlobalConfig.fieldSlots,
  fieldsProxy: baseDefaultGlobalConfig.fieldsProxy,
  fieldsAlias: baseDefaultGlobalConfig.fieldsAlias,
  fieldsType: baseDefaultGlobalConfig.fieldsType,
  fieldsParse: baseDefaultGlobalConfig.fieldsParse,
  fieldsClass: {
    created_at: 'min-w-max whitespace-nowrap',
    updated_at: 'min-w-max whitespace-nowrap',
    published_at: 'min-w-max whitespace-nowrap',
    description: 'line-clamp-3 overflow-ellipsis',
    section_id: 'w-max max-w-sm',
    date: 'w-max max-w-sm',
    asset_id: 'w-max max-w-sm',
    location_id: 'w-max max-w-sm',
  },
  fieldsHeaderClass: {},
  fieldsAlign: {
    status_code: 'center',
    status: 'center',
  },
}

export const baseDefaultDetailConfig: DefaultDetailConfig = {
  fieldSlots: baseDefaultGlobalConfig.fieldSlots,
  fieldsProxy: baseDefaultGlobalConfig.fieldsProxy,
  fieldsAlias: baseDefaultGlobalConfig.fieldsAlias,
  fieldsParse: baseDefaultGlobalConfig.fieldsParse,
  fieldsType: {
    ...baseDefaultGlobalConfig.fieldsType,
    array_clauses: { type: 'array-clauses' },
  },
}

export const baseDefaultFormConfig: DefaultFormConfig = {
  inputConfig: {
    ...baseDefaultGlobalConfig.inputConfig,
    status_code: {
      type: 'radio',
      props: {
        required: true,
        defaultValue: true,
        data: [
          { name: 'Aktif', id: 'active' },
          { name: 'Nonaktif', id: 'non_active' },
        ],
      },
    },
  },
  fieldsAlias: baseDefaultGlobalConfig.fieldsAlias,
}

export const baseDefaultsConfigBundle: DefaultsConfigBundle = {
  global: baseDefaultGlobalConfig,
  table: baseDefaultTableConfig,
  detail: baseDefaultDetailConfig,
  form: baseDefaultFormConfig,
}
