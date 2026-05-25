import { computed } from 'vue';
import { useFileStore } from '@/stores/fileStore';
const fileStore = useFileStore();
const breadcrumbs = computed(() => {
    const parts = fileStore.currentPath.split('/').filter((p) => p && p !== '.');
    const result = [{ name: 'Root', path: '.' }];
    let current = '';
    parts.forEach((part) => {
        current = current ? `${current}/${part}` : part;
        result.push({ name: part, path: current });
    });
    return result;
});
const navigate = (path) => {
    fileStore.navigate(path);
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['crumb']} */ ;
/** @type {__VLS_StyleScopedClasses['crumb']} */ ;
/** @type {__VLS_StyleScopedClasses['crumb']} */ ;
/** @type {__VLS_StyleScopedClasses['last']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "breadcrumbs" },
});
/** @type {__VLS_StyleScopedClasses['breadcrumbs']} */ ;
for (const [crumb, index] of __VLS_vFor((__VLS_ctx.breadcrumbs))) {
    (crumb.path);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.navigate(crumb.path);
                // @ts-ignore
                [breadcrumbs, navigate,];
            } },
        ...{ class: "crumb" },
        ...{ class: ({ last: index === __VLS_ctx.breadcrumbs.length - 1 }) },
    });
    /** @type {__VLS_StyleScopedClasses['crumb']} */ ;
    /** @type {__VLS_StyleScopedClasses['last']} */ ;
    (crumb.name);
    if (index < __VLS_ctx.breadcrumbs.length - 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "separator" },
        });
        /** @type {__VLS_StyleScopedClasses['separator']} */ ;
    }
    // @ts-ignore
    [breadcrumbs, breadcrumbs,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
