<!-- -->
<template>
  <div
    id="app"
    class="container"
  >
    <div class="row">
      <div class="col-md-12">
        <h1>Personas</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- <formulario-persona @add-persona="agregarPersona" /> -->
        <!-- Así se pasan las variables y funciones al componente -->
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
      </div>
    </div>
    <div>
      <p>Count is {{ store.count }}</p>
    </div>
  </div>
</template>

<script setup>
  import TablaPersonas from '@/components/TablaPersonas.vue'
  import FormularioPersona from '@/components/FormularioPersona.vue'
  import { ref, onMounted } from 'vue';
  import { useCounterStore } from '@/stores/counter'; // usar en método correspondiente

  //const API_URL = 'http://localhost:8001/api/v1/personas/';

  const API_URL = import.meta.env.VITE_DJANGOURL;
  console.log(API_URL);
  defineOptions({
    name: 'app',
  });

  const store = useCounterStore();

  const personas = ref([]);
  // requestResult = null | { success: true } | { success: false, message: string }
  const requestResult = ref(null);

  const formatearErrorDjango = (data, mensajePorDefecto) => {
    let message = mensajePorDefecto;

    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0];      // p.ej. "email"
      const firstValue = data[firstKey];          // p.ej. ["Enter a valid email address."]

      let firstMessage = '';
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        firstMessage = firstValue[0];
      } else if (typeof firstValue === 'string') {
        firstMessage = firstValue;
      }

      if (firstMessage) {
        message = `${firstKey}: ${firstMessage}`;
      }
    }

    return message;
  };

  const listadoPersonas = async () => {
    // Metodo para obtener un listado de personas
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

      if (!response.ok) {
        const message = formatearErrorDjango(personaCreada, 'No se ha podido agregar la persona.');
        requestResult.value = {
          action: 'add',
          success: false,
          message,
        };
        return;
      }

      if (personaCreada != null) {
        personas.value = [...personas.value, personaCreada];
      }
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
    // Metodo para eliminar una persona
    try {
      await fetch(API_URL + persona_id + '/', {
        method: "DELETE"
      });
      
      personas.value= personas.value.filter(u => u.id !== persona_id);
    } catch (error) {
      console.error(error);
    }      
  };

  const actualizarPersona = async (id, personaActualizada) => {
    // Metodo para actualizar una persona
    try {
        const response = await fetch(API_URL + personaActualizada.id + '/', {
            method: 'PUT',
            body: JSON.stringify(personaActualizada),
              headers: { 'Content-type': 'application/json; charset=UTF-8' },
            });

        const personaActualizadaJS = await response.json();
        if (!response.ok) {
          const message = formatearErrorDjango(personaActualizadaJS,'No se ha podido actualizar la persona.');
          requestResult.value = {
            action: 'update',
            success: false,
            message,
          };
          return;   // no tocar la lista
        }

        if (response.ok) {
          personas.value = personas.value.map(u => (u.id === personaActualizada.id ? personaActualizadaJS : u));
        }
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

  // Fetch data when the component is mounted
  onMounted(() => {
    listadoPersonas();
  });
</script>

<style>
  button {
    background: #009435;
    border: 1px solid #009435;
  }
</style>