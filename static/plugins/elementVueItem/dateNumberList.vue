<template>
  <div class="dateNumberArea">
    <span class="numberItem">{{ _arr[0] }}</span>
    <span class="numberItem">{{ _arr[1] }}</span>
    <span class="sprite">-</span>
    <span class="numberItem">{{ _arr[2] }}</span>
    <span class="numberItem">{{ _arr[3] }}</span>
  </div>
</template>

<script>
export default {
  props: {
    time: Object,
  },
  data() {
    return {
      show: true,
      _arr: [0, 0, 0, 0],
      arr: [0, 0, 0, 0],
      temp: [0, 0, 0, 0],
      date: new Date(),
    };
  },
  methods: {
    setDate(n) {
      var date = new Date().getTime();
      date -= n * 24 * 60 * 60 * 1000;
      this.updateData(date);
      this.updateLabels(100);
    },
    updateLabels(n) {
      n = n || 500;
      if (this._arr[0] % 10 !== this.arr[0]) {
        for (var i = 0; i < this._arr.length; i++) {
          this._arr[i]++;
          this._arr[i] = this._arr[i] % 10;
        }
        var _self = this;
        setTimeout(function () {
          _self.updateLabels(n);
        }, n);
      }
    },
    updateData(date) {
      date = date || this.date || new Date();
      if (typeof date === "number" || typeof date === "string") {
        date = new Date(date);
      }
      var arr = this.arr;
      var m = date.getMonth() + 1;
      var d = date.getDate();
      arr[0] = Math.floor(m / 10) || 0;
      arr[1] = m % 10;
      arr[2] = Math.floor(d / 10) || 0;
      arr[3] = d % 10;
      for (var i = 0; i < arr.length; i++) {
        this._arr[i] = arr[i] + 1;
      }
    },
  },
  mounted() {
    this.updateData(this.time);
    this.updateLabels(100);
  },
};
</script>

<style scoped>
.dateNumberArea {
}

.dateNumberArea > span.sprite {
  color: #fff;
  display: inline-block;
  margin-right: 3px;
}

/* .dateNumberArea>.numberItem::before {
  content: "";
  display: inline-block;
  width: 100%;
  height: 2px;
  opacity: 0.9;
  background: #2C2D30;
  position: absolute;
  z-index: 3;
  left: 0px;
  top: 11px;
} */

.dateNumberArea > .numberItem {
  position: relative;
  font-size: 18px;
  font-family: DINAlternate-Bold, "DINAlternate-Bold" !important;
  display: inline-block;
  text-align: center;
  width: 15px;
  height: 23px;
  line-height: 23px;
  background-image: url(/images/numberBg.svg);
  background-position: center;
  vertical-align: middle;
  margin-right: 3px;
}
</style>
