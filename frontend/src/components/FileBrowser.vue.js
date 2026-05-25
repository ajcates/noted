import { ref, onMounted, computed } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import '@mdui/icons/folder.js';
import '@mdui/icons/insert-drive-file.js';
import '@mdui/icons/arrow-back.js';
import '@mdui/icons/add.js';
import '@mdui/icons/note-add.js';
import '@mdui/icons/create-new-folder.js';
import '@mdui/icons/more-vert.js';
import '@mdui/icons/edit.js';
import '@mdui/icons/delete.js';
const fileStore = useFileStore();
const sortedFiles = computed(() => {
    return [...fileStore.files].sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name);
        }
        return a.type === 'directory' ? -1 : 1;
    });
});
// Dialog & Input states
const createDialogOpen = ref(false);
const createType = ref('file');
const createName = ref('');
const renameDialogOpen = ref(false);
const renameOldPath = ref('');
const renameNewName = ref('');
onMounted(() => {
    fileStore.fetchFiles(fileStore.currentPath);
});
const handleEntryClick = (entry) => {
    if (entry.type === 'directory') {
        fileStore.navigate(entry.path);
    }
    else {
        fileStore.openFile(entry);
    }
};
const goBack = () => {
    const parts = fileStore.currentPath.split('/');
    if (parts.length > 1) {
        parts.pop();
        fileStore.navigate(parts.join('/') || '.');
    }
    else if (fileStore.currentPath !== '.') {
        fileStore.navigate('.');
    }
};
const openCreateDialog = (type) => {
    createType.value = type;
    createName.value = '';
    createDialogOpen.value = true;
};
const confirmCreate = async () => {
    if (createName.value.trim()) {
        await fileStore.createFile(createName.value.trim(), createType.value);
        createDialogOpen.value = false;
    }
};
const openRenameDialog = (entry) => {
    renameOldPath.value = entry.path;
    renameNewName.value = entry.name;
    renameDialogOpen.value = true;
};
const confirmRename = async () => {
    if (renameNewName.value.trim() && renameNewName.value !== renameOldPath.value.split('/').pop()) {
        await fileStore.renameEntry(renameOldPath.value, renameNewName.value.trim());
        renameDialogOpen.value = false;
    }
};
const deleteSnackbarOpen = ref(false);
const deletedFileName = ref('');
const handleDelete = async (entry) => {
    deletedFileName.value = entry.name;
    deleteSnackbarOpen.value = true;
    await fileStore.deleteEntryWithUndo(entry);
};
const undoDelete = () => {
    fileStore.cancelDelete();
    deleteSnackbarOpen.value = false;
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "file-browser" },
});
/** @type {__VLS_StyleScopedClasses['file-browser']} */ ;
if (__VLS_ctx.fileStore.loading) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.mduiLinearProgress | typeof __VLS_components.MduiLinearProgress | typeof __VLS_components['mdui-linear-progress'] | typeof __VLS_components.mduiLinearProgress | typeof __VLS_components.MduiLinearProgress | typeof __VLS_components['mdui-linear-progress']} */
    mduiLinearProgress;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "list-surface" },
});
/** @type {__VLS_StyleScopedClasses['list-surface']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.mduiList | typeof __VLS_components.MduiList | typeof __VLS_components['mdui-list'] | typeof __VLS_components.mduiList | typeof __VLS_components.MduiList | typeof __VLS_components['mdui-list']} */
mduiList;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ style: {} },
}));
const __VLS_7 = __VLS_6({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_10 } = __VLS_8.slots;
if (__VLS_ctx.fileStore.currentPath !== '.') {
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item'] | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item']} */
    mduiListItem;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        ...{ 'onClick': {} },
        ...{ class: "back-item" },
        ripple: true,
    }));
    const __VLS_13 = __VLS_12({
        ...{ 'onClick': {} },
        ...{ class: "back-item" },
        ripple: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    let __VLS_16;
    const __VLS_17 = ({ click: {} },
        { onClick: (__VLS_ctx.goBack) });
    /** @type {__VLS_StyleScopedClasses['back-item']} */ ;
    const { default: __VLS_18 } = __VLS_14.slots;
    let __VLS_19;
    /** @ts-ignore @type { | typeof __VLS_components.mduiIconArrowBack | typeof __VLS_components.MduiIconArrowBack | typeof __VLS_components['mdui-icon-arrow-back'] | typeof __VLS_components.mduiIconArrowBack | typeof __VLS_components.MduiIconArrowBack | typeof __VLS_components['mdui-icon-arrow-back']} */
    mduiIconArrowBack;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        slot: "icon",
    }));
    const __VLS_21 = __VLS_20({
        slot: "icon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    // @ts-ignore
    [fileStore, fileStore, goBack,];
    var __VLS_14;
    var __VLS_15;
}
for (const [file] of __VLS_vFor((__VLS_ctx.sortedFiles))) {
    let __VLS_24;
    /** @ts-ignore @type { | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item'] | typeof __VLS_components.mduiListItem | typeof __VLS_components.MduiListItem | typeof __VLS_components['mdui-list-item']} */
    mduiListItem;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        key: (file.path),
        ripple: true,
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        key: (file.path),
        ripple: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_29;
    const __VLS_30 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEntryClick(file);
                // @ts-ignore
                [sortedFiles, handleEntryClick,];
            } });
    const { default: __VLS_31 } = __VLS_27.slots;
    if (file.type === 'directory') {
        let __VLS_32;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconFolder | typeof __VLS_components.MduiIconFolder | typeof __VLS_components['mdui-icon-folder'] | typeof __VLS_components.mduiIconFolder | typeof __VLS_components.MduiIconFolder | typeof __VLS_components['mdui-icon-folder']} */
        mduiIconFolder;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            slot: "icon",
        }));
        const __VLS_34 = __VLS_33({
            slot: "icon",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    }
    else {
        let __VLS_37;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconInsertDriveFile | typeof __VLS_components.MduiIconInsertDriveFile | typeof __VLS_components['mdui-icon-insert-drive-file'] | typeof __VLS_components.mduiIconInsertDriveFile | typeof __VLS_components.MduiIconInsertDriveFile | typeof __VLS_components['mdui-icon-insert-drive-file']} */
        mduiIconInsertDriveFile;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            slot: "icon",
        }));
        const __VLS_39 = __VLS_38({
            slot: "icon",
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    }
    (file.name);
    if (file.type === 'file') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            slot: "description",
        });
        ((file.size / 1024).toFixed(2));
    }
    if (!__VLS_ctx.fileStore.readonly) {
        let __VLS_42;
        /** @ts-ignore @type { | typeof __VLS_components.mduiDropdown | typeof __VLS_components.MduiDropdown | typeof __VLS_components['mdui-dropdown'] | typeof __VLS_components.mduiDropdown | typeof __VLS_components.MduiDropdown | typeof __VLS_components['mdui-dropdown']} */
        mduiDropdown;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            ...{ 'onClick': {} },
            slot: "end-icon",
        }));
        const __VLS_44 = __VLS_43({
            ...{ 'onClick': {} },
            slot: "end-icon",
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        let __VLS_47;
        const __VLS_48 = ({ click: {} },
            { onClick: () => { } });
        const { default: __VLS_49 } = __VLS_45.slots;
        let __VLS_50;
        /** @ts-ignore @type { | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon'] | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon']} */
        mduiButtonIcon;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
            slot: "trigger",
        }));
        const __VLS_52 = __VLS_51({
            slot: "trigger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        const { default: __VLS_55 } = __VLS_53.slots;
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconMoreVert | typeof __VLS_components.MduiIconMoreVert | typeof __VLS_components['mdui-icon-more-vert'] | typeof __VLS_components.mduiIconMoreVert | typeof __VLS_components.MduiIconMoreVert | typeof __VLS_components['mdui-icon-more-vert']} */
        mduiIconMoreVert;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
        const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
        // @ts-ignore
        [fileStore,];
        var __VLS_53;
        let __VLS_61;
        /** @ts-ignore @type { | typeof __VLS_components.mduiMenu | typeof __VLS_components.MduiMenu | typeof __VLS_components['mdui-menu'] | typeof __VLS_components.mduiMenu | typeof __VLS_components.MduiMenu | typeof __VLS_components['mdui-menu']} */
        mduiMenu;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({}));
        const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
        const { default: __VLS_66 } = __VLS_64.slots;
        let __VLS_67;
        /** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
        mduiMenuItem;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
            ...{ 'onClick': {} },
        }));
        const __VLS_69 = __VLS_68({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_68));
        let __VLS_72;
        const __VLS_73 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.fileStore.readonly))
                        return;
                    __VLS_ctx.openRenameDialog(file);
                    // @ts-ignore
                    [openRenameDialog,];
                } });
        const { default: __VLS_74 } = __VLS_70.slots;
        let __VLS_75;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconEdit | typeof __VLS_components.MduiIconEdit | typeof __VLS_components['mdui-icon-edit'] | typeof __VLS_components.mduiIconEdit | typeof __VLS_components.MduiIconEdit | typeof __VLS_components['mdui-icon-edit']} */
        mduiIconEdit;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
            slot: "icon",
        }));
        const __VLS_77 = __VLS_76({
            slot: "icon",
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        // @ts-ignore
        [];
        var __VLS_70;
        var __VLS_71;
        let __VLS_80;
        /** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
        mduiMenuItem;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
            ...{ 'onClick': {} },
            ...{ class: "delete-item" },
        }));
        const __VLS_82 = __VLS_81({
            ...{ 'onClick': {} },
            ...{ class: "delete-item" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        let __VLS_85;
        const __VLS_86 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.fileStore.readonly))
                        return;
                    __VLS_ctx.handleDelete(file);
                    // @ts-ignore
                    [handleDelete,];
                } });
        /** @type {__VLS_StyleScopedClasses['delete-item']} */ ;
        const { default: __VLS_87 } = __VLS_83.slots;
        let __VLS_88;
        /** @ts-ignore @type { | typeof __VLS_components.mduiIconDelete | typeof __VLS_components.MduiIconDelete | typeof __VLS_components['mdui-icon-delete'] | typeof __VLS_components.mduiIconDelete | typeof __VLS_components.MduiIconDelete | typeof __VLS_components['mdui-icon-delete']} */
        mduiIconDelete;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
            slot: "icon",
        }));
        const __VLS_90 = __VLS_89({
            slot: "icon",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        // @ts-ignore
        [];
        var __VLS_83;
        var __VLS_84;
        // @ts-ignore
        [];
        var __VLS_64;
        // @ts-ignore
        [];
        var __VLS_45;
        var __VLS_46;
    }
    // @ts-ignore
    [];
    var __VLS_27;
    var __VLS_28;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_8;
if (!__VLS_ctx.fileStore.loading && __VLS_ctx.fileStore.files.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
}
if (!__VLS_ctx.fileStore.readonly) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fab-container" },
    });
    /** @type {__VLS_StyleScopedClasses['fab-container']} */ ;
    let __VLS_93;
    /** @ts-ignore @type { | typeof __VLS_components.mduiDropdown | typeof __VLS_components.MduiDropdown | typeof __VLS_components['mdui-dropdown'] | typeof __VLS_components.mduiDropdown | typeof __VLS_components.MduiDropdown | typeof __VLS_components['mdui-dropdown']} */
    mduiDropdown;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
        placement: "top-end",
    }));
    const __VLS_95 = __VLS_94({
        placement: "top-end",
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    const { default: __VLS_98 } = __VLS_96.slots;
    let __VLS_99;
    /** @ts-ignore @type { | typeof __VLS_components.mduiFab | typeof __VLS_components.MduiFab | typeof __VLS_components['mdui-fab'] | typeof __VLS_components.mduiFab | typeof __VLS_components.MduiFab | typeof __VLS_components['mdui-fab']} */
    mduiFab;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
        slot: "trigger",
        icon: "add",
        extended: true,
        ...{ style: {} },
    }));
    const __VLS_101 = __VLS_100({
        slot: "trigger",
        icon: "add",
        extended: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    const { default: __VLS_104 } = __VLS_102.slots;
    let __VLS_105;
    /** @ts-ignore @type { | typeof __VLS_components.mduiIconAdd | typeof __VLS_components.MduiIconAdd | typeof __VLS_components['mdui-icon-add'] | typeof __VLS_components.mduiIconAdd | typeof __VLS_components.MduiIconAdd | typeof __VLS_components['mdui-icon-add']} */
    mduiIconAdd;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        slot: "icon",
    }));
    const __VLS_107 = __VLS_106({
        slot: "icon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    // @ts-ignore
    [fileStore, fileStore, fileStore,];
    var __VLS_102;
    let __VLS_110;
    /** @ts-ignore @type { | typeof __VLS_components.mduiMenu | typeof __VLS_components.MduiMenu | typeof __VLS_components['mdui-menu'] | typeof __VLS_components.mduiMenu | typeof __VLS_components.MduiMenu | typeof __VLS_components['mdui-menu']} */
    mduiMenu;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({}));
    const __VLS_112 = __VLS_111({}, ...__VLS_functionalComponentArgsRest(__VLS_111));
    const { default: __VLS_115 } = __VLS_113.slots;
    let __VLS_116;
    /** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
    mduiMenuItem;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
        ...{ 'onClick': {} },
    }));
    const __VLS_118 = __VLS_117({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    let __VLS_121;
    const __VLS_122 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.fileStore.readonly))
                    return;
                __VLS_ctx.openCreateDialog('file');
                // @ts-ignore
                [openCreateDialog,];
            } });
    const { default: __VLS_123 } = __VLS_119.slots;
    let __VLS_124;
    /** @ts-ignore @type { | typeof __VLS_components.mduiIconNoteAdd | typeof __VLS_components.MduiIconNoteAdd | typeof __VLS_components['mdui-icon-note-add'] | typeof __VLS_components.mduiIconNoteAdd | typeof __VLS_components.MduiIconNoteAdd | typeof __VLS_components['mdui-icon-note-add']} */
    mduiIconNoteAdd;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
        slot: "icon",
    }));
    const __VLS_126 = __VLS_125({
        slot: "icon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    // @ts-ignore
    [];
    var __VLS_119;
    var __VLS_120;
    let __VLS_129;
    /** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
    mduiMenuItem;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
        ...{ 'onClick': {} },
    }));
    const __VLS_131 = __VLS_130({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    let __VLS_134;
    const __VLS_135 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.fileStore.readonly))
                    return;
                __VLS_ctx.openCreateDialog('directory');
                // @ts-ignore
                [openCreateDialog,];
            } });
    const { default: __VLS_136 } = __VLS_132.slots;
    let __VLS_137;
    /** @ts-ignore @type { | typeof __VLS_components.mduiIconCreateNewFolder | typeof __VLS_components.MduiIconCreateNewFolder | typeof __VLS_components['mdui-icon-create-new-folder'] | typeof __VLS_components.mduiIconCreateNewFolder | typeof __VLS_components.MduiIconCreateNewFolder | typeof __VLS_components['mdui-icon-create-new-folder']} */
    mduiIconCreateNewFolder;
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
        slot: "icon",
    }));
    const __VLS_139 = __VLS_138({
        slot: "icon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    // @ts-ignore
    [];
    var __VLS_132;
    var __VLS_133;
    // @ts-ignore
    [];
    var __VLS_113;
    // @ts-ignore
    [];
    var __VLS_96;
}
let __VLS_142;
/** @ts-ignore @type { | typeof __VLS_components.mduiDialog | typeof __VLS_components.MduiDialog | typeof __VLS_components['mdui-dialog'] | typeof __VLS_components.mduiDialog | typeof __VLS_components.MduiDialog | typeof __VLS_components['mdui-dialog']} */
mduiDialog;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({
    ...{ 'onOverlayClick': {} },
    open: (__VLS_ctx.createDialogOpen),
    headline: (__VLS_ctx.createType === 'file' ? 'New File' : 'New Folder'),
}));
const __VLS_144 = __VLS_143({
    ...{ 'onOverlayClick': {} },
    open: (__VLS_ctx.createDialogOpen),
    headline: (__VLS_ctx.createType === 'file' ? 'New File' : 'New Folder'),
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
let __VLS_147;
const __VLS_148 = ({ overlayClick: {} },
    { onOverlayClick: (...[$event]) => {
            __VLS_ctx.createDialogOpen = false;
            // @ts-ignore
            [createDialogOpen, createDialogOpen, createType,];
        } });
const { default: __VLS_149 } = __VLS_145.slots;
let __VLS_150;
/** @ts-ignore @type { | typeof __VLS_components.mduiTextField | typeof __VLS_components.MduiTextField | typeof __VLS_components['mdui-text-field'] | typeof __VLS_components.mduiTextField | typeof __VLS_components.MduiTextField | typeof __VLS_components['mdui-text-field']} */
mduiTextField;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.createName),
    label: (__VLS_ctx.createType === 'file' ? 'File Name' : 'Folder Name'),
    autofocus: true,
}));
const __VLS_152 = __VLS_151({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.createName),
    label: (__VLS_ctx.createType === 'file' ? 'File Name' : 'Folder Name'),
    autofocus: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
let __VLS_155;
const __VLS_156 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.confirmCreate) });
var __VLS_153;
var __VLS_154;
let __VLS_157;
/** @ts-ignore @type { | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button'] | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button']} */
mduiButton;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "text",
}));
const __VLS_159 = __VLS_158({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
let __VLS_162;
const __VLS_163 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.createDialogOpen = false;
            // @ts-ignore
            [createDialogOpen, createType, createName, confirmCreate,];
        } });
