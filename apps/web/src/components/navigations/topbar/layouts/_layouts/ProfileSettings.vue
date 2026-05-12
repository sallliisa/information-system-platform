<script setup lang="ts">
import Form from '@repo/vue-framework/components/composites/Form.vue'
import { keyManager } from '@/stores/keyManager'
import { toast } from 'vue-sonner'
import services from '@/utils/services'

const props = defineProps({
  profile: { type: Object, required: true },
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <Card v-if="profile.login_method === 'sso'" class="flex-row items-start" color="primary-container">
      <Icon name="information" />
      <p><span class="font-semibold">Anda adalah pengguna SSO.</span> Anda tidak dapat melakukan pengubahan password melalui platform. Silahkan hubungi admin untuk pengubahan password akun.</p>
    </Card>
    <Form
      :fields="['img_photo_user', 'fullname', 'username', 'email', 'phone']"
      :inputConfig="{
        img_photo_user: { type: 'image', rowSpan: 2, span: 4 },
        fullname: { type: 'text', rowSpan: 1, span: 8 },
        username: { type: 'text', rowSpan: 1, span: 8, props: { disabled: true, suffix: profile.login_method === 'sso' ? 'Akun SSO' : 'Akun Non-SSO' } },
        email: { type: 'text', span: 6, props: { disabled: true } },
        phone: { type: 'text', span: 6 },
      }"
      :fieldsAlias="{
        img_photo_user: 'Foto Profil',
        fullname: 'Nama Lengkap',
        username: 'Username',
        email: 'Email',
        phone: 'Nomor Telepon',
      }"
      formType="update"
      :getData="() => JSON.parse(JSON.stringify(props.profile))"
      getAPI="me?custom"
      targetAPI="profile"
      :onSuccess="
        () => {
          toast.success('Berhasil menyimpan data profil!')
          keyManager().triggerChange('topbar-profile-menu')
        }
      "
    />
  </div>
</template>
