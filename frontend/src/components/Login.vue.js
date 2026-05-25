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
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-container" },
});
/** @type {__VLS_StyleScopedClasses['login-container']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.mduiCard | typeof __VLS_components.MduiCard | typeof __VLS_components['mdui-card'] | typeof __VLS_components.mduiCard | typeof __VLS_components.MduiCard | typeof __VLS_components['mdui-card']} */
mduiCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "login-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "login-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-header" },
});
/** @type {__VLS_StyleScopedClasses['login-header']} */ ;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconLock | typeof __VLS_components.MduiIconLock | typeof __VLS_components['mdui-icon-lock'] | typeof __VLS_components.mduiIconLock | typeof __VLS_components.MduiIconLock | typeof __VLS_components['mdui-icon-lock']} */
mduiIconLock;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    ...{ class: "lock-icon" },
}));
const __VLS_8 = __VLS_7({
    ...{ class: "lock-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
/** @type {__VLS_StyleScopedClasses['lock-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
let __VLS_11;
/** @ts-ignore @type { | typeof __VLS_components.mduiTextField | typeof __VLS_components.MduiTextField | typeof __VLS_components['mdui-text-field'] | typeof __VLS_components.mduiTextField | typeof __VLS_components.MduiTextField | typeof __VLS_components['mdui-text-field']} */
mduiTextField;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    ...{ 'onKeyup': {} },
    label: "Password",
    type: "password",
    modelValue: (__VLS_ctx.password),
    togglePassword: (true),
    error: (!!__VLS_ctx.authStore.error),
    helper: (__VLS_ctx.authStore.error || ''),
}));
const __VLS_13 = __VLS_12({
    ...{ 'onKeyup': {} },
    label: "Password",
    type: "password",
    modelValue: (__VLS_ctx.password),
    togglePassword: (true),
    error: (!!__VLS_ctx.authStore.error),
    helper: (__VLS_ctx.authStore.error || ''),
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_16;
const __VLS_17 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.handleLogin) });
const { default: __VLS_18 } = __VLS_14.slots;
let __VLS_19;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconLock | typeof __VLS_components.MduiIconLock | typeof __VLS_components['mdui-icon-lock'] | typeof __VLS_components.mduiIconLock | typeof __VLS_components.MduiIconLock | typeof __VLS_components['mdui-icon-lock']} */
mduiIconLock;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    slot: "icon",
}));
const __VLS_21 = __VLS_20({
    slot: "icon",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
// @ts-ignore
[password, authStore, authStore, handleLogin,];
var __VLS_14;
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-actions" },
});
/** @type {__VLS_StyleScopedClasses['login-actions']} */ ;
let __VLS_24;
/** @ts-ignore @type { | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button'] | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button']} */
mduiButton;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    fullWidth: true,
    loading: (__VLS_ctx.authStore.loading),
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    fullWidth: true,
    loading: (__VLS_ctx.authStore.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_29;
const __VLS_30 = ({ click: {} },
    { onClick: (__VLS_ctx.handleLogin) });
const { default: __VLS_31 } = __VLS_27.slots;
// @ts-ignore
[authStore, handleLogin,];
var __VLS_27;
var __VLS_28;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