const { default: __VLS_164 } = __VLS_160.slots;
// @ts-ignore
[];
var __VLS_160;
var __VLS_161;
let __VLS_165;
/** @ts-ignore @type { | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button'] | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button']} */
mduiButton;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "filled",
}));
const __VLS_167 = __VLS_166({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "filled",
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
let __VLS_170;
const __VLS_171 = ({ click: {} },
    { onClick: (__VLS_ctx.confirmCreate) });
const { default: __VLS_172 } = __VLS_168.slots;
// @ts-ignore
[confirmCreate,];
var __VLS_168;
var __VLS_169;
// @ts-ignore
[];
var __VLS_145;
var __VLS_146;
let __VLS_173;
/** @ts-ignore @type { | typeof __VLS_components.mduiDialog | typeof __VLS_components.MduiDialog | typeof __VLS_components['mdui-dialog'] | typeof __VLS_components.mduiDialog | typeof __VLS_components.MduiDialog | typeof __VLS_components['mdui-dialog']} */
mduiDialog;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
    ...{ 'onOverlayClick': {} },
    open: (__VLS_ctx.renameDialogOpen),
    headline: "Rename",
}));
const __VLS_175 = __VLS_174({
    ...{ 'onOverlayClick': {} },
    open: (__VLS_ctx.renameDialogOpen),
    headline: "Rename",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
let __VLS_178;
const __VLS_179 = ({ overlayClick: {} },
    { onOverlayClick: (...[$event]) => {
            __VLS_ctx.renameDialogOpen = false;
            // @ts-ignore
            [renameDialogOpen, renameDialogOpen,];
        } });
const { default: __VLS_180 } = __VLS_176.slots;
let __VLS_181;
/** @ts-ignore @type { | typeof __VLS_components.mduiTextField | typeof __VLS_components.MduiTextField | typeof __VLS_components['mdui-text-field'] | typeof __VLS_components.mduiTextField | typeof __VLS_components.MduiTextField | typeof __VLS_components['mdui-text-field']} */
mduiTextField;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.renameNewName),
    label: "New Name",
    autofocus: true,
}));
const __VLS_183 = __VLS_182({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.renameNewName),
    label: "New Name",
    autofocus: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
let __VLS_186;
const __VLS_187 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.confirmRename) });
var __VLS_184;
var __VLS_185;
let __VLS_188;
/** @ts-ignore @type { | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button'] | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button']} */
mduiButton;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent1(__VLS_188, new __VLS_188({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "text",
}));
const __VLS_190 = __VLS_189({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
let __VLS_193;
const __VLS_194 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.renameDialogOpen = false;
            // @ts-ignore
            [renameDialogOpen, renameNewName, confirmRename,];
        } });
