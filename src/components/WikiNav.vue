<template>
  <div class="wiki-nav">
    <div class="nav-container">
      <router-link to="/wiki" class="nav-item" :class="{ active: $route.path === '/wiki' }">
        <i class="icon">📚</i>
        <span>知识库列表</span>
      </router-link>
      
      <router-link to="/wiki/query" class="nav-item" :class="{ active: $route.path === '/wiki/query' }">
        <i class="icon">💬</i>
        <span>知识库问答</span>
      </router-link>
      
      <div v-if="currentWiki" class="nav-item current-wiki">
        <i class="icon">📖</i>
        <span>{{ currentWiki.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { WikiItem } from '@/service/wiki'

interface Props {
  currentWiki?: WikiItem | null
}

const props = withDefaults(defineProps<Props>(), {
  currentWiki: null
})

const route = useRoute()
</script>

<style scoped>
.wiki-nav {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
}

.nav-container {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  text-decoration: none;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: #f8fafc;
  color: #374151;
}

.nav-item.active {
  background: #4096ff;
  color: white;
}

.nav-item.current-wiki {
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e5e7eb;
  cursor: default;
}

.nav-item.current-wiki:hover {
  background: #f8fafc;
}

.icon {
  font-style: normal;
  font-size: 16px;
}
</style>
