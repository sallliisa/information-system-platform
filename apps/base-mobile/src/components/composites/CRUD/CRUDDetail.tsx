import { useMemo, useState } from 'react'
import { View } from 'react-native'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { buildMobileDetailConfig } from '../../../features/routes/config/defaults.builders'
import { renderDetailUnderSlot } from '../../../features/routes/detail-slot'
import { sectionGap } from '../../../theme/layout'
import { Button, HeaderAction, Icon } from '../../base'
import { Detail } from '../Detail'

type CRUDDetailProps = {
  config: MobileModelConfig
  dataID?: string
  onUpdate: () => void
}

export function CRUDDetail({ config, dataID, onUpdate }: CRUDDetailProps) {
  const detailConfig = useMemo(() => buildMobileDetailConfig(config), [config])
  const [detailData, setDetailData] = useState<Record<string, any>>({})
  const canUpdate = config.actions?.update ?? true

  return (
    <View style={{ gap: sectionGap }}>
      {canUpdate ? (
        <HeaderAction>
          <Button size="square" variant="tonal" onPress={onUpdate}>
            <Icon name="edit" />
          </Button>
        </HeaderAction>
      ) : null}

      <Detail {...detailConfig} dataID={dataID ?? detailConfig.dataID} getAPI={detailConfig.getAPI || config.name} onDataLoaded={setDetailData} />

      {renderDetailUnderSlot(config, detailData)}
    </View>
  )
}
