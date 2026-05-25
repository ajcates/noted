import { ref, onMounted, computed, watch } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import { useAuthStore } from '@/stores/authStore';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import FileBrowser from '@/components/FileBrowser.vue';
import Editor from '@/components/Editor.vue';
import Login from '@/components/Login.vue';
import ConflictResolver from '@/components/ConflictResolver.vue';
import '@mdui/icons/menu.js';
import '@mdui/icons/history.js';
import '@mdui/icons/settings.js';
import '@mdui/icons/insert-drive-file.js';
import '@mdui/icons/arrow-back.js';
import '@mdui/icons/logout.js';
import '@mdui/icons/cloud-off.js';
const fileStore = useFileStore();
const authStore = useAuthStore();
const drawerOpen = ref(false);
// Track transition direction
const transitionName = ref('slide-right');
const showLogin = computed(() => {
    return fileStore.authEnabled && !authStore.isAuthenticated;
});
onMounted(async () => {
    fileStore.init();
    await fileStore.fetchStatus();
    if (!showLogin.value) {
        fileStore.fetchFiles();
    }
    window.addEventListener('auth-error', () => {
        authStore.logout();
    });
});
// Watch isEditing to determine slide direction
watch(() => fileStore.isEditing, (isEditing) => {
    transitionName.value = isEditing ? 'slide-right' : 'slide-left';
});
const toggleDrawer = () => {
    drawerOpen.value = !drawerOpen.value;
};
const closeEditor = () => {
    fileStore.closeEditor();
};
const openRecent = (file) => {
    fileStore.openFile(file);
    drawerOpen.value = false;
};
const handleLogout = () => {
    authStore.logout();
    drawerOpen.value = false;
};
const buildNumber = __BUILD_NUMBER__;
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.showLogin) {
    const __VLS_0 = Login;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_5 = {};
    var __VLS_3;
}
else {
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.mduiLayout | typeof __VLS_components.MduiLayout | typeof __VLS_components['mdui-layout'] | typeof __VLS_components.mduiLayout | typeof __VLS_components.MduiLayout | typeof __VLS_components['mdui-layout']} */
    mduiLayout;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    var __VLS_11 = {};
    const { default: __VLS_12 } = __VLS_9.slots;
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.mduiTopAppBar | typeof __VLS_components.MduiTopAppBar | typeof __VLS_components['mdui-top-app-bar'] | typeof __VLS_components.mduiTopAppBar | typeof __VLS_components.MduiTopAppBar | typeof __VLS_components['mdui-top-app-bar']} */
    mduiTopAppBar;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        ...{ style: {} },
    }));
    const __VLS_15 = __VLS_14({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    const { default: __VLS_18 } = __VLS_16.slots;
    if (!__VLS_ctx.fileStore.isEditing) {
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon'] | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon']} */
        mduiButtonIcon;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }));
        const __VLS_21 = __VLS_20({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        let __VLS_24;
        const __VLS_25 = ({ click: {} },
            { onClick: (__VLS_ctx.toggleDrawer) });
        const { default: __VLS_26 } = __VLS_22.slots;
        let __VLS_27;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconMenu | typeof __VLS_components.MduiIconMenu | typeof __VLS_components['mdui-icon-menu'] | typeof __VLS_components.mduiIconMenu | typeof __VLS_components.MduiIconMenu | typeof __VLS_components['mdui-icon-menu']} */
        mduiIconMenu;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({}));
        const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
        // @ts-ignore
        [showLogin, fileStore, toggleDrawer,];
        var __VLS_22;
        var __VLS_23;
    }
    else {
        let __VLS_32;
        /** @ts-ignore @type { | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon'] | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon']} */
        mduiButtonIcon;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }));
        const __VLS_34 = __VLS_33({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        let __VLS_37;
        const __VLS_38 = ({ click: {} },
            { onClick: (__VLS_ctx.closeEditor) });
        const { default: __VLS_39 } = __VLS_35.slots;
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconArrowBack | typeof __VLS_components.MduiIconArrowBack | typeof __VLS_components['mdui-icon-arrow-back'] | typeof __VLS_components.mduiIconArrowBack | typeof __VLS_components.MduiIconArrowBack | typeof __VLS_components['mdui-icon-arrow-back']} */
        mduiIconArrowBack;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
        // @ts-ignore
        [closeEditor,];
        var __VLS_35;
        var __VLS_36;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "top-bar-content" },
    });
    /** @type {__VLS_StyleScopedClasses['top-bar-content']} */ ;
    if (!__VLS_ctx.fileStore.isEditing) {
        const __VLS_45 = Breadcrumbs;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({}));
        const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "editor-title" },
        });
        /** @type {__VLS_StyleScopedClasses['editor-title']} */ ;
        (__VLS_ctx.fileStore.currentFile?.name);
    }
    if (!__VLS_ctx.fileStore.isOnline) {
        let __VLS_50;
        /** @ts-ignore @type { | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon'] | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon']} */
        mduiButtonIcon;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
            ...{ class: "offline-icon" },
            mduiTooltip: "Offline",
            ...{ style: {} },
        }));
        const __VLS_52 = __VLS_51({
            ...{ class: "offline-icon" },
            mduiTooltip: "Offline",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        /** @type {__VLS_StyleScopedClasses['offline-icon']} */ ;
        const { default: __VLS_55 } = __VLS_53.slots;
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconCloudOff | typeof __VLS_components.MduiIconCloudOff | typeof __VLS_components['mdui-icon-cloud-off'] | typeof __VLS_components.mduiIconCloudOff | typeof __VLS_components.MduiIconCloudOff | typeof __VLS_components['mdui-icon-cloud-off']} */
        mduiIconCloudOff;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
        const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
        // @ts-ignore
        [fileStore, fileStore, fileStore,];
        var __VLS_53;
    }
    // @ts-ignore
    [];
    var __VLS_16;
    let __VLS_61;
    /** @ts-ignore @type { | typeof __VLS_components.mduiNavigationDrawer | typeof __VLS_components.MduiNavigationDrawer | typeof __VLS_components['mdui-navigation-drawer'] | typeof __VLS_components.mduiNavigationDrawer | typeof __VLS_components.MduiNavigationDrawer | typeof __VLS_components['mdui-navigation-drawer']} */
    mduiNavigationDrawer;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        ...{ 'onOverlayClick': {} },
        open: (__VLS_ctx.drawerOpen),
        ...{ style: {} },
    }));
    const __VLS_63 = __VLS_62({
        ...{ 'onOverlayClick': {} },
        open: (__VLS_ctx.drawerOpen),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    let __VLS_66;
    const __VLS_67 = ({ overlayClick: {} },
        { onOverlayClick: (...[$event]) => {
                if (!!(__VLS_ctx.showLogin))
                    return;
                __VLS_ctx.drawerOpen = false;
                // @ts-ignore
                [drawerOpen, drawerOpen,];
            } });
    const { default: __VLS_68 } = __VLS_64.slots;
    let __VLS_69;
    /** @ts-ignore @type { | typeof __VLS_components.mduiList | typeof __VLS_components.MduiList | typeof __VLS_components['mdui-list'] | typeof __VLS_components.mduiList | typeof __VLS_components.MduiList | typeof __VLS_components['mdui-list']} */
    mduiList;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
        ...{ style: {} },
    }));
    const __VLS_71 = __VLS_70({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    const { default: __VLS_74 } = __VLS_72.slots;
    let __VLS_75;
    /** @ts-ignore @type { | typeof __VLS_components.mduiListSubheader | typeof __VLS_components.MduiListSubheader | typeof __VLS_components['mdui-list-subheader'] | typeof __VLS_components.mduiListSubheader | typeof __VLS_components.MduiListSubheader | typeof __VLS_components['mdui-list-subheader']} */
    mduiListSubheader;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({}));
    const __VLS_77 = __VLS_76({}, ...__VLS_functionalComponentArgsRest(__VLS_76));
    const { default: __VLS_80 } = __VLS_78.slots;
    let __VLS_81;
    /** @ts-ignore @type { | typeof __VLS_components.mduiIconHistory | typeof __VLS_components.MduiIconHistory | typeof __VLS_components['mdui-icon-history'] | typeof __VLS_components.mduiIconHistory | typeof __VLS_components.MduiIconHistory | typeof __VLS_components['mdui-icon-history']} */
    mduiIconHistory;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
        ...{ class: "subheader-icon" },
    }));
    const __VLS_83 = __VLS_82({
        ...{ class: "subheader-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    /** @type {__VLS_StyleScopedClasses['subheader-icon']} */ ;
    // @ts-ignore
    [];
    var __VLS_78;
    for (const [file] of __VLS_vFor((__VLS_ctx.fileStore.recentFiles))) {
        let __VLS_86;
        /** @ts-ignore @type { | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item'] | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item']} */
        mduiListItem;
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
            ...{ 'onClick': {} },
            key: (file.path),
        }));
        const __VLS_88 = __VLS_87({
            ...{ 'onClick': {} },
            key: (file.path),
        }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        let __VLS_91;
        const __VLS_92 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.showLogin))
                        return;
                    __VLS_ctx.openRecent(file);
                    // @ts-ignore
                    [fileStore, openRecent,];
                } });
        const { default: __VLS_93 } = __VLS_89.slots;
        let __VLS_94;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconInsertDriveFile | typeof __VLS_components.MduiIconInsertDriveFile | typeof __VLS_components['mdui-icon-insert-drive-file'] | typeof __VLS_components.mduiIconInsertDriveFile | typeof __VLS_components.MduiIconInsertDriveFile | typeof __VLS_components['mdui-icon-insert-drive-file']} */
        mduiIconInsertDriveFile;
        // @ts-ignore
        const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
            slot: "icon",
        }));
        const __VLS_96 = __VLS_95({
            slot: "icon",
        }, ...__VLS_functionalComponentArgsRest(__VLS_95));
        (file.name);
        // @ts-ignore
        [];
        var __VLS_89;
        var __VLS_90;
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.fileStore.recentFiles.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "drawer-empty" },
        });
        /** @type {__VLS_StyleScopedClasses['drawer-empty']} */ ;
    }
    let __VLS_99;
    /** @ts-ignore @type { | typeof __VLS_components.mduiDivider | typeof __VLS_components.MduiDivider | typeof __VLS_components['mdui-divider'] | typeof __VLS_components.mduiDivider | typeof __VLS_components.MduiDivider | typeof __VLS_components['mdui-divider']} */
    mduiDivider;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({}));
    const __VLS_101 = __VLS_100({}, ...__VLS_functionalComponentArgsRest(__VLS_100));
    let __VLS_104;
    /** @ts-ignore @type { | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item'] | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item']} */
    mduiListItem;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({}));
    const __VLS_106 = __VLS_105({}, ...__VLS_functionalComponentArgsRest(__VLS_105));
    const { default: __VLS_109 } = __VLS_107.slots;
    let __VLS_110;
    /** @ts-ignore @type { | typeof __VLS_components.mduiIconSettings | typeof __VLS_components.MduiIconSettings | typeof __VLS_components['mdui-icon-settings'] | typeof __VLS_components.mduiIconSettings | typeof __VLS_components.MduiIconSettings | typeof __VLS_components['mdui-icon-settings']} */
    mduiIconSettings;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
        slot: "icon",
    }));
    const __VLS_112 = __VLS_111({
        slot: "icon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    // @ts-ignore
    [fileStore,];
    var __VLS_107;
    if (__VLS_ctx.fileStore.authEnabled) {
        let __VLS_115;
        /** @ts-ignore @type { | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item'] | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item']} */
        mduiListItem;
        // @ts-ignore
        const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
            ...{ 'onClick': {} },
        }));
        const __VLS_117 = __VLS_116({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_116));
        let __VLS_120;
        const __VLS_121 = ({ click: {} },
            { onClick: (__VLS_ctx.handleLogout) });
        const { default: __VLS_122 } = __VLS_118.slots;
        let __VLS_123;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconLogout | typeof __VLS_components.MduiIconLogout | typeof __VLS_components['mdui-icon-logout'] | typeof __VLS_components.mduiIconLogout | typeof __VLS_components.MduiIconLogout | typeof __VLS_components['mdui-icon-logout']} */
        mduiIconLogout;
        // @ts-ignore
        const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
            slot: "icon",
        }));
        const __VLS_125 = __VLS_124({
            slot: "icon",
        }, ...__VLS_functionalComponentArgsRest(__VLS_124));
        // @ts-ignore
        [fileStore, handleLogout,];
        var __VLS_118;
        var __VLS_119;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "build-number" },
    });
    /** @type {__VLS_StyleScopedClasses['build-number']} */ ;
    (__VLS_ctx.buildNumber);
    // @ts-ignore
    [buildNumber,];
    var __VLS_72;
    // @ts-ignore
    [];
    var __VLS_64;
    var __VLS_65;
    let __VLS_128;
    /** @ts-ignore @type { | typeof __VLS_components.mduiLayoutMain | typeof __VLS_components.MduiLayoutMain | typeof __VLS_components['mdui-layout-main'] | typeof __VLS_components.mduiLayoutMain | typeof __VLS_components.MduiLayoutMain | typeof __VLS_components['mdui-layout-main']} */
    mduiLayoutMain;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
        ...{ class: "main-content" },
    }));
    const __VLS_130 = __VLS_129({
        ...{ class: "main-content" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    /** @type {__VLS_StyleScopedClasses['main-content']} */ ;
    const { default: __VLS_133 } = __VLS_131.slots;
    let __VLS_134;
    /** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
        name: (__VLS_ctx.transitionName),
    }));
    const __VLS_136 = __VLS_135({
        name: (__VLS_ctx.transitionName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    const { default: __VLS_139 } = __VLS_137.slots;
    if (!__VLS_ctx.fileStore.isEditing) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "view-container" },
        });
        /** @type {__VLS_StyleScopedClasses['view-container']} */ ;
        const __VLS_140 = FileBrowser;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({}));
        const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "view-container" },
        });
        /** @type {__VLS_StyleScopedClasses['view-container']} */ ;
        const __VLS_145 = Editor;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({}));
        const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
    }
    // @ts-ignore
    [fileStore, transitionName,];
    var __VLS_137;
    // @ts-ignore
    [];
    var __VLS_131;
    if (__VLS_ctx.fileStore.conflict) {
        const __VLS_150 = ConflictResolver;
        // @ts-ignore
        const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
            ...{ 'onResolve': {} },
            fileName: (__VLS_ctx.fileStore.currentFile?.name || ''),
            serverContent: (__VLS_ctx.fileStore.conflict.serverContent),
            localContent: (__VLS_ctx.fileStore.conflict.localContent),
        }));
        const __VLS_152 = __VLS_151({
            ...{ 'onResolve': {} },
            fileName: (__VLS_ctx.fileStore.currentFile?.name || ''),
            serverContent: (__VLS_ctx.fileStore.conflict.serverContent),
            localContent: (__VLS_ctx.fileStore.conflict.localContent),
        }, ...__VLS_functionalComponentArgsRest(__VLS_151));
        let __VLS_155;
        const __VLS_156 = ({ resolve: {} },
            { onResolve: (__VLS_ctx.fileStore.resolveConflict) });
        var __VLS_153;
        var __VLS_154;
    }
    // @ts-ignore
    [fileStore, fileStore, fileStore, fileStore, fileStore,];
    var __VLS_9;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
