<template>
  <div>
    <div class="overlay-background" v-if="isVisible"></div>
  	<section class="overlay" v-if="isVisible">
        <h1>{{ title }}</h1>
        <slot></slot>
    </section>
  </div>
</template>

<script>
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