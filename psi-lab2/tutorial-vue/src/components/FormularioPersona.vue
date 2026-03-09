<!-- FormularioPersona.vue -->
<template>
  <!-- Contenedor principal del componente -->
  <div id="formulario-persona">
    <!-- Formulario con campos para ingresar informacion de una persona -->
    <form @submit.prevent="enviarFormulario">
      <div class="container">
        <!-- Primera fila con campos de nombre, apellido y email -->
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <!-- Etiqueta y campo de entrada para el nombre con binding bidireccional v-model -->
              <label>Nombre</label>
              <input
                ref="nombre"
                v-model="persona.nombre"
                type="text"
                class="form-control"
                data-cy="name"
                :class="{ 'is-invalid': procesando && nombreInvalido }"
                @focus="resetEstado"
              >
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <!-- Etiqueta y campo de entrada para el apellido con binding bidireccional v-model -->
              <label>Apellido</label>
              <input
                v-model="persona.apellido"
                type="text"
                class="form-control"
                data-cy="surname"
                :class="{ 'is-invalid': procesando && apellidoInvalido }"
                @focus="resetEstado"
              >
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <!-- Etiqueta y campo de entrada para el correo electronico con binding bidireccional v-model 
               * La expresion regular es para validar el email
                pattern="^[^\s@]+@[^\s@]+\.[a-zA-Z0-9]{2,63}$"
                title="Por favor, introduce un email válido"-->
              <label>Email</label>
              <input
                v-model="persona.email"
                type="email"
                pattern="^[^\s@]+@[^\s@]+\.[a-zA-Z0-9]{2,63}$"
                title="Por favor, introduce un email válido"
                class="form-control"
                data-cy="email"
                :class="{ 'is-invalid': procesando && emailInvalido }"
                @focus="resetEstado"
              >
            </div>
          </div>
        </div>
        <br>
        <!-- Segunda fila con un boton para agregar persona -->
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <!-- Boton para agnadir persona -->
              <button
                class="btn btn-primary"
                data-cy="add-button"
              >
                Agnadir persona
              </button>
            </div>
          </div>
        </div>
      </div>
      <br>
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <div
              v-if="error && procesando"
              class="alert alert-danger"
              role="alert"
            >
              Debes rellenar todos los campos!
            </div>
            <div
              v-if="correcto"
              class="alert alert-success"
              role="alert"
            >
              La persona ha sido agregada correctamente!
            </div>
            <div
              v-if="result && result.action === 'add' && !result.success"
              class="alert alert-danger"
              role="alert"
            >
              {{ result.message }}
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted } from 'vue';

defineOptions({
    name: 'FormularioPersona',
});

const procesando = ref(false);
// const correcto = ref(false);
const error = ref(false);  
const instance = getCurrentInstance(); 

const nombre = ref(null);
const persona = ref({
    nombre: '',
    apellido: '',
    email: '',
});

const props = defineProps({
  result: { type: Object, default: null },
});
const correcto = computed(() => props.result != null && props.result.action === 'add' && props.result.success);

const emit = defineEmits(['add-persona', 'clear-add-result']);

const enviarFormulario = () => {
  procesando.value = true;
  resetEstado();

  // Comprobamos la presencia de errores
  if (nombreInvalido.value || apellidoInvalido.value || emailInvalido.value) {
    error.value = true;
    return;
  }

  emit('add-persona', persona.value);
  const input = instance.refs.nombre;
  input?.focus();


  // Limpiamos el formulario
  persona.value = {
    nombre: '',
    apellido: '',
    email: '',
  };

  error.value = false;
  // correcto.value = true;
  procesando.value = false;
};

const resetEstado = () => {
  // correcto.value = false;
  error.value = false;
};

onMounted(() => {
  // Enfocamos el campo nombre al montar el componente
    const input = instance.refs.nombre;
    input?.focus();
});

//Computed
const nombreInvalido = computed(() => persona.value.nombre.length < 1);
const apellidoInvalido = computed(() => persona.value.apellido.length < 1);
const emailInvalido = computed(() => persona.value.email.length < 1);
</script>

<style scoped>
form {
    margin-bottom: 2rem;
}
</style>