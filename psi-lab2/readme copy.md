## 📚 Guía Maestra para Examen: Django REST + Vue.js 3

Este documento resume la arquitectura del proyecto `psi-lab2`, con un **backend en Django REST** y un **frontend en Vue.js 3 (Composition API)**, desplegados en Render con **PostgreSQL**.

---

### 1. Comandos esenciales (terminal)

#### Backend (`persona/`)

- **Instalar dependencias**

```bash
pip install -r ../requirements.txt
```

- **Crear migraciones** (si modificas `models.py`)

```bash
python manage.py makemigrations
```

- **Aplicar migraciones**

```bash
python manage.py migrate
```

- **Arrancar servidor Django**

```bash
python manage.py runserver 8001
```

La API quedará disponible en: `http://localhost:8001/api/v1/personas/`

- **Crear superusuario**

```bash
python manage.py createsuperuser
```

#### Frontend (`tutorial-vue/`)

- **Instalar dependencias**

```bash
npm install
```

- **Arrancar en desarrollo**

```bash
npm run dev
```

Estará en: `http://localhost:5173`

- **Ejecutar tests Cypress**

```bash
npx cypress open   # modo gráfico
npx cypress run    # modo terminal
```

---

### 2. Flujo del Backend (Django REST Framework)

El backend expone un **CRUD automático**. Si te piden añadir un campo o cambiar la lógica, sigue este orden:

#### 2.1 Modelo (`persona/api/models.py`)

Define la estructura de la base de datos.

```python
class Persona(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    # Ejemplo si te piden añadir un campo nuevo:
    # telefono = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ["id"]  # Ordena las respuestas de la API

    def __str__(self):
        return self.nombre
```

#### 2.2 Serializador (`persona/api/serializers.py`)

Convierte el modelo a JSON. Usar `fields = "__all__"` expone todos los campos automáticamente.

```python
class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = "__all__"  # Si añades un campo al modelo, no hace falta tocar esto
```

#### 2.3 Vistas (`persona/api/views.py`) y URLs (`persona/persona/urls.py`)

Django REST genera los endpoints (**GET, POST, PUT, DELETE**) con pocas líneas:

```python
# views.py
class PersonaViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
```

```python
# urls.py
router = routers.DefaultRouter()
router.register("personas", views.PersonaViewSet)  # Crea la ruta /api/v1/personas/

urlpatterns = [
    path("api/v1/", include(router.urls)),
]
```

---

### 3. Flujo del Frontend (Vue.js 3 + Composition API)

#### 3.1 Enrutador (`tutorial-vue/src/router/index.js`)

Si te piden crear una nueva página (por ejemplo, **Contacto**), debes añadir una nueva ruta:

```javascript
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    // Nueva ruta ejemplo:
    // {
    //   path: "/contacto",
    //   name: "contacto",
    //   component: () => import("../views/ContactoView.vue")
    // }
  ]
})
```

#### 3.2 Formulario de inserción (`FormularioPersona.vue`)

Usa `v-model` para enlazar los inputs con el estado de Vue.

**Script setup:**

```javascript
const persona = ref({
  nombre: "",
  apellido: "",
  email: ""   // Añadir aquí nuevos campos, p. ej. telefono: ""
})
```

**Template (HTML):**

```html
<input
  v-model="persona.nombre"
  type="text"
  class="form-control"
  data-cy="name"
/>
```

**Emisión del evento al padre (`HomeView.vue`):**

```javascript
emit("add-persona", persona.value)
```

#### 3.3 Visualización y edición (`TablaPersonas.vue`)

Recibe la lista de personas como `props` y las muestra con `v-for`.

```html
<tr v-for="persona in personas" :key="persona.id">
  <td v-if="editando === persona.id">
    <input v-model="personaEditada.nombre" type="text" />
  </td>
  <td v-else>
    {{ persona.nombre }}
  </td>
  <button @click="guardarPersona(persona)">Guardar</button>
</tr>
```

---

### 4. Archivos de configuración relevantes (`.env` y `settings.py`)

#### 4.1 CORS y orígenes (Django – `settings.py`)

Si Vue intenta consumir la API y el navegador la bloquea por **"CORS policy"**, es porque la URL de Vue no está en la lista blanca:

```python
CORS_ORIGIN_WHITELIST = [
    "http://localhost:5173",                      # Local
    "https://tu-url-de-render-vue.onrender.com", # Producción
]
```

#### 4.2 Variables en Vue (`tutorial-vue/.env.development`)

Si te piden cambiar a qué backend apunta el frontend:

```bash
VITE_DJANGOURL=http://localhost:8001/api/v1/personas/
```

---

### 5. 🛠 Casos prácticos de examen

#### Caso 1: Añadir el campo **"teléfono"** a las personas

- **Backend (`models.py`)**: añade el campo al modelo:

```python
telefono = models.CharField(max_length=20)
```

- **Backend (terminal)**: crea y aplica migraciones:

```bash
python manage.py makemigrations
python manage.py migrate
```

- **Frontend (`FormularioPersona.vue`)**
  - En `const persona = ref({ ... })`, añade `telefono: ""`.
  - En el template HTML, añade un nuevo `input`:

```html
<input v-model="persona.telefono" type="text" />
```

  - Si hay `computed` que validan campos vacíos (ej. `nombreInvalido`), crea:

```javascript
const telefonoInvalido = computed(() => persona.value.telefono.length < 1)
```

  y añádelo a la lógica de `enviarFormulario`.

- **Frontend (`TablaPersonas.vue`)**
  - Añade `<th>Teléfono</th>` en el bloque `<thead>`.
  - Añade una nueva columna `<td>` con la misma lógica que los demás campos, usando `persona.telefono`.

#### Caso 2: Añadir validación al API (backend)

Para validar, por ejemplo, que el email tenga un dominio específico, se usa el **serializador**:

```python
# persona/api/serializers.py
from rest_framework.exceptions import ValidationError


class PersonaSerializer(serializers.ModelSerializer):
    # ...
    def validate_email(self, value):
        if "@uam.es" not in value:
            raise ValidationError("Solo se permiten correos de la UAM")
        return value
```

#### Caso 3: Cambiar la lógica de listado (filtros en el backend)

Si te piden que la vista devuelva solo algunos registros, puedes sobrescribir `get_queryset`:

```python
class PersonaViewSet(viewsets.ModelViewSet):
    # En vez de queryset = Persona.objects.all()
    def get_queryset(self):
        return Persona.objects.filter(nombre__startswith="A")
```

#### Caso 4: Arreglar tests de Cypress que fallan

Si Cypress no encuentra elementos, revisa que los inputs y botones tengan los atributos `data-cy` correctos.

Ejemplo: Cypress buscará

```javascript
cy.get('[data-cy="name"]')
```

Si cambias el nombre del componente o del input, **mantén el atributo `data-cy="name"`** en la etiqueta HTML correspondiente.