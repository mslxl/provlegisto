<script setup lang="ts">
import { type NotificationType, useNotification } from "naive-ui"
import bus from "../../bus"
import { onMounted, onUnmounted } from "vue"
export interface NotifyBusMsg {
  title: string
  content: string
}

const notification = useNotification()
function notifyBus(ty: NotificationType, msg: NotifyBusMsg): void {
  notification[ty]({
    content: msg.title,
    meta: msg.content,
    duration: 3000,
    keepAliveOnHover: true,
  })
}

const notifyType = ["info", "success", "warning", "error"]
onMounted(() => {
  for (const ty of notifyType) {
    bus.on(`notify:${ty}`, (value) => {
      notifyBus(ty as NotificationType, value as NotifyBusMsg)
    })
  }
})

onUnmounted(() => {
  for (const ty of notifyType) {
    bus.off(`notify:${ty}`)
  }
})
</script>
