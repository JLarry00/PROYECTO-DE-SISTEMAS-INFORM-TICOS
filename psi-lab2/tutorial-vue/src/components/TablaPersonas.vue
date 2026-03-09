<!-- src/components/TablaPersonas.vue -->
<template>
  <div id="tabla-personas">
    <div
      v-if="!personas.length"
      class="alert alert-info"
      role="alert"
    >
      No se han encontrado personas
    </div>
    <div v-else>
      <div
        v-if="result && result.action === 'update' && !result.success"
        class="alert alert-danger"
        role="alert"
      >
        {{ result.message }}
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="persona in personas"
            :key="persona.id"
          >
            <td v-if="editando === persona.id">
              <input
                id="persona.nombre"
                v-model="personaEditada.nombre"
                type="text"
                class="form-control"
                data-cy="persona-nombre"
              >
            </td>
            <td v-else>
              {{ persona.nombre }}
            </td>
            <td v-if="editando === persona.id">
              <input
                v-model="personaEditada.apellido"
                type="text"
                class="form-control"
              >
            </td>
            <td v-else>
              {{ persona.apellido }}
            </td>
            <td v-if="editando === persona.id">
              <input
                v-model="personaEditada.email"
                type="email"
                class="form-control"
              >
            </td>
            <td v-else>
              {{ persona.email }}
            </td>
            <td v-if="editando === persona.id">
              <button
                class="btn btn-success"
                data-cy="save-button"
                @click="guardarPersona(persona)"
              >
                &#x1F5AB; Guardar
              </button>
              <button
                class="btn btn-secondary ml-2"
                data-cy="cancel-button"
                @click="cancelarEdicion(persona)"
              >
                &#x1F5D9; Cancelar
              </button>
            </td>
            <td v-else>
              <button
                class="btn btn-info"
                data-cy="edit-button"
                @click="editarPersona(persona)"
              >
                &#x1F58A; Editar
              </button>
              <button
                class="btn btn-danger ml-2"
                data-cy="delete-button"
                @click="$emit('delete-persona', persona.id)"
              >
                &#x1F5D1; Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
  import { ref } from "vue";

  defineOptions({
    name: 'TablaPersonas',
  });

  const props = defineProps({
    personas: {type: Array, default: () => []},
    result: { type: Object, default: null },
  });
  const emit = defineEmits(['actualizar-persona', 'delete-persona']);

  const editando = ref(null);
  const personaEditada = ref(null);

  const editarPersona = (persona) => {
    personaEditada.value = { ...persona };
    editando.value = persona.id;
  };

  const guardarPersona = (persona) => {
    const p = personaEditada.value;
    if (!p.nombre.length || !p.apellido.length || !p.email.length) {
      return;
    }
    emit('actualizar-persona', editando.value, { ...p });
    editando.value = null;
  };

  // const cancelarEdicion = (persona) => {
  //   Object.assign(persona, personaEditada.value);
  //   editando.value = null;
  // };
  const cancelarEdicion = () => {
    editando.value = null;
  };
</script>

<style scoped>
  /* Estilos especificos del componente con el modificador "scoped" */
</style>