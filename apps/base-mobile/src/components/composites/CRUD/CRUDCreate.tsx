import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { buildMobileCreateFormConfig } from '../../../features/routes/config/defaults.builders'
import { sectionGap } from '../../../theme/layout'
import { Card } from '../../base'
import { Form } from '../Form'

type CRUDCreateProps = {
  config: MobileModelConfig
  onBack: () => void
}

export function CRUDCreate({ config, onBack }: CRUDCreateProps) {
  const createFormConfig = useMemo(() => buildMobileCreateFormConfig(config), [config])

  return (
    <View style={styles.container}>
      <Card type="outlined" color="surface">
        <Form
          {...createFormConfig}
          formType="create"
          onSuccess={
            createFormConfig.onSuccess
              ? createFormConfig.onSuccess
              : () => {
                  onBack()
                }
          }
        />
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: sectionGap,
  },
})
