# Upload 上传

## 基础用法

<!-- example: see examples[] -->

## 文件上传

<!-- example: see examples[] -->

## API

### Attributes

| 属性名        | 说明                                      | 类型       | 默认值                    |
| ------------- | ----------------------------------------- | ---------- | ------------------------- |
| upload-type   | 设置upload上传的业务类型(导入或上传)      | `Strign`   | `upload`                  |
| type          | 设置上传附件的type属性                    | `String`   | `text`                    |
| accept        | 接受上传的文件类型                        | `String`   | `.jpg, .jpeg, .png, .gif` |
| auto-upload   | 设置是否自动上传                          | `Boolean`  | `false`                   |
| drag          | 设置是否启用拖拽上传                      | `Boolean`  | `true`                    |
| limit         | 设置最大允许上传文件个数                  | `Number`   | `20`                      |
| max-file-size | 单个文件最大大小(单位：M)                 | `Number`   | `10`                      |
| params        | 上传附件参数                              | `Object`   | —                         |
| cb            | 设置上传成功后回调方法,参数：(file,param) | `Function` | —                         |

## 类型定义

```typescript
// upload-type 上传类型
type UploadUploadType = 'upload' | 'import';

// type 上传附件的type属性
type UploadType = 'text' | 'pic';
```

## 示例源码（已内嵌，无需 press）

### UploadBasic

```vue
<template>
  <div>
    <GvUpload :params="params" type="pic"/>
  </div>
</template>

<script lang='ts' setup>
import GvUpload from '../components/GvUpload.vue';
const params = { bizPk: '1', bizType: 'templateUpload', folder: 'true@importTemplate', isHoldName: 'true' };
</script>

<style scoped >
:deep(.gv-upload__wrapper .gv-upload--text) {
  width: 100%;
}
:deep(.el-upload-dragger) {
  height: 130px;
  width: 360px;
}
:deep(.el-upload-dragger .el-icon-upload) {
  margin: 20px 0 16px;
}
:deep(.el-upload__tip) {
  margin: 10px 0;
}
:deep(.el-upload-list::-webkit-scrollbar) {
  width: 6px;
  border-radius: 4px;
}
:deep(.el-upload-list::-webkit-scrollbar-track) {
  background-color: #f1f1f1;
  border-radius: 5px;
}

:deep(.el-upload-list::-webkit-scrollbar-thumb) {
  background-color: #b8b8b8;
  border-radius: 5px;
  &:hover {
    background-color: #555;
  }
}
:deep(.el-upload-list) {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  column-gap: 10px;
  row-gap: 10px;
  height: 160px;
  overflow: auto;
  .el-upload-list__item {
    height: 148px;
  }
}
</style>
```

### UploadFile

```vue
<template>
  <div>
    <GvUpload :params="params"/>
  </div>
</template>

<script lang='ts' setup>
import GvUpload from '../components/GvUpload.vue';
const params = { bizPk: '1', bizType: 'templateUpload', folder: 'true@importTemplate', isHoldName: 'true' };
</script>

<style scoped >
:deep(.gv-upload__wrapper .gv-upload--text) {
  width: 100%;
}
:deep(.el-upload-dragger) {
  height: 130px;
  width: 360px;
}
:deep(.el-upload-dragger .el-icon-upload) {
  margin: 20px 0 16px;
}
:deep(.el-upload__tip) {
  margin: 10px 0;
}
:deep(.el-upload-list::-webkit-scrollbar) {
  width: 6px;
  border-radius: 4px;
}
:deep(.el-upload-list::-webkit-scrollbar-track) {
  background-color: #f1f1f1;
  border-radius: 5px;
}

:deep(.el-upload-list::-webkit-scrollbar-thumb) {
  background-color: #b8b8b8;
  border-radius: 5px;
  &:hover {
    background-color: #555;
  }
}
:deep(.el-upload-list) {
  display: grid;
  grid-template-columns: repeat(1, minmax(120px, 1fr));
  column-gap: 10px;
  row-gap: 10px;
  overflow: auto;
  .el-upload-list__item {
    height: 88px;
    width: 50%;
  }
}
:deep(.gv-upload-delete){
  position: absolute;
  top: 10px;
  right: 10px;
}
:deep(.el-upload-list__item-actions){
  position: absolute;
  right: 10px;
}
:deep(.el-upload-list__item) {
  position: relative;
  .gv-upload-delete {
    position: absolute;
    top: 20px;
    right: 10px;
    transform: translateY(-50%);
    opacity: 0;
    visibility: hidden;
    transition: opacity .2s;

  }
  &:hover .gv-upload-delete {
    opacity: 1;
    visibility: visible;
  }
}
:deep(.el-upload-dragger){
  padding: 20px 10px 10px 10px !important;
}
</style>
```
