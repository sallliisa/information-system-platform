import { useMemo } from 'react'
import { View } from 'react-native'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { buildMobileUpdateFormConfig } from '../../../features/routes/config/defaults.builders'
import { sectionGap } from '../../../theme/layout'
import { Card } from '../../base'
import { Form } from '../Form'

type CRUDUpdateProps = {
  config: MobileModelConfig
  dataID?: string
  onBack: () => void
}

export function CRUDUpdate({ config, dataID, onBack }: CRUDUpdateProps) {
  const updateFormConfig = useMemo(() => buildMobileUpdateFormConfig(config), [config])

  return (
    <View style={{ gap: sectionGap }}>
      <Card type="outlined" color="surface">
        <Form
          {...updateFormConfig}
          formType="update"
          dataID={dataID || updateFormConfig.dataID}
          onSuccess={() => {
            onBack()
          }}
        />
      </Card>
    </View>
  )
}
