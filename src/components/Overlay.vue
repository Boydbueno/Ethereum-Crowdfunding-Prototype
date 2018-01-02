<template>
  <div>
    <div class="overlay-background" v-if="isVisible"></div>
    <i-card class="overlay" v-if="isVisible">
      <p slot="title">{{ title }}</p>
      <slot></slot>
    </i-card>
  </div>
</template>

<script>
import { Card } from 'iview'

export default {
  name: 'Overlay',

  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String
    }
  },

  components: {
    'i-card': Card
  }
}
</script>

<style lang="scss" scoped>
  .overlay-background {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .overlay {
    position: absolute;
    z-index: 110;
    width: 600px;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    padding: 15px;
    background-color: white;
    box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.2);
  }
</style>