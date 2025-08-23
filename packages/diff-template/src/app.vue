<template>
  <RouterView />
</template>

<script lang="ts" setup>
import { useToggleGitDiffFeature } from './model/git-diff'
import { useKeydown } from './utils/use-keydown'

const toggleGitDiffFeature = useToggleGitDiffFeature()
useKeydown('KeyM', toggleGitDiffFeature)
</script>
