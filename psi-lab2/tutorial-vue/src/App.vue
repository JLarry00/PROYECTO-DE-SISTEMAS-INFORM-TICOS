<template>
  <div>
    <h1>Usando Router</h1>
    <router-view></router-view>
    <a class="button">
      <router-link to="/">Click to access Home  </router-link>
    </a>

    <a class="button">
      <router-link to="/about">Click to access About  </router-link>
    </a>

    <a class="button">
      <router-link to="/faq">Click to access FAQ  </router-link>
    </a>
  </div>
</template>

<script setup>
  import { RouterLink, RouterView } from 'vue-router';
</script>