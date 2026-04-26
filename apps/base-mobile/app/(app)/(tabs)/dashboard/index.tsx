import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput as RNTextInput, View } from 'react-native'
import { Button, Card, Modal, Popover } from '../../../../src/components/base'
import { materialColors } from '../../../../src/theme/material'

type PopoverRenderContext = {
  open: boolean
  setOpen: (next: boolean) => void
  disabled: boolean
}

type StatusFilter = 'all' | 'active' | 'archived'

export default function DashboardScreen() {
  const router = useRouter()
  const [fixedHeightOpen, setFixedHeightOpen] = useState(false)
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all')

  const statusOptions: Array<{ key: StatusFilter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'archived', label: 'Archived' },
  ]

  return (
    <View className="flex-1 justify-center">
      <Card className="w-full max-w-[440px] gap-4" type="filled">
        <Text className="text-[30px] font-bold" style={{ color: materialColors.onSurface }}>Dashboard</Text>
        <Text className="text-[15px]" style={{ color: materialColors.onSurfaceVariant }}>Phase 1 dummy dashboard tab.</Text>

        <Pressable className="mt-2.5 rounded-[10px] py-3 px-[18px]" style={{ backgroundColor: materialColors.primary }} onPress={() => router.push('/dashboard/details' as any)}>
          <Text className="text-sm font-semibold" style={{ color: materialColors.onPrimary }}>Open Details (Push)</Text>
        </Pressable>

        <View className="mt-2.5 gap-2.5">
          <Modal>
            <Modal.Trigger>
              {({ setOpen }: { setOpen: (next: boolean) => void }) => (
                <Button variant="tonal" onPress={() => setOpen(true)}>
                  Open Confirmation Modal
                </Button>
              )}
            </Modal.Trigger>
            <Modal.Header>
              <>
                <Text className="text-[18px] font-bold" style={{ color: materialColors.onSurface }}>
                  Delete item?
                </Text>
                <Text className="text-[14px]" style={{ color: materialColors.onSurfaceVariant }}>
                  This uses default dynamic sizing. Content height adjusts automatically.
                </Text>
              </>
            </Modal.Header>
            <Modal.Content>
              <Text style={{ color: materialColors.onSurfaceVariant }}>
                The sheet stays compact for small content and grows only when needed.
              </Text>
            </Modal.Content>
            <Modal.Footer>
              {({ setOpen }: { setOpen: (next: boolean) => void }) => (
                <View className="flex-row justify-end gap-3">
                  <Button variant="outlined" color="secondary" onPress={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button color="error" onPress={() => setOpen(false)}>
                    Delete
                  </Button>
                </View>
              )}
            </Modal.Footer>
          </Modal>

          <Modal
            open={fixedHeightOpen}
            onOpenChange={setFixedHeightOpen}
            snapPoints={['65%']}
          >
            <Modal.Trigger>
              {({ setOpen }: { setOpen: (next: boolean) => void }) => (
                <Button variant="outlined" onPress={() => setOpen(true)}>
                  Open Fixed Height Modal (65%)
                </Button>
              )}
            </Modal.Trigger>
            <Modal.Header>
              <>
                <Text className="text-[18px] font-bold" style={{ color: materialColors.onSurface }}>
                  Fixed Height Sheet
                </Text>
                <Text className="text-[14px]" style={{ color: materialColors.onSurfaceVariant }}>
                  This sample overrides dynamic sizing with snap points.
                </Text>
              </>
            </Modal.Header>
            <Modal.Content>
              <View className="gap-3">
                <Text style={{ color: materialColors.onSurfaceVariant }}>
                  Use `snapPoints` when a flow needs a predictable height.
                </Text>
                <Text style={{ color: materialColors.onSurfaceVariant }}>
                  This one is controlled with `open` and `onOpenChange`.
                </Text>
                {Array.from({ length: 24 }).map((_, index) => (
                  <View
                    key={`fixed-height-long-content-${index}`}
                    className="gap-1 rounded-xl p-3"
                    style={{ backgroundColor: materialColors.surfaceContainerHighest }}
                  >
                    <Text className="text-[13px] font-semibold" style={{ color: materialColors.onSurface }}>
                      Demo Block {index + 1}
                    </Text>
                    <Text style={{ color: materialColors.onSurfaceVariant }}>
                      Very long modal content for gesture QA. Keep dragging the sheet upward first, then scroll this content when the sheet reaches its largest snap.
                    </Text>
                    <Text style={{ color: materialColors.onSurfaceVariant }}>
                      This line is repeated intentionally so the 65% modal clearly overflows and demonstrates expansion-first, scroll-later behavior.
                    </Text>
                  </View>
                ))}
              </View>
            </Modal.Content>
            <Modal.Footer>
              {({ setOpen }: { setOpen: (next: boolean) => void }) => <Button onPress={() => setOpen(false)}>Done</Button>}
            </Modal.Footer>
          </Modal>
        </View>

        <View className="mt-2.5 gap-2.5">
          <Text className="text-[18px] font-bold" style={{ color: materialColors.onSurface }}>
            Popover Demo
          </Text>
          <Text className="text-[14px]" style={{ color: materialColors.onSurfaceVariant }}>
            Anchored flyout with uncontrolled, controlled, and disabled trigger states. Width can be fit-content or full with side padding.
          </Text>

          <Popover side="bottom" align="center">
            <Popover.Trigger>
              {({ setOpen }: PopoverRenderContext) => (
                <Button variant="tonal" onPress={() => setOpen(true)}>
                  Open Quick Actions Flyout
                </Button>
              )}
            </Popover.Trigger>
            <Popover.Content>
              {({ setOpen }: PopoverRenderContext) => (
                <Card
                  type="outlined"
                  className="w-[260px] gap-2.5"
                  style={{ shadowColor: materialColors.shadow, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}
                >
                  <Text className="text-[16px] font-semibold" style={{ color: materialColors.onSurface }}>
                    Quick Actions
                  </Text>
                  <Button variant="outlined" onPress={() => setOpen(false)}>
                    Create Item
                  </Button>
                  <Button variant="outlined" onPress={() => setOpen(false)}>
                    Refresh Data
                  </Button>
                  <Button color="secondary" onPress={() => setOpen(false)}>
                    Close
                  </Button>
                </Card>
              )}
            </Popover.Content>
          </Popover>

          <Popover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            side="bottom"
            align="end"
            sideOffset={8}
            width="full"
          >
            <Popover.Trigger>
              {({ setOpen, open }: PopoverRenderContext) => (
                <Button variant="outlined" onPress={() => setOpen(!open)}>
                  {open ? 'Hide Filter Flyout' : 'Open Filter Flyout'}
                </Button>
              )}
            </Popover.Trigger>
            <Popover.Content>
              {({ setOpen }: PopoverRenderContext) => (
                <Card
                  type="outlined"
                  className="gap-3"
                  style={{ shadowColor: materialColors.shadow, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}
                >
                  <Text className="text-[16px] font-semibold" style={{ color: materialColors.onSurface }}>
                    Filter Records
                  </Text>

                  <View
                    className="rounded-[10px] px-3 py-2"
                    style={{ borderWidth: 1, borderColor: materialColors.outlineVariant }}
                  >
                    <RNTextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search by keyword"
                      placeholderTextColor={materialColors.onSurfaceVariant}
                      style={{ color: materialColors.onSurface, fontSize: 14 }}
                    />
                  </View>

                  <View className="flex-row gap-2">
                    {statusOptions.map((option) => {
                      const active = selectedStatus === option.key
                      return (
                        <Pressable
                          key={option.key}
                          className="rounded-full px-3 py-2"
                          style={{
                            borderWidth: 1,
                            borderColor: active ? materialColors.primary : materialColors.outlineVariant,
                            backgroundColor: active ? materialColors.primaryContainer : 'transparent',
                          }}
                          onPress={() => setSelectedStatus(option.key)}
                        >
                          <Text
                            className="text-[12px] font-semibold"
                            style={{ color: active ? materialColors.onPrimaryContainer : materialColors.onSurfaceVariant }}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>

                  <View className="flex-row justify-end gap-2">
                    <Button
                      variant="outlined"
                      color="secondary"
                      onPress={() => {
                        setSearchQuery('')
                        setSelectedStatus('all')
                      }}
                    >
                      Clear
                    </Button>
                    <Button onPress={() => setOpen(false)}>Apply</Button>
                  </View>
                </Card>
              )}
            </Popover.Content>
          </Popover>

          <Popover disabled>
            <Popover.Trigger>
              <Button variant="outlined" disabled>
                Disabled Popover Trigger
              </Button>
            </Popover.Trigger>
            <Popover.Content>
              <Card type="outlined" className="w-[220px]">
                <Text style={{ color: materialColors.onSurfaceVariant }}>
                  This content never opens because the popover is disabled.
                </Text>
              </Card>
            </Popover.Content>
          </Popover>
        </View>
      </Card>
    </View>
  )
}
