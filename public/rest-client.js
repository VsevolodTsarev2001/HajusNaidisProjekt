const vue = Vue.createApp({
    data(){
        return{
            games: []
        }
    },
    async created() {
        this.games = await (await fetch('http://localhost:8080/games')).json();
    }
}).mount('#app')