/// <reference types="vite/client" />

declare const __BUILD_NUMBER__: number;

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