const { default: __VLS_195 } = __VLS_191.slots;
// @ts-ignore
[];
var __VLS_191;
var __VLS_192;
let __VLS_196;
/** @ts-ignore @type { | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button'] | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button']} */
mduiButton;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "filled",
}));
const __VLS_198 = __VLS_197({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "filled",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
let __VLS_201;
const __VLS_202 = ({ click: {} },
    { onClick: (__VLS_ctx.confirmRename) });
const { default: __VLS_203 } = __VLS_199.slots;
// @ts-ignore
[confirmRename,];
var __VLS_199;
var __VLS_200;
// @ts-ignore
[];
var __VLS_176;
var __VLS_177;
let __VLS_204;
/** @ts-ignore @type { | typeof __VLS_components.mduiSnackbar | typeof __VLS_components.MduiSnackbar | typeof __VLS_components['mdui-snackbar'] | typeof __VLS_components.mduiSnackbar | typeof __VLS_components.MduiSnackbar | typeof __VLS_components['mdui-snackbar']} */
mduiSnackbar;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({
    ...{ 'onClosed': {} },
    open: (__VLS_ctx.deleteSnackbarOpen),
}));
const __VLS_206 = __VLS_205({
    ...{ 'onClosed': {} },
    open: (__VLS_ctx.deleteSnackbarOpen),
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
let __VLS_209;
const __VLS_210 = ({ closed: {} },
    { onClosed: (...[$event]) => {
            __VLS_ctx.deleteSnackbarOpen = false;
            // @ts-ignore
            [deleteSnackbarOpen, deleteSnackbarOpen,];
        } });
const { default: __VLS_211 } = __VLS_207.slots;
(__VLS_ctx.deletedFileName);
let __VLS_212;
/** @ts-ignore @type { | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button'] | typeof __VLS_components.mduiButton | typeof __VLS_components.MduiButton | typeof __VLS_components['mdui-button']} */
mduiButton;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent1(__VLS_212, new __VLS_212({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "text",
}));
const __VLS_214 = __VLS_213({
    ...{ 'onClick': {} },
    slot: "action",
    variant: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
let __VLS_217;
const __VLS_218 = ({ click: {} },
    { onClick: (__VLS_ctx.undoDelete) });
const { default: __VLS_219 } = __VLS_215.slots;
// @ts-ignore
[deletedFileName, undoDelete,];
var __VLS_215;
var __VLS_216;
// @ts-ignore
[];
var __VLS_207;
var __VLS_208;
if (__VLS_ctx.fileStore.error) {
    let __VLS_220;
    /** @ts-ignore @type { | typeof __VLS_components.mduiSnackbar | typeof __VLS_components.MduiSnackbar | typeof __VLS_components['mdui-snackbar'] | typeof __VLS_components.mduiSnackbar | typeof __VLS_components.MduiSnackbar | typeof __VLS_components['mdui-snackbar']} */
    mduiSnackbar;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent1(__VLS_220, new __VLS_220({
        ...{ 'onClosed': {} },
        open: true,
    }));
    const __VLS_222 = __VLS_221({
        ...{ 'onClosed': {} },
        open: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    let __VLS_225;
    const __VLS_226 = ({ closed: {} },
        { onClosed: (...[$event]) => {
                if (!(__VLS_ctx.fileStore.error))
                    return;
                __VLS_ctx.fileStore.error = null;
                // @ts-ignore
                [fileStore, fileStore,];
            } });
    const { default: __VLS_227 } = __VLS_223.slots;
    (__VLS_ctx.fileStore.error);
    // @ts-ignore
    [fileStore,];
    var __VLS_223;
    var __VLS_224;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
