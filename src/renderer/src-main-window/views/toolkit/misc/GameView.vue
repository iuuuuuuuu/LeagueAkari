<template>
  <NCard size="small">
    <template #header>
      <span class="card-header-title">{{ t('GameView.title') }}</span>
    </template>
    <StandaloneMatchHistoryCardModal v-model:show="show" :game-id="viewingGameId" />
    <ControlItem
      class="control-item-margin"
      :label="t('GameView.game.label')"
      :label-description="t('GameView.game.description')"
      :label-width="260"
    >
      <div style="display: flex; align-items: center; gap: 8px">
        <NInputNumber :show-button="false" v-model:value="gameId" size="small" />
        <NButton :disabled="!gameId" @click="handleInspect" size="small" type="primary">{{
          t('GameView.game.button')
        }}</NButton>
      </div>
    </ControlItem>
  </NCard>
</template>

<script setup lang="ts">
import ControlItem from '@renderer-shared/components/ControlItem.vue'
import { useTranslation } from 'i18next-vue'
import { NButton, NCard, NInputNumber } from 'naive-ui'
import { ref } from 'vue'

import StandaloneMatchHistoryCardModal from '../../match-history/card/StandaloneMatchHistoryCardModal.vue'

const { t } = useTranslation()

const gameId = ref<number>()
const viewingGameId = ref<number>()
const show = ref(false)

const handleInspect = () => {
  show.value = true
  viewingGameId.value = gameId.value
}
</script>

<style lang="less" scoped></style>
