import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const COUNTER_LOCAL_STORAGE_KEY = 'localCounter';

const getCount = () => {
  const storedCounter = localStorage.getItem(
    COUNTER_LOCAL_STORAGE_KEY
  );
  return storedCounter ? JSON.parse(storedCounter) : 0;
};

export const useCounterStore = defineStore('counter', () => {
  const count = ref(getCount());

  const singleCount = computed(() => count.value);

  const increment = () => {
    count.value++;
    localStorage.setItem(
      COUNTER_LOCAL_STORAGE_KEY,
      JSON.stringify(
        count.value
      )
    );
  };

  return {
    count,
    singleCount,
    increment
  };
});

if (localStorage.getItem('state')) {
  pinia.state.value = JSON.parse(localStorage.getItem('state'));
}