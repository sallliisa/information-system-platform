<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { modules } from '@/stores/modules'
import { useRouter } from 'vue-router'
import Toast from '@repo/vue-framework/components/base/Toast.vue'
import services from '@/utils/services'
import PasswordInput from '@repo/vue-framework/components/inputs/PasswordInput.vue'
import Logo from '@/assets/corporate/common/Logo.vue'
import { storage } from '@/utils/storage'
import { permissions } from '@/stores/permissions'
import { globalLoading } from '@/stores/loading'
import TextInput from '@repo/vue-framework/components/inputs/TextInput.vue'
import Button from '@repo/vue-framework/components/base/Button.vue'
import Card from '@repo/vue-framework/components/base/Card.vue'
import Spinner from '@repo/vue-framework/components/base/Spinner.vue'
import { consumePostLoginRedirect } from '@/utils/post-login-redirect'
import { resolvePostLoginRoute } from '@/router/navigation'

const BYPASS_ALL_PERMISSIONS = import.meta.env.VITE_APP_BYPASS_ALL_PERMISSIONS === 'true'
const loginMessage = ref<{ message: string; type: 'error' | 'warning' | 'info' | 'success' | undefined }>({ message: '', type: undefined })
const router = useRouter()
const loading = ref(false)
const formData = ref({username: '', password: ''})

function login() {
  loading.value = true
  services
  .post('login', formData.value)
  .then(({user, token, tasks}) => {
    storage.cookie.set('token', token)
    storage.localStorage.set('profile', user)
    storage.localStorage.set('permissions', tasks)
    if (tasks?.length == 0 && !BYPASS_ALL_PERMISSIONS) {
      loginMessage.value = { message: 'Anda tidak memiliki akses ke aplikasi ini', type: 'error' }
      loading.value = false
      return
    }

    permissions().build()
    modules().build()
    const destination = resolvePostLoginRoute(router, consumePostLoginRedirect())
    router.push(destination ?? { name: 'login' })
  })
  .catch(() => {
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
