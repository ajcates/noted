<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import '@mdui/icons/lock.js';
import '@mdui/icons/visibility.js';
import '@mdui/icons/visibility-off.js';

const authStore = useAuthStore();
const password = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  if (password.value) {
    await authStore.login(password.value);
  }
};

defineExpose({
  password,
  handleLogin
});
</script>

<template>
  <div class="login-container">
    <mdui-card class="login-card">
      <div class="login-header">
        <mdui-icon-lock class="lock-icon"></mdui-icon-lock>
        <h2>noted</h2>
        <p>Enter password to continue</p>
      </div>

      <mdui-text-field
        label="Password"
        type="password"
        v-model="password"
        :toggle-password="true"
        @keyup.enter="handleLogin"
        :error="!!authStore.error"
        :helper="authStore.error || ''"
      >
        <mdui-icon-lock slot="icon"></mdui-icon-lock>
      </mdui-text-field>

      <div class="login-actions">
        <mdui-button 
          full-width 
          @click="handleLogin" 
          :loading="authStore.loading"
        >
          Login
        </mdui-button>
      </div>
    </mdui-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--mdui-color-background);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-header {
  text-align: center;
}

.lock-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--mdui-color-primary);
}

h2 {
  margin: 0;
  font-size: 24px;
}

p {
  margin: 8px 0 0;
  opacity: 0.7;
}

.login-actions {
  margin-top: 8px;
}
</style>
