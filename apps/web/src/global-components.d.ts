import Alert from './components/base/Alert.vue'
import Button from '@/components/base/Button.vue'
import Card from '@/components/base/Card.vue'
import Chip from '@/components/base/Chip.vue'
import Icon from '@/components/base/Icon.vue'
import Modal from './components/base/Modal.vue'
import Spinner from './components/base/Spinner.vue'
import Tooltip from './components/base/Tooltip.vue'
import Pagination from '@/components/utils/Pagination.vue'
import Skeleton from './components/base/Skeleton.vue'

declare module 'vue' {
  export interface GlobalComponents {
    Alert: typeof Alert
    Button: typeof Button
    Card: typeof Card
    Chip: typeof Chip
    Icon: typeof Icon
    Modal: typeof Modal
    Spinner: typeof Spinner
    Skeleton: typeof Skeleton
    Tooltip: typeof Tooltip
    Pagination: typeof Pagination
  }
}

export {}
