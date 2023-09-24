<script setup lang="ts">
import { RouterView } from "vue-router"
</script>

<template>
  <div class="container">
    <RouterView></RouterView>
  </div>
</template>

<style scoped>
.container {
  margin: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}
</style>
