<template>
  <span>{{ displayValue }}</span>
</template>

<script>
import TWEEN from '@tweenjs/tween.js'

export default {
  name: 'AnimatedNumber',

  data () {
    return {
      tweeningValue: 0
    }
  },

  computed: {
    displayValue () {
      if (this.format) {
        return this.format(parseInt(this.tweeningValue))
      }

      return this.tweeningValue
    }
  },

  props: {
    value: {
      type: [String, Number],
      required: true
    },
    decimals: {
      type: Number,
      required: false,
      default: 0
    },
    format: {
      required: false
    }
  },

  watch: {
    value: function (newValue, oldValue) {
      this.tween(oldValue, newValue)
    }
  },

  mounted: function () {
    this.tween(0, this.value)
  },

  methods: {
    tween: function (startValue, endValue) {
      function animate () {
        if (TWEEN.update()) {
          requestAnimationFrame(animate)
        }
      }

      new TWEEN.Tween({ tweeningValue: startValue })
        .to({ tweeningValue: endValue }, 500)
        .onUpdate(params => {
          this.tweeningValue = params.tweeningValue.toFixed(this.decimals)
        })
        .start()

      animate()
    }
  }
}
</script>