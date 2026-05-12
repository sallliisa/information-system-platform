<script setup lang="ts">
import Popover from '@repo/vue-framework/components/base/Popover.vue'
import HKLogo from '@/assets/corporate/assets/hk-logo.svg'
import _menu from '@/menu'
import { storage } from '@/utils/storage'
import services from '@/utils/services'
import { computed, onMounted, ref, watch } from 'vue'
import { useColorPreference } from '@/stores/colorpreference'
import { useRoute } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import TopbarProfileMenu from './layouts/TopbarProfileMenu.vue'
import Modal from '@repo/vue-framework/components/base/Modal.vue'
import { keyManager } from '@/stores/keyManager'
import { transformData } from '@/stores/modules'
import Drawer from '@repo/vue-framework/components/base/Drawer.vue'
import Notifications from './layouts/Notifications.vue'
import Button from '@repo/vue-framework/components/base/Button.vue'
import Card from '@repo/vue-framework/components/base/Card.vue'
import Icon from '@repo/vue-framework/components/base/Icon.vue'
import Spinner from '@repo/vue-framework/components/base/Spinner.vue'

const menu = computed(() => transformData(_menu))

const route = useRoute()
const profile = storage.localStorage.get('profile') || {}
const activeModule = ref()

watch(
  () => route.path,
  () => {
    activeModule.value = menu.value.find((module) => module.name === String(route.path.split('/')[1]))
  },
  { immediate: true }
)

const notificationsTotal = ref()
onMounted(() => {
  services
    .get('notifications/total')
    .then((res) => {
      notificationsTotal.value = res.total
    })
    .catch((err) => {})
})

const activeIndex = ref()
const topbarRef = ref(null)

onClickOutside(topbarRef as any, () => {
  activeIndex.value = null
})
</script>

<template>
  <div ref="topbarRef" class="sticky top-0 z-[10] hidden w-full flex-col lg:flex" @mouseleave="() => (activeIndex = null)">
    <div class="flex flex-col divide-y divide-outline/20">
      <div class="flex flex-row items-center justify-between overflow-auto bg-primary px-16 py-4 text-white">
        <div class="flex min-w-[215px] items-center justify-center">
          <img :src="HKLogo" class="h-[51px] max-w-[72px]" />
        </div>
        <!-- <div class="flex flex-row items-center gap-4 justify-center w-full relative"> -->
        <div class="relative flex w-full list-none flex-row items-center justify-center gap-2 py-2">
          <template v-for="(module, index) in menu">
            <button
              @click="
                () => {
                  activeIndex = index
                }
              "
              @mouseover="
                () => {
                  activeIndex = index
                }
              "
              class="overlay flex flex-row items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 after:hover:bg-black/5"
              :class="module.name === String($route.path.split('/')[1]) ? 'bg-[#FFF3E1] text-[#f69103]' : ''"
            >
              <Icon :name="(module.icon as any)" />
              <p>{{ module.title }}</p>
              <!-- <Icon name="arrow-down-s" /> -->
            </button>
          </template>
        </div>
        <!-- </div> -->
        <div class="flex flex-row items-center gap-2">
          <button
            @click="$router.push({ name: 'to-do' })"
            class="overlay flex min-w-max flex-row items-center gap-2 rounded-lg p-2 after:hover:bg-black/10"
            :class="$route.name === 'to-do' ? 'bg-white text-primary' : ''"
          >
            <Icon name="todo" />
          </button>
          <Drawer :key="keyManager().value['app-notifications-drawer']">
            <template #trigger>
              <button class="overlay relative flex min-w-max flex-row items-center gap-2 rounded-lg p-2 after:hover:bg-black/10">
                <div v-if="notificationsTotal" class="absolute -right-1 -top-1 flex aspect-square w-[20px] items-center justify-center rounded-full bg-red-600 text-xs text-white">
                  {{ notificationsTotal }}
                </div>
                <Icon name="notification" />
              </button>
            </template>
            <template #content>
              <div class="flex h-full flex-col gap-4">
                <div class="flex flex-row items-center justify-between">
                  <p class="text-xl font-bold">Notifikasi</p>
                  <Button @click="() => keyManager().triggerChange('app-notifications-data')" size="square" variant="icon"><Icon name="refresh" /></Button>
                </div>
                <div class="h-[1px] w-full bg-black/20"></div>
                <Suspense :timeout="0" :key="keyManager().value['app-notifications-data']">
                  <template #fallback>
                    <div class="flex w-full items-center justify-center">
                      <Spinner />
                    </div>
                  </template>
                  <Notifications />
                </Suspense>
              </div>
            </template>
          </Drawer>
          <button
            @click="$router.push({ name: 'broadcast' })"
            class="overlay flex min-w-max flex-row items-center gap-2 rounded-lg p-2 after:hover:bg-black/10"
            :class="$route.name === 'broadcast' ? 'bg-white text-primary' : ''"
          >
            <Icon name="broadcast" />
          </button>
          <!-- <button @click="$router.push({name: 'my-actions'})" class="flex flex-row relative items-center gap-2 rounded-lg p-2 overlay after:hover:bg-black/10 min-w-max" :class="$route.name === 'my-actions' ? 'bg-white text-primary' : ''">
            <div v-if="myActionTotal" class="text-xs bg-red-600 absolute -top-1 -right-1 rounded-full text-white w-[20px] aspect-square flex items-center justify-center">{{ myActionTotal }}</div>
            <Icon name="notification" />
          </button> -->
          <Popover :align="'end'">
            <template #trigger>
              <button class="overlay flex min-w-max flex-row items-center gap-2 rounded-lg px-4 py-2 after:hover:bg-black/10">
                <img v-if="profile?.img_photo_user?.tumbnail_url" :src="profile.img_photo_user.tumbnail_url" class="aspect-square w-[20px] rounded-full" />
                <Icon v-else name="user" />
                <p>{{ profile?.fullname }}</p>
                <Icon name="arrow-down-s" />
              </button>
            </template>
            <template #content>
              <Card class="outline outline-1 outline-black/20">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-row items-center justify-between gap-4">
                    <Modal class="max-w-screen-2xl" :key="keyManager().value['topbar-profile-modal']">
                      <template #trigger>
                        <Card class="flex-row items-center gap-4 p-2" interactive>
                          <div>
                            <p class="text-lg font-bold">{{ profile.fullname }}</p>
                            <p class="text-muted">{{ profile.role_name }}</p>
                          </div>
                          <Icon name="arrow-right-s" />
                        </Card>
                      </template>
                      <template #content>
                        <TopbarProfileMenu :key="keyManager().value['topbar-profile-menu']" />
                      </template>
                    </Modal>
                    <Button size="square" :variant="useColorPreference().value === 'dark' ? 'tonal' : 'icon'" @click="useColorPreference().toggle()"><Icon name="moon" /></Button>
                  </div>
                  <div class="flex flex-col gap-2">
                    <!-- <Select :items="divisions" class="w-full" v-model="selectedDivisionID" placeholder="Pilih Divisi"/>
                    <Select :items="projects" class="w-full" v-model="selectedProjectID" placeholder="Pilih Proyek/Biro" :key="JSON.stringify(projects)"/> -->
                  </div>
                  <Button @click="services.signOut()" color="error" variant="tonal" class="w-full">Keluar <Icon name="logout-box" /></Button>
                </div>
              </Card>
            </template>
          </Popover>
        </div>
      </div>
    </div>
    <Transition name="topbar-main">
      <Card
        v-if="activeIndex != null"
        class="absolute left-0 right-0 top-[3rem] z-50 mx-8 mt-[35px] rounded-b-lg rounded-t-none border border-t-[2px] border-black/10 bg-cover bg-center p-4 2xl:mx-16"
      >
        <Transition name="topbar-content" mode="out-in">
          <div :key="activeIndex" class="flex flex-col gap-4">
            <div class="col-[span_3_/_span_3] flex flex-col justify-center pr-4">
              <div class="text-2xl font-bold">{{ menu[activeIndex].title }}</div>
              <div class="max-w-fit">{{ menu[activeIndex].description }}</div>
            </div>
            <div class="w-full border-t border-[#148bbe]"></div>
            <div class="col-[span_24_/_span_24] flex w-full flex-row flex-wrap gap-4 pl-4">
              <div v-for="section in menu[activeIndex].routes" class="flex w-fit min-w-[150px] flex-col gap-4">
                <div class="ml-4 text-sm font-semibold text-muted">{{ section.section }}</div>
                <div class="flex flex-col gap-1">
                  <template v-for="route in section.routes">
                    <button
                      @click="
                        () => {
                          $router.push({ name: route.name })
                          activeIndex = null
                        }
                      "
                      class="overlay flex min-w-max flex-row items-center gap-4 rounded-full px-4 py-2 text-start after:hover:bg-black/10"
                      :class="route.name === String($route.path.split('/')[2]) ? 'bg-high-contrast text-on-high-contrast' : ''"
                    >
                      <!-- <Icon :name="((route as any).icon as any)" /> -->
                      <p>{{ (route as any).title! }}</p>
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Card>
    </Transition>
  </div>
  <!-- <div class="hidden lg:flex flex-col w-full z-[10]">
    <div class="flex flex-col divide-y divide-outline/20">
      <div class="flex flex-row items-center justify-between px-16 py-4 bg-surface-container text-on-surface">
        <img :src="HKLogo" class="max-w-[64px]"/>
        <div class="flex flex-row items-center gap-4">
          <Popover v-for="module in menu">
            <template #trigger>
              <button class="flex flex-row items-center gap-2 rounded-lg px-4 py-2 overlay after:hover:bg-black/10" :class="module.name === String($route.path.split('/')[1]) ? 'bg-primary text-on-primary' : ''">
                <Icon :name="(module.icon as any)" />
                <p>{{ module.title }}</p>
                <Icon name="arrow-down-s" />
              </button>
            </template>
            <template #content>
              <Card class="outline outline-1 outline-black/20 flex flex-row divide-x-[1px] divide-outline/[38%]">
                <div class="flex flex-col justify-center pr-4">
                  <div class="text-2xl font-bold">{{ module.title }}</div>
                  <div class="max-w-fit">{{module.description}}</div>
                </div>
                <div class="flex flex-row w-full gap-4 pl-4">
                  <div v-for="section in module.routes" class="flex flex-col gap-4 w-fit min-w-[150px]">
                    <div class="text-sm text-muted font-semibold">{{section.section}}</div>
                    <div class="flex flex-col gap-1">
                      <template v-for="route in section.routes">
                        <button @click="() => $router.push({name: route.name})" class="flex text-start min-w-max flex-row items-center gap-4 rounded-lg px-4 py-2 overlay after:hover:bg-black/10" :class="route.name === String($route.path.split('/')[2]) ? 'bg-primary text-on-primary' : ''">
                          <Icon :name="((route as any).icon as any)" />
                          <p>{{ (route as any).title! }}</p>
                        </button>
                      </template>
                    </div>
                  </div>
                </div>
              </Card>
            </template>
          </Popover>
        </div>
        <Popover>
          <template #trigger>
            <button class="flex flex-row items-center gap-2 rounded-lg px-4 py-2 overlay after:hover:bg-black/10">
              <Icon name="user" />
              <p>{{profile.fullname}}</p>
              <Icon name="arrow-down-s" />
            </button>
          </template>
          <template #content>
            <Card class="outline outline-1 outline-black/20">
              <div class="flex flex-col">
                <div class="flex flex-row items-center gap-4 justify-between">
                  <div class="flex-col">
                    <p class="text-lg font-bold">{{profile.fullname}}</p>
                    <p class="text-muted">{{ profile.role_name }}</p>
                  </div>
                  <Button size="square" :variant="useColorPreference().value === 'dark' ? 'tonal' : 'icon'" @click="useColorPreference().toggle()"><Icon name="moon" /></Button>
                </div>
                <Button @click="services.signOut()" color="error" variant="tonal" class="w-[192px] mt-4">Keluar <Icon name="logout-box" /></Button>
              </div>
            </Card>
          </template>
        </Popover>
      </div>
    </div>
  </div> -->
  <!-- {{ permissions().has('view-inspection-damages') }} -->
</template>

<!-- <template v-for="route in module.routes">
                  <p v-if="route.separator" class="font-medium text-muted">{{ route.name }}</p>
                  <button v-else @click="() => $router.push({name: route.name})" class="flex text-start min-w-max flex-row items-center gap-4 rounded-lg px-4 py-2 overlay after:hover:bg-black/10" :class="route.name === String($route.path.split('/')[2]) ? 'bg-primary text-on-primary' : ''">
                    <Icon :name="((route as any).icon as any)" />
                    <p>{{ (route as any).title! }}</p>
                  </button>
                </template> -->

<style>
.topbar-main-enter-active,
.topbar-main-leave-active {
  transition: all 0.35s cubic-bezier(0.05, 0.7, 0.1, 1);
}
.topbar-main-enter-from,
.topbar-main-leave-to {
  scale: 0.98;
  opacity: 0%;
}
.topbar-main-enter-to,
.topbar-main-leave-from {
  scale: 1;
  /* opacity: 100% */
}

.topbar-content-enter-active,
.topbar-content-leave-active {
  transition: all 0.12s cubic-bezier(0.05, 0.7, 0.1, 1);
}
.topbar-content-enter-from,
.topbar-content-leave-to {
  transform: translateY(24px);
  opacity: 0%;
}
.topbar-content-enter-to,
.topbar-content-leave-from {
  transform: translateY(0);
  opacity: 100%;
}
</style>
