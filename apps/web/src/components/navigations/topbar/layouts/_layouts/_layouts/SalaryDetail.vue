<script setup lang="ts">
import Detail from '@southneuhof/is-vue-framework/components/composites/Detail.vue'
import { parse } from '@/utils/filter'
import services from '@/utils/services'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const { data } = await services.detail('salary-history', props.data.id)
</script>

<template>
  <div class="flex flex-col gap-8">
    <p class="text-xl">Detail Penggajian</p>
    <Detail
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
      :data="data"
      :fieldsParse="{
        rel_payroll_id: 'date',
        total_earning: 'currency',
        total_deduction: 'currency',
        total: 'currency',
      }"
    />
    <table>
      <thead>
        <tr>
          <th class="p-2">Komponen</th>
          <th>Jumlah</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="bg-success/20 p-2 font-semibold uppercase">Pemasukan</td>
          <td class="bg-success/20 px-2 py-1 font-semibold uppercase">{{ parse('currency', data.total_earning) }}</td>
        </tr>
        <tr v-for="component in data.salary_earning_component">
          <td class="px-2 py-1">{{ component.rel_component_id }}</td>
          <td class="px-2 py-1">{{ parse('currency', component.amount) }}</td>
        </tr>
        <tr>
          <td class="bg-error/20 p-2 font-semibold uppercase">Potongan</td>
          <td class="bg-error/20 px-2 py-1 font-semibold uppercase">{{ parse('currency', data.total_deduction) }}</td>
        </tr>
        <tr v-for="component in data.salary_deduction_component">
          <td class="px-2 py-1">{{ component.rel_component_id }}</td>
          <td class="px-2 py-1">{{ parse('currency', component.amount) }}</td>
        </tr>
        <tr>
          <td class="bg-high-contrast text-on-high-contrast p-2 font-semibold uppercase">Total</td>
          <td class="bg-high-contrast text-on-high-contrast p-2 font-semibold">{{ parse('currency', data.total) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
