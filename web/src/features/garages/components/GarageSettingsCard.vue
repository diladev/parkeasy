<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatInteger } from '@/shared/lib/format'

import type { GarageDetail } from '../model/garage.schemas'

const { garage } = defineProps<{ garage: GarageDetail }>()

const { t } = useI18n()

const AMENITIES = ['cctv', 'ev_charging', 'covered', 'accessible'] as const
const amenities = computed(() => AMENITIES.filter((key) => garage.amenities[key]))

const hours = computed(() =>
  garage.is_open_24h
    ? t('garages.detail.settings.open24h')
    : t('garages.detail.settings.hoursRange', {
        from: garage.opening_time,
        to: garage.closing_time,
      }),
)

const coordinates = computed(() => `${garage.latitude.toFixed(4)}, ${garage.longitude.toFixed(4)}`)
const mapUrl = computed(() => {
  const { latitude: lat, longitude: lng } = garage
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
})
</script>

<template>
  <section
    class="rounded-[12px] border border-default bg-muted p-4"
    aria-labelledby="lot-settings-title"
  >
    <h2 id="lot-settings-title" class="text-sm font-medium text-highlighted">
      {{ t('garages.detail.settings.title') }}
    </h2>
    <p class="mt-1 text-xs text-dimmed">{{ t('garages.detail.settings.subtitle') }}</p>

    <dl class="mt-4 grid grid-cols-[minmax(0,10rem)_1fr] gap-x-4 gap-y-3 text-sm">
      <dt class="text-dimmed">{{ t('garages.detail.settings.pricePerHour') }}</dt>
      <dd class="text-highlighted">
        {{ formatInteger(garage.price_per_hour) }} {{ t('common.iqd') }}
      </dd>

      <dt class="text-dimmed">{{ t('garages.detail.settings.openingHours') }}</dt>
      <dd class="text-highlighted">{{ hours }}</dd>

      <dt class="text-dimmed">{{ t('garages.detail.settings.freeCancellation') }}</dt>
      <dd class="text-highlighted">
        {{
          t('garages.detail.settings.freeCancellationValue', {
            minutes: garage.free_cancellation_minutes,
          })
        }}
      </dd>

      <dt class="text-dimmed">{{ t('garages.detail.settings.location') }}</dt>
      <dd class="flex flex-wrap items-center gap-x-3 text-highlighted">
        <span dir="ltr">{{ coordinates }}</span>
        <ULink :to="mapUrl" target="_blank" rel="noopener noreferrer" class="text-primary">
          {{ t('garages.detail.settings.viewOnMap') }}
          <span class="sr-only">{{ t('common.opensInNewTab') }}</span>
        </ULink>
      </dd>

      <dt class="text-dimmed">{{ t('garages.detail.settings.amenities') }}</dt>
      <dd class="flex flex-wrap gap-1.5">
        <UBadge
          v-for="key in amenities"
          :key
          color="success"
          variant="soft"
          :label="t(`garages.detail.amenity.${key}`)"
        />
        <span v-if="amenities.length === 0" class="text-muted">
          {{ t('garages.detail.settings.noAmenities') }}
        </span>
      </dd>
    </dl>
  </section>
</template>
