import { computed } from 'vue';
import * as diff from 'diff';
const props = defineProps();
const emit = defineEmits(['resolve']);
const diffResult = computed(() => {
    return diff.diffLines(props.serverContent, props.localContent);
});
const resolveWithLocal = () => {
    emit('resolve', props.localContent);
};
const resolveWithServer = () => {
    emit('resolve', props.serverContent);
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['diff-part']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.mduiDialog | typeof __VLS_components.MduiDialog | typeof __VLS_components['mdui-dialog'] | typeof __VLS_components.mduiDialog | typeof __VLS_components.MduiDialog | typeof __VLS_components['mdui-dialog']} */
mduiDialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "conflict-dialog" },
    headline: "Conflict Detected",
    open: true,
}));
const __VLS_2 = __VLS_1({
    ...{ class: "conflict-dialog" },
    headline: "Conflict Detected",
    open: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['conflict-dialog']} */ ;
const { default: __VLS_6 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "conflict-info" },
});
/** @type {__VLS_StyleScopedClasses['conflict-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.fileName);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "diff-container mdui-prose" },
});
/** @type {__VLS_StyleScopedClasses['diff-container']} */ ;
/** @type {__VLS_StyleScopedClasses['mdui-prose']} */ ;
for (const [part, index] of __VLS_vFor((__VLS_ctx.diffResult))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: (['diff-part', part.added ? 'added' : part.removed ? 'removed' : '']) },
    });
    /** @type {__VLS_StyleScopedClasses['diff-part']} */ ;
    (part.value);
    // @ts-ignore
    [fileName, diffResult,];
}
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button'] | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button']} */
mduiButton;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "text",
}));
const __VLS_9 = __VLS_8({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_12;
const __VLS_13 = ({ click: {} },
    { onClick: (__VLS_ctx.resolveWithServer) });
const { default: __VLS_14 } = __VLS_10.slots;
// @ts-ignore
[resolveWithServer,];
var __VLS_10;
var __VLS_11;
let __VLS_15;
/** @ts-ignore @type { | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button'] | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button']} */
mduiButton;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "tonal",
}));
const __VLS_17 = __VLS_16({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "tonal",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
const __VLS_21 = ({ click: {} },
    { onClick: (__VLS_ctx.resolveWithLocal) });
const { default: __VLS_22 } = __VLS_18.slots;
// @ts-ignore
[resolveWithLocal,];
var __VLS_18;
var __VLS_19;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    __typeProps: {},
});
export default {};
