<template>
    <!--<button v-model="selectedData">1</button>-->
    <div>
        <button v-for="button in buttons" @click="toggleVal" :value="button.value">{{button.text}}</button>
        <p>{{ selectedData }}</p>
    </div>
</template>

<script>
    export default {
        props:['buttons'],
        data() {
            return {
                selectedData: []
            }
        },
        methods: {
            toggleVal: function(e) {
                let val = e.target.value;
                let index = this.selectedData.indexOf(val);
                console.log(index);
                if (index === -1) {
                    this.selectedData.push(val);
                } else {
                    this.selectedData.splice(index, 1);
                }
            }
        }
    }
</script>