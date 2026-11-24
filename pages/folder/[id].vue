<script setup>const route = useRoute()</script>
<template><FolderView :id="route.params.id" :key="route.params.id" /></template>
