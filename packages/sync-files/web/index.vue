<template>
  <label id="drop-zone" class="file-area" @drop="onDrop" @dragover="onDragover">
    将文件拖到此处传输
    <input type="file" id="file-input" multiple accept="image/*" />
  </label>
</template>
<script lang="ts" setup>
const onDrop = async (event: DragEvent) => {
  event.preventDefault()
  const items = event.dataTransfer.items
  const formData = new FormData()

  // 把文件 append 到 FormData
  // 第一个参数是后端接收时的 key

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const file = item.getAsFile()
    formData.append('files', file)
  }

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData, // FormData 会自动设置 Content-Type: multipart/form-data
  })
}
const onDragover = (event: DragEvent) => {
  // e.preventDefault()
  // console.log('debugger 🐛 1', e)
}
</script>
<style>
.file-area {
  background-color: red;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  position: relative;
}

.file-area input {
  width: 100%;
  height: 100%;
  position: absolute;
  opacity: 0;
}
</style>
