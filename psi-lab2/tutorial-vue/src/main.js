import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// import './assets/main.css'

import "../node_modules/bootstrap/dist/js/bootstrap.js"
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.devtools = true // Enable devtools in production (use with caution)

app.mount('#app')