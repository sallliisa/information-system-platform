<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { modules } from '@/stores/modules'
import { useRoute, useRouter } from 'vue-router'
import Toast from '@/components/base/Toast.vue'
import Form from '@repo/vue-framework/components/composites/Form.vue'
import app from '@/config'
import services from '@/utils/services'
import _app from '@/app/configs/_app'
import mode from '@/mode'
import PasswordInput from '@/components/inputs/PasswordInput.vue'
import Logo from '@/assets/corporate/common/Logo.vue'
import { storage } from '@/utils/storage'
import { permissions } from '@/stores/permissions'
import CompanyLogo from '@/assets/corporate/assets/app-logo.svg'
import { globalLoading } from '@/stores/loading'
import TextInput from '@/components/inputs/TextInput.vue'

const loginMessage = ref<{ message: string; type: 'error' | 'warning' | 'info' | 'success' | undefined }>({ message: '', type: undefined })
const [route, router] = [useRoute(), useRouter()]
const loading = ref(false)
const formData = ref({username: '', password: ''})

function onLoginSuccess(res: Record<string, any>) {
  
}

function login() {
  loading.value = true
  services
  .post('login', formData.value)
  .then(({user, token, tasks, message}) => {
    storage.cookie.set('token', token)
    storage.localStorage.set('profile', user)
    storage.localStorage.set('permissions', tasks)
    if (tasks?.length == 0 && app.mode == 'PRODUCTION') {
      loginMessage.value = { message: 'Anda tidak memiliki akses ke aplikasi ini', type: 'error' }
      return
    }
    permissions().build()
    modules().build()
    console.log(modules().value)
    router.push({ name: modules().value[0]?.routes.find((x: any) => !x.separator)!.name })
  })
  .catch((err) => {
    loading.value = false
  })
}

onMounted(() => {
  setTimeout(() => {
    globalLoading().disable()
  }, 1000)
})
</script>

<template>
  <Card class="flex flex-col gap-16 p-8">
    <div class="flex flex-row items-center gap-8">
      <Logo class="w-16"/>
    </div>
    <div class="flex flex-col gap-4">
      <div class="text-lg">Welcome to</div>
      <div class="text-4xl font-bold">Demo App</div>
    </div>
    <form class="flex flex-col items-center gap-4" @submit.prevent="() => login()">
      <TextInput class="w-full" v-model="formData.username" label="Email" enableHelperMessage required/>
      <PasswordInput class="w-full" v-model="formData.password" label="Password" enableHelperMessage required/>
      <div v-if="!loading" class="flex flex-row items-center gap-2 w-full">
        <Button :disabled="loading" @click="() => login()" type="submit" class="mt-6 w-full">Login</Button>
      </div>
      <Button v-else disabled variant="tonal" class="mt-6 w-full"><Spinner/></Button>
    </form>
    <div class="flex w-full items-center justify-center">
      <Toast v-if="loginMessage.message" :type="loginMessage.type">{{ loginMessage.message }}</Toast>
    </div>
    <div class="text-muted text-center">Company Ltd.</div>
  </Card>
</template>