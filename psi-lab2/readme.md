## Guía de examen – Práctica 2 (PSI)

Resumen práctico para entender y modificar el proyecto `psi-lab2` (Django + Vue + PostgreSQL + Render).

---

## 1. Arquitectura general

- **Backend**: Django 5.2.2 + Django REST Framework
  - Proyecto: `persona/`
  - App: `api/`
  - API principal: `GET/POST/PUT/DELETE /api/v1/personas/`
  - BD: PostgreSQL (Neon), configurada con `DATABASE_URL` en `persona/.env`.
- **Frontend**: Vue 3.4 + Vite
  - Proyecto: `tutorial-vue/`
  - Vista principal: `src/views/HomeView.vue`
  - Consume el API usando `fetch` contra `import.meta.env.VITE_DJANGOURL`.
  - Formularios y tabla en `FormularioPersona.vue` y `TablaPersonas.vue`.
- **Despliegue**:
  - Frontend: Static Site en Render (build Vite).
  - Backend: Web Service en Render (Gunicorn).
  - BD: Neon.tech (PostgreSQL).

Estructura mínima:

```text
psi-lab2/
  README.md
  requirements.txt
  runtime.txt              # python-3.11.7 (si se usa para Render)
  tutorial-vue/            # frontend Vue
    src/
      views/HomeView.vue
      components/FormularioPersona.vue
      components/TablaPersonas.vue
      ...
    cypress/               # tests E2E
    .env.development
    .env.production
    package.json
  persona/                 # backend Django
    persona/               # settings, urls, wsgi
    api/                   # models, views, serializers
    manage.py
    build.sh
    .env
```

---

## 2. Backend Django (persona/)

### 2.1. Modelo principal

`persona/api/models.py`:

```python
from django.db import models

class Persona(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.nombre
```

Puntos clave:
- `ordering = ['id']` asegura que el listado salga ordenado por id ascendente.
- Si en el examen te piden **nuevo campo**, se añade aquí, se migra y se actualiza el frontend.

### 2.2. Serializer

`persona/api/serializers.py`:

```python
from .models import Persona
from rest_framework import serializers

class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        # fields = ['id', 'nombre', 'apellido', 'email']
        fields = '__all__'
```

Con `fields = '__all__'` se exponen todos los campos del modelo.
Si quisieran limitarlo, se usa la lista comentada `['id', 'nombre', 'apellido', 'email']`.

### 2.3. ViewSet y rutas

`persona/api/views.py`:

```python
from .models import Persona
from .serializers import PersonaSerializer
from rest_framework import viewsets

class PersonaViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
```

`persona/persona/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from api import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register('personas', views.PersonaViewSet)

urlpatterns = [
    path('api/v1/', include(router.urls)),
    path('admin/', admin.site.urls),
]
```

Resumen:
- La ruta raíz del API es `/api/v1/personas/`.
- `ModelViewSet` ya da soporte a `GET/POST/PUT/DELETE`.

### 2.4. Configuración de BD y CORS

`persona/persona/settings.py` (fragmento relevante):

```python
from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar .env de persona/.env
load_dotenv(BASE_DIR / '.env')

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'persona',
            'USER': 'alumnodb',
            'PASSWORD': 'alumnodb',
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }

RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

CORS_ORIGIN_ALLOW_ALL = False
CORS_ORIGIN_WHITELIST = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://two-tutorial-vue-99-2311-2026-1.onrender.com',
    'https://two-persona-99-2311-2026-2.onrender.com',
]
```

Claves:
- **Local** sin `DATABASE_URL` → BD PostgreSQL local con usuario/contraseña `alumnodb`.
- **Producción** con `DATABASE_URL` (Neon) → se usa esa cadena de conexión.
- `RENDER_EXTERNAL_HOSTNAME` se añade a `ALLOWED_HOSTS` para que Django acepte peticiones desde Render.
- `CORS_ORIGIN_WHITELIST` permite que Vue (local y Render) llame al backend.

### 2.5. Script de build para Render

`persona/build.sh`:

```bash
#!/bin/bash
set -o errexit

pip install -r ../requirements.txt
python manage.py flush --no-input
python manage.py collectstatic --no-input
python manage.py migrate
```

En Render:
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn persona.wsgi:application --bind 0.0.0.0:$PORT`

### 2.6. Comandos Django que debes saber

Desde `psi-lab2/persona`:

- Aplicar migraciones:
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  ```
- Arrancar servidor de desarrollo:
  ```bash
  python manage.py runserver 8001
  ```
- Crear superusuario:
  ```bash
  python manage.py createsuperuser
  ```

---

## 3. Frontend Vue (tutorial-vue/)

### 3.1. Entrada de la app

`tutorial-vue/src/main.js`:

```javascript
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

app.config.devtools = true // Devtools activas (también en producción)

app.mount('#app')
```

Puntos de examen posibles:
- Saber dónde se activa Vue Router (`app.use(router)`).
- Saber cómo se activa Pinia (`createPinia`).
- Saber dónde se habilitan las DevTools (`app.config.devtools = true`).

### 3.2. Rutas

`tutorial-vue/src/router/index.js` (esquema):

- Tiene rutas para:
  - `/` → `HomeView.vue` (gestión de personas).
  - `/about` → `AboutView.vue`
  - `/faq` → `FaqView.vue`

`App.vue`:
- Muestra `router-view` y enlaces `router-link` a `/`, `/about`, `/faq`.

### 3.3. Vista principal y llamadas al API

`tutorial-vue/src/views/HomeView.vue` (fragmento clave):

```vue
<template>
  <div id="app" class="container">
    ...
    <formulario-persona
      :result="requestResult"
      @add-persona="agregarPersona"
      @clear-add-result="requestResult = null"
    />
    <tabla-personas
      :personas="personas"
      :result="requestResult"
      @delete-persona="eliminarPersona"
      @actualizar-persona="actualizarPersona"
    />
    <div>
      <p>Count is {{ store.count }}</p>
    </div>
  </div>
</template>

<script setup>
import TablaPersonas from '@/components/TablaPersonas.vue'
import FormularioPersona from '@/components/FormularioPersona.vue'
import { ref, onMounted } from 'vue';
import { useCounterStore } from '@/stores/counter';

const API_URL = import.meta.env.VITE_DJANGOURL;

defineOptions({ name: 'app' });

const store = useCounterStore();
const personas = ref([]);
const requestResult = ref(null); // { action, success, message }
```

Métodos principales:

```javascript
const listadoPersonas = async () => {
  try {
    const response = await fetch(API_URL);
    personas.value = await response.json();
  } catch (error) {
    console.error(error);
  }      
};

const agregarPersona = async (persona) => {
  requestResult.value = null;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(persona),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    });
    const personaCreada = await response.json();
    ...
    if (!response.ok) {
      const message = formatearErrorDjango(personaCreada, 'No se ha podido agregar la persona.');
      requestResult.value = { action: 'add', success: false, message };
      return;
    }
    ...
    personas.value = [...personas.value, personaCreada];
    store.increment();
    requestResult.value = {
      action: 'add',
      success: true,
      message: 'La persona ha sido agregada correctamente.',
    };
  } catch (error) {
    console.error(error);
    requestResult.value = {
      action: 'add',
      success: false,
      message: 'Error de red. Inténtalo de nuevo más tarde.',
    };
  }
};

const eliminarPersona = async (persona_id) => {
  try {
    await fetch(API_URL + persona_id + '/', { method: "DELETE" });
    personas.value= personas.value.filter(u => u.id !== persona_id);
  } catch (error) {
    console.error(error);
  }      
};

const actualizarPersona = async (id, personaActualizada) => {
  try {
      const response = await fetch(API_URL + personaActualizada.id + '/', {
          method: 'PUT',
          body: JSON.stringify(personaActualizada),
          headers: { 'Content-type': 'application/json; charset=UTF-8' },
      });
      const personaActualizadaJS = await response.json();
      ...
      if (!response.ok) {
        const message = formatearErrorDjango(personaActualizadaJS,'No se ha podido actualizar la persona.');
        requestResult.value = { action: 'update', success: false, message };
        return;   // no tocar la lista
      }
      personas.value = personas.value.map(
        u => (u.id === personaActualizada.id ? personaActualizadaJS : u)
      );
      requestResult.value = {
        action: 'update',
        success: true,
        message: 'La persona ha sido actualizada correctamente.',
      };
  } catch (error) {
    console.error(error);
    requestResult.value = {
      action: 'update',
      success: false,
      message: 'Error de red. Inténtalo de nuevo más tarde.',
    };
  }      
};

onMounted(() => {
  listadoPersonas();
});
</script>
```

Posibles preguntas/cambios de examen:
- Añadir un nuevo campo (por ejemplo `telefono`) a la persona:
  - Cambiar modelo Django, migrar.
  - Leer/escribir el nuevo campo en `FormularioPersona.vue`, `TablaPersonas.vue` y `HomeView.vue`.
- Cambiar mensajes de error o el formato de `formatearErrorDjango`.
- Cambiar la URL base (`VITE_DJANGOURL`) o derivarla de otra variable.

### 3.4. Formulario y tabla

`FormularioPersona.vue`:
- Tiene `data-cy="name"`, `data-cy="surname"`, `data-cy="email"` y `data-cy="add-button"` (Cypress).
- Valida que los tres campos estén rellenos antes de emitir `add-persona`.

`TablaPersonas.vue`:
- Enseña la lista de personas.
- Usa `editando` y `personaEditada` para gestionar la edición.
- Botones:
  - `data-cy="edit-button"`, `save-button`, `cancel-button`, `delete-button`.
- Emite `actualizar-persona` y `delete-persona`.

---

## 4. Variables de entorno

### 4.1. Django – persona/.env

Ejemplo típico:

```env
DATABASE_URL=postgresql://...  # cadena de Neon
RENDER_EXTERNAL_HOSTNAME=two-persona-99-2311-2026-2.onrender.com
```

