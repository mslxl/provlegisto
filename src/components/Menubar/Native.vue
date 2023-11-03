<script setup lang="tsx">
import bus from "../../lib/bus"
import { MenubarContent, MenubarItem, MenubarMenu, MenubarPortal, MenubarRoot, MenubarTrigger } from "radix-vue"
import commands from "./command"
</script>
<template>
  <MenubarRoot class="prov-menubar root">
    <MenubarMenu v-for="menu of commands" v-bind:key="menu.name">
      <MenubarTrigger class="prov-menubar trigger">{{ menu.name }}</MenubarTrigger>
      <MenubarPortal>
        <MenubarContent class="prov-menubar content">
          <MenubarItem
            class="prov-menubar item"
            v-for="item of menu.children"
            v-bind:key="item.name"
            @select="() => bus.emit(`menu:${item.command}`)"
          >
            {{ item.name }}
          </MenubarItem>
        </MenubarContent>
      </MenubarPortal>
    </MenubarMenu>
  </MenubarRoot>
</template>

<style lang="scss">
.prov-menubar.trigger,
.prov-menubar.sub-trigger {
  all: unset;
}
.prov-menubar.root {
  display: flex;
  background-color: #e8e8e8;
  padding:
    0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
}
.prov-menubar.trigger {
  padding: 4px 12px;
  outline: none;
  user-select: none;
  font-weight: 500;
  line-height: 1;

  font-size: small;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
}
.prov-menubar.trigger[data-state="open"] {
  background-color: #e8e8e8;
}

.prov-menubar.content,
.prov-menubar.subcontent {
  min-width: 220px;
  background-color: #f8f8f8;
  padding: 5px;
  box-shadow:
    0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform, opacity;
}
.prov-menubar.item,
.prov-menubar.subtrigger {
  all: unset;
  font-size: small;
  line-height: 1;
  display: flex;
  align-items: center;
  height: 25px;
  padding: 0 10px;
  position: relative;
  user-select: none;
}

.prov-menubar.item.inset,
.prov-menubar.subtrigger.inset {
  padding-left: 20px;
}

.prov-menubar.item[data-state="open"],
.prov-menubar.subtrigger[data-state="open"],
.prov-menubar.item[data-highlighted],
.prov-menubar.subtrigger[data-highlighted] {
  background-color: #e8e8e8;
}

.prov-menubar.separator {
  height: 1px;
  background-color: rgba(5, 5, 5, 0.6);
  margin: 5px;
}

.prov-menubar.right-slot {
  margin-left: auto;
  padding-left: 20px;
}
</style>
../../lib/bus ../../lib/bus
