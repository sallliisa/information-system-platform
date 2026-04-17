<script setup lang="ts">
import Table from '@/components/composites/Table.vue'
import { keyManager } from '@/stores/keyManager'
import SalaryDetail from './_layouts/SalaryDetail.vue'
</script>

<template>
  <Table
    getAPI="salary-history"
    :fields="['rel_section_id', 'rel_job_position_id', 'rel_employment_id', 'rel_payroll_id', 'total_working_days', 'total_earning', 'total_deduction', 'total']"
    :fieldsAlias="{
      rel_section_id: 'Ruas',
      rel_job_position_id: 'Jabatan',
      rel_employment_id: 'Status',
      rel_payroll_id: 'Periode',
      total_working_days: 'Total Hari Kerja',
      total_earning: 'Pemasukan',
      total_deduction: 'Potongan',
      total: 'Total Gaji',
    }"
    :fieldsParse="{
      rel_payroll_id: 'date',
      total_earning: 'currency',
      total_deduction: 'currency',
      total: 'currency',
    }"
    paginated
  >
    <template #list-rowActions="{ data }">
      <Modal>
        <template #trigger>
          <Button color="info" variant="tonal" size="square"><Icon name="information" /></Button>
        </template>
        <template #content>
          <SalaryDetail :data="data" />
        </template>
      </Modal>
    </template>
  </Table>
</template>
