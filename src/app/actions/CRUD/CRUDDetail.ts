import services from '@/utils/services'
import { toast } from 'vue-sonner'

export function defaultOnExport(detailConfig: CRUDDetailProps, id: number) {
  services
    .downloadFile(`https://api.ads-hk.byte-labs.tech/api/${detailConfig.getAPI}/export-buker/${id}`, `${detailConfig.getAPI}_${new Date()}.pdf`)
    .then((res) => {})
    .catch((err) => {
      toast.error(`Gagal melakukan export: ${err}`)
    })
}
