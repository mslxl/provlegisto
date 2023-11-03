<script setup lang="ts">
import Menubar from "../../components/Menubar/Menubar.vue"
import Notification from "../../components/Notification/Notifcation.vue"
import EditorInner from "./EditorInner.vue"
import { useDocumentTitle } from "../../hooks/window"
import { NSpin } from "naive-ui"

useDocumentTitle("Provlegisto")
</script>

<template>
  <Menubar />
  <Notification>
    <Suspense>
      <template #fallback>
        <NSpin />
      </template>
      <template #default>
        <EditorInner />
      </template>
    </Suspense>
  </Notification>
</template>
../../hooks/window