### 4.2. Vue – tutorial-vue/.env.development

```env
VITE_DJANGOURL=http://localhost:8001/api/v1/personas/

# 0: producción (Render), 1: desarrollo (localhost)
VITE_LOCAL=1
VITE_PROD_BASE_URL=https://two-tutorial-vue-99-2311-2026-1.onrender.com
VITE_DEV_BASE_URL=http://localhost:5173
```

Interpretación:
- `VITE_DJANGOURL` se usa en `HomeView.vue` como `API_URL`.
- `VITE_LOCAL` controla el `baseUrl` de Cypress:
  - `'1'` → `VITE_DEV_BASE_URL` (localhost).
  - `'0'` → `VITE_PROD_BASE_URL` (Render).

`cypress.config.js`:

```javascript
const { defineConfig } = require('cypress')
require('dotenv').config({path: '.env.development'})

const VITE_LOCAL = process.env.VITE_LOCAL;

let baseUrl = '';
if (VITE_LOCAL === '1') {
  baseUrl = process.env.VITE_DEV_BASE_URL;
} else {
  baseUrl = process.env.VITE_PROD_BASE_URL;
}

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: baseUrl
  },
  ...
})
```

---

## 5. Tests Cypress

Ubicación: `tutorial-vue/cypress/e2e/`

- Tests **static**: para la primera parte (sin API REST real).
- Tests **dynamic**: para la versión final que usa el API Django.

Comandos desde `tutorial-vue`:

- Modo gráfico:
  ```bash
  npx cypress open
  ```
- Línea de comandos (todos los E2E):
  ```bash
  npx cypress run
  ```
- Test concreto (ej. primer dynamic):
  ```bash
  npx cypress run --spec cypress/e2e/dynamic-01-initial-check.cy.js
  ```

Para correr tests **dynamic** contra:

- **App local**:
  - En `.env.development`: `VITE_LOCAL=1`, `VITE_DEV_BASE_URL=http://localhost:5173`.
  - Backend local en `http://localhost:8001`.
  - Comando:
    ```bash
    npx cypress run --spec "cypress/e2e/dynamic*.cy.js"
    ```

- **App en Render** (lo que pide el enunciado):
  - En `.env.development`: `VITE_LOCAL=0`, `VITE_PROD_BASE_URL=https://two-tutorial-vue-99-2311-2026-1.onrender.com`.
  - Comando:
    ```bash
    npx cypress run --spec "cypress/e2e/dynamic*.cy.js"
    ```

---

## 6. Despliegue en Render

### 6.1. Backend (persona)

- **Root Directory**: `psi-lab2/persona`
- **Build Command**:
  ```bash
  ./build.sh
  ```
- **Start Command**:
  ```bash
  gunicorn persona.wsgi:application --bind 0.0.0.0:$PORT
  ```
- **Python**:
  - Opción recomendada: `persona/runtime.txt` con `python-3.11.7`.

Variables de entorno en Render:
- `DATABASE_URL` (Neon).
- `RENDER_EXTERNAL_HOSTNAME`.

### 6.2. Frontend (tutorial-vue)

- **Root Directory**: `psi-lab2/tutorial-vue`
- **Build Command**:
  ```bash
  npm install
  npm run build
  ```
- **Publish Directory**: `dist`
- Variables de entorno:
  - `VITE_DJANGOURL=https://two-persona-99-2311-2026-2.onrender.com/api/v1/personas/`

---

## 7. Cambios típicos de examen

Algunas operaciones que podrían pedirte:

1. **Añadir un campo nuevo** (por ejemplo `telefono`) a la persona:
   - Backend:
     - `models.py`: añadir `telefono = models.CharField(max_length=20, blank=True)`.
     - `python manage.py makemigrations && python manage.py migrate`.
   - Frontend:
     - `FormularioPersona.vue`: añadir input con `v-model="persona.telefono"`.
     - `TablaPersonas.vue`: mostrar el campo en la tabla.
     - `HomeView.vue`: al usar `persona` como objeto completo y `fields='__all__'`, suele funcionar directamente tras actualizar formularios.

2. **Cambiar la URL del API**:
   - Editar `VITE_DJANGOURL` en `.env.development` (y `.env.production`).
   - Volver a desplegar el frontend (Render) si afecta a producción.

3. **Restringir acceso a la API**:
   - Añadir una clase de permisos en `settings.py` (REST_FRAMEWORK) o en el `ViewSet`.

4. **Ajustar CORS**:
   - Modificar `CORS_ORIGIN_WHITELIST` para añadir o quitar orígenes.

5. **Ejecutar tests dynamic contra Render**:
   - `VITE_LOCAL=0` en `.env.development`.
   - `npx cypress run --spec "cypress/e2e/dynamic*.cy.js"`.

Con esta guía deberías poder entender, arrancar y modificar rápidamente tanto el backend como el frontend, y ajustar variables y tests según lo que pidan en el examen.

