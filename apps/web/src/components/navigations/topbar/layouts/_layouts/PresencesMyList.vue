<script setup lang="ts">
import Table from '@repo/vue-framework/components/composites/Table.vue'
import { keyManager } from '@/stores/keyManager'
import SalaryDetail from './_layouts/SalaryDetail.vue'
</script>

<template>
  <Table
    getAPI="presences/my-list?custom"
    :fields="['rel_section_id', 'date', 'check_in', 'check_out', 'duration']"
    :fieldsAlias="{
      rel_section_id: 'Ruas',
      date: 'Tanggal',
      check_in: 'Presensi Masuk',
      check_out: 'Presensi Keluar',
      duration: 'Durasi',
    }"
    :fieldsParse="{
      date: 'date',
      check_in: 'datetime',
      check_out: 'datetime',
    }"
    paginated
  >
  </Table>
</template>
