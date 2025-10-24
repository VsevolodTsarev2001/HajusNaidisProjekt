const vue = Vue.createApp({
    data() {
        return {
            gameInModal: { name: null },
            games: [],
            error: "",

            // Инлайн-редактирование
            editId: null,
            editBuffer: { name: "", price: "", type: "" },
            originalBackup: null
        }
    },

    async created() {
        await this.loadGames();
    },

    methods: {
        async loadGames() {
            const res = await fetch('http://localhost:8080/games');
            this.games = await res.json();
        },

        async getGame(id) {
            this.gameInModal = await (await fetch(`http://localhost:8080/games/${id}`)).json();
            const modal = new bootstrap.Modal(document.getElementById('gameInfoModal'));
            modal.show();
        },

        startEdit(game) {
            this.editId = (game.id ?? game._id);

            this.editBuffer = { name: game.name, price: game.price, type: game.type };

            this.originalBackup = { id: game.id, _id: game._id, name: game.name, price: game.price, type: game.type };
        },
        async saveEdit() {
            this.error = "";

            // Отправляем только те поля, которые реально изменились
            const payload = {};
            if (this.editBuffer.name !== this.originalBackup.name) payload.name = this.editBuffer.name;
            if (Number(this.editBuffer.price) !== Number(this.originalBackup.price)) payload.price = Number(this.editBuffer.price);
            if (this.editBuffer.type !== this.originalBackup.type) payload.type = this.editBuffer.type;

            // Если ничего не поменяли — просто выходим из режима редактирования
            if (Object.keys(payload).length === 0) {
                this.editId = null;
                this.editBuffer = { name: "", price: "", type: "" };
                this.originalBackup = null;
                return;
            }

            try {
                const res = await fetch(`http://localhost:8080/games/${this.editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const text = await res.text();
                if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${text}`);

                const updated = text ? JSON.parse(text) : null;

                // Обновляем строку локально (по id или _id)
                const idx = this.games.findIndex(g => (g.id ?? g._id) === (updated.id ?? updated._id));
                if (idx !== -1) this.games[idx] = updated;

                // Выход из режима редактирования
                this.editId = null;
                this.editBuffer = { name: "", price: "", type: "" };
                this.originalBackup = null;

            } catch (e) {
                this.error = `Error while saving: ${e.message}`;
                console.error(e);
            }
        },

        cancelEdit() {
            if (this.originalBackup) {
                const idx = this.games.findIndex(g => g.id === this.originalBackup.id);
                if (idx !== -1) this.games[idx] = { ...this.originalBackup };
            }
            this.editId = null;
            this.editBuffer = { name: "", price: "", type: "" };
            this.originalBackup = null;
        }
    }
}).mount('#app')
