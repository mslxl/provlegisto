<script setup lang="ts">
import Bus from "./BusNotifcation.vue"
import { NNotificationProvider } from "naive-ui"
</script>
<template>
  <NNotificationProvider>
    <Bus />
    <slot></slot>
  </NNotificationProvider>
</template>
