import '@mdui/icons/border-color.js';
import '@mdui/icons/format-color-reset.js';
import '@mdui/icons/smart-toy.js';
import '@mdui/icons/play-arrow.js';
import '@mdui/icons/undo.js';
import '@mdui/icons/spellcheck.js';
import '@mdui/icons/title.js';
import '@mdui/icons/format-list-bulleted.js';
import '@mdui/icons/link.js';
import '@mdui/icons/text-fields.js';
import '@mdui/icons/data-object.js';
const props = defineProps();
const emit = defineEmits(['highlight', 'run-prompt', 'undo', 'format', 'select-prompt', 'header', 'list', 'link', 'escape']);
const prompts = [
    { id: 'summarize', name: 'Summarize' },
    { id: 'fix_grammar', name: 'Fix Grammar' },
    { id: 'professional', name: 'Professional' },
    { id: 'creative', name: 'Creative' }
];
const handlePromptSelect = (id) => {
    emit('select-prompt', id);
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
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.mduiBottomAppBar | typeof __VLS_components.MduiBottomAppBar | typeof __VLS_components['mdui-bottom-app-bar'] | typeof __VLS_components.mduiBottomAppBar | typeof __VLS_components.MduiBottomAppBar | typeof __VLS_components['mdui-bottom-app-bar']} */
mduiBottomAppBar;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "bottom-bar" },
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "bottom-bar" },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['bottom-bar']} */ ;
const { default: __VLS_6 } = __VLS_3.slots;
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.mduiDropdown | typeof __VLS_components.MduiDropdown | typeof __VLS_components['mdui-dropdown'] | typeof __VLS_components.mduiDropdown | typeof __VLS_components.MduiDropdown | typeof __VLS_components['mdui-dropdown']} */
mduiDropdown;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
}));
const __VLS_9 = __VLS_8({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_12;
const __VLS_13 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_14 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_15 } = __VLS_10.slots;
let __VLS_16;
/** @ts-ignore @type { | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon'] | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon']} */
mduiButtonIcon;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    slot: "trigger",
    tooltip: "Text Actions",
    ...{ style: {} },
    tabindex: "-1",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    slot: "trigger",
    tooltip: "Text Actions",
    ...{ style: {} },
    tabindex: "-1",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_21;
const __VLS_22 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_23 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_24 } = __VLS_19.slots;
let __VLS_25;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconTextFields | typeof __VLS_components.MduiIconTextFields | typeof __VLS_components['mdui-icon-text-fields'] | typeof __VLS_components.mduiIconTextFields | typeof __VLS_components.MduiIconTextFields | typeof __VLS_components['mdui-icon-text-fields']} */
mduiIconTextFields;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
var __VLS_19;
var __VLS_20;
let __VLS_30;
/** @ts-ignore @type { | typeof __VLS_components.mduiMenu | typeof __VLS_components.MduiMenu | typeof __VLS_components['mdui-menu'] | typeof __VLS_components.mduiMenu | typeof __VLS_components.MduiMenu | typeof __VLS_components['mdui-menu']} */
mduiMenu;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
}));
const __VLS_32 = __VLS_31({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_35;
const __VLS_36 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_37 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_38 } = __VLS_33.slots;
let __VLS_39;
/** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
mduiMenuItem;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
    ...{ style: {} },
}));
const __VLS_41 = __VLS_40({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
let __VLS_44;
const __VLS_45 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('highlight');
            // @ts-ignore
            [emit,];
        } });
const __VLS_46 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_47 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_48 } = __VLS_42.slots;
if (__VLS_ctx.isHighlighted) {
    let __VLS_49;
    /** @ts-ignore @type { | typeof __VLS_components.mduiIconFormatColorReset | typeof __VLS_components.MduiIconFormatColorReset | typeof __VLS_components['mdui-icon-format-color-reset'] | typeof __VLS_components.mduiIconFormatColorReset | typeof __VLS_components.MduiIconFormatColorReset | typeof __VLS_components['mdui-icon-format-color-reset']} */
    mduiIconFormatColorReset;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        slot: "icon",
    }));
    const __VLS_51 = __VLS_50({
        slot: "icon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
}
else {
    let __VLS_54;
    /** @ts-ignore @type { | typeof __VLS_components.mduiIconBorderColor | typeof __VLS_components.MduiIconBorderColor | typeof __VLS_components['mdui-icon-border-color'] | typeof __VLS_components.mduiIconBorderColor | typeof __VLS_components.MduiIconBorderColor | typeof __VLS_components['mdui-icon-border-color']} */
    mduiIconBorderColor;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
        slot: "icon",
    }));
    const __VLS_56 = __VLS_55({
        slot: "icon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
}
// @ts-ignore
[isHighlighted,];
var __VLS_42;
var __VLS_43;
let __VLS_59;
/** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
mduiMenuItem;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
    ...{ style: {} },
}));
const __VLS_61 = __VLS_60({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
let __VLS_64;
const __VLS_65 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('header');
            // @ts-ignore
            [emit,];
        } });
const __VLS_66 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_67 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_68 } = __VLS_62.slots;
let __VLS_69;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconTitle | typeof __VLS_components.MduiIconTitle | typeof __VLS_components['mdui-icon-title'] | typeof __VLS_components.mduiIconTitle | typeof __VLS_components.MduiIconTitle | typeof __VLS_components['mdui-icon-title']} */
mduiIconTitle;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    slot: "icon",
}));
const __VLS_71 = __VLS_70({
    slot: "icon",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
// @ts-ignore
[];
var __VLS_62;
var __VLS_63;
let __VLS_74;
/** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
mduiMenuItem;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
    ...{ style: {} },
}));
const __VLS_76 = __VLS_75({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
let __VLS_79;
const __VLS_80 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('list');
            // @ts-ignore
            [emit,];
        } });
const __VLS_81 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_82 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_83 } = __VLS_77.slots;
let __VLS_84;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconFormatListBulleted | typeof __VLS_components.MduiIconFormatListBulleted | typeof __VLS_components['mdui-icon-format-list-bulleted'] | typeof __VLS_components.mduiIconFormatListBulleted | typeof __VLS_components.MduiIconFormatListBulleted | typeof __VLS_components['mdui-icon-format-list-bulleted']} */
mduiIconFormatListBulleted;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    slot: "icon",
}));
const __VLS_86 = __VLS_85({
    slot: "icon",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
// @ts-ignore
[];
var __VLS_77;
var __VLS_78;
let __VLS_89;
/** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
mduiMenuItem;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    ...{ style: {} },
}));
const __VLS_91 = __VLS_90({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
let __VLS_94;
const __VLS_95 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('link');
            // @ts-ignore
            [emit,];
        } });
const __VLS_96 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_97 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_98 } = __VLS_92.slots;
let __VLS_99;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconLink | typeof __VLS_components.MduiIconLink | typeof __VLS_components['mdui-icon-link'] | typeof __VLS_components.mduiIconLink | typeof __VLS_components.MduiIconLink | typeof __VLS_components['mdui-icon-link']} */
mduiIconLink;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    slot: "icon",
}));
const __VLS_101 = __VLS_100({
    slot: "icon",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
// @ts-ignore
[];
var __VLS_92;
var __VLS_93;
let __VLS_104;
/** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
mduiMenuItem;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    ...{ style: {} },
}));
const __VLS_106 = __VLS_105({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_109;
const __VLS_110 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('escape');
            // @ts-ignore
            [emit,];
        } });
const __VLS_111 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_112 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_113 } = __VLS_107.slots;
let __VLS_114;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconDataObject | typeof __VLS_components.MduiIconDataObject | typeof __VLS_components['mdui-icon-data-object'] | typeof __VLS_components.mduiIconDataObject | typeof __VLS_components.MduiIconDataObject | typeof __VLS_components['mdui-icon-data-object']} */
mduiIconDataObject;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
    slot: "icon",
}));
const __VLS_116 = __VLS_115({
    slot: "icon",
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
// @ts-ignore
[];
var __VLS_107;
var __VLS_108;
let __VLS_119;
/** @ts-ignore @type { | typeof __VLS_components.mduiDivider | typeof __VLS_components.MduiDivider | typeof __VLS_components['mdui-divider'] | typeof __VLS_components.mduiDivider | typeof __VLS_components.MduiDivider | typeof __VLS_components['mdui-divider']} */
mduiDivider;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({}));
const __VLS_121 = __VLS_120({}, ...__VLS_functionalComponentArgsRest(__VLS_120));
let __VLS_124;
/** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
mduiMenuItem;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    disabled: (!__VLS_ctx.canUndo),
    tabindex: "-1",
    ...{ style: {} },
}));
const __VLS_126 = __VLS_125({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    disabled: (!__VLS_ctx.canUndo),
    tabindex: "-1",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_129;
const __VLS_130 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('undo');
            // @ts-ignore
            [emit, canUndo,];
        } });
const __VLS_131 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_132 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_133 } = __VLS_127.slots;
let __VLS_134;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconUndo | typeof __VLS_components.MduiIconUndo | typeof __VLS_components['mdui-icon-undo'] | typeof __VLS_components.mduiIconUndo | typeof __VLS_components.MduiIconUndo | typeof __VLS_components['mdui-icon-undo']} */
mduiIconUndo;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
    slot: "icon",
}));
const __VLS_136 = __VLS_135({
    slot: "icon",
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
// @ts-ignore
[];
var __VLS_127;
var __VLS_128;
let __VLS_139;
/** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
mduiMenuItem;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
    ...{ style: {} },
}));
const __VLS_141 = __VLS_140({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
let __VLS_144;
const __VLS_145 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('format');
            // @ts-ignore
            [emit,];
        } });
const __VLS_146 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_147 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_148 } = __VLS_142.slots;
let __VLS_149;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconSpellcheck | typeof __VLS_components.MduiIconSpellcheck | typeof __VLS_components['mdui-icon-spellcheck'] | typeof __VLS_components.mduiIconSpellcheck | typeof __VLS_components.MduiIconSpellcheck | typeof __VLS_components['mdui-icon-spellcheck']} */
mduiIconSpellcheck;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
    slot: "icon",
}));
const __VLS_151 = __VLS_150({
    slot: "icon",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
// @ts-ignore
[];
var __VLS_142;
var __VLS_143;
// @ts-ignore
[];
var __VLS_33;
var __VLS_34;
// @ts-ignore
[];
var __VLS_10;
var __VLS_11;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "spacer" },
});
/** @type {__VLS_StyleScopedClasses['spacer']} */ ;
let __VLS_154;
/** @ts-ignore @type { | typeof __VLS_components.mduiDropdown | typeof __VLS_components.MduiDropdown | typeof __VLS_components['mdui-dropdown'] | typeof __VLS_components.mduiDropdown | typeof __VLS_components.MduiDropdown | typeof __VLS_components['mdui-dropdown']} */
mduiDropdown;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
}));
const __VLS_156 = __VLS_155({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
let __VLS_159;
const __VLS_160 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_161 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_162 } = __VLS_157.slots;
let __VLS_163;
/** @ts-ignore @type { | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon'] | typeof __VLS_components.mduiButtonIcon | typeof __VLS_components.MduiButtonIcon | typeof __VLS_components['mdui-button-icon']} */
mduiButtonIcon;
// @ts-ignore
const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    slot: "trigger",
    tooltip: "AI Prompts",
    ...{ style: {} },
    tabindex: "-1",
}));
const __VLS_165 = __VLS_164({
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    slot: "trigger",
    tooltip: "AI Prompts",
    ...{ style: {} },
    tabindex: "-1",
}, ...__VLS_functionalComponentArgsRest(__VLS_164));
let __VLS_168;
const __VLS_169 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_170 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_171 } = __VLS_166.slots;
let __VLS_172;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconSmartToy | typeof __VLS_components.MduiIconSmartToy | typeof __VLS_components['mdui-icon-smart-toy'] | typeof __VLS_components.mduiIconSmartToy | typeof __VLS_components.MduiIconSmartToy | typeof __VLS_components['mdui-icon-smart-toy']} */
mduiIconSmartToy;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({}));
const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
// @ts-ignore
[];
var __VLS_166;
var __VLS_167;
let __VLS_177;
/** @ts-ignore @type { | typeof __VLS_components.mduiMenu | typeof __VLS_components.MduiMenu | typeof __VLS_components['mdui-menu'] | typeof __VLS_components.mduiMenu | typeof __VLS_components.MduiMenu | typeof __VLS_components['mdui-menu']} */
mduiMenu;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177({
    ...{ 'onChange': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
}));
const __VLS_179 = __VLS_178({
    ...{ 'onChange': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    tabindex: "-1",
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
let __VLS_182;
const __VLS_183 = ({ change: {} },
    { onChange: ((e) => __VLS_ctx.handlePromptSelect(e.target.value)) });
const __VLS_184 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_185 = ({ mousedown: {} },
    { onMousedown: () => { } });
const { default: __VLS_186 } = __VLS_180.slots;
for (const [p] of __VLS_vFor((__VLS_ctx.prompts))) {
    let __VLS_187;
    /** @ts-ignore @type { | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item'] | typeof __VLS_components.mduiMenuItem | typeof __VLS_components.MduiMenuItem | typeof __VLS_components['mdui-menu-item']} */
    mduiMenuItem;
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent1(__VLS_187, new __VLS_187({
        ...{ 'onPointerdown': {} },
        ...{ 'onMousedown': {} },
        key: (p.id),
        value: (p.id),
        ...{ style: {} },
        tabindex: "-1",
    }));
    const __VLS_189 = __VLS_188({
        ...{ 'onPointerdown': {} },
        ...{ 'onMousedown': {} },
        key: (p.id),
        value: (p.id),
        ...{ style: {} },
        tabindex: "-1",
    }, ...__VLS_functionalComponentArgsRest(__VLS_188));
    let __VLS_192;
    const __VLS_193 = ({ pointerdown: {} },
        { onPointerdown: () => { } });
    const __VLS_194 = ({ mousedown: {} },
        { onMousedown: () => { } });
    const { default: __VLS_195 } = __VLS_190.slots;
    (p.name);
    // @ts-ignore
    [handlePromptSelect, prompts,];
    var __VLS_190;
    var __VLS_191;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_180;
var __VLS_181;
// @ts-ignore
[];
var __VLS_157;
var __VLS_158;
let __VLS_196;
/** @ts-ignore @type { | typeof __VLS_components.mduiFab | typeof __VLS_components.MduiFab | typeof __VLS_components['mdui-fab'] | typeof __VLS_components.mduiFab | typeof __VLS_components.MduiFab | typeof __VLS_components['mdui-fab']} */
mduiFab;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    size: "small",
    ...{ class: "run-fab" },
    loading: (__VLS_ctx.isProcessing),
    tabindex: "-1",
    tooltip: "Run AI Prompt",
    ...{ style: {} },
}));
const __VLS_198 = __VLS_197({
    ...{ 'onClick': {} },
    ...{ 'onPointerdown': {} },
    ...{ 'onMousedown': {} },
    size: "small",
    ...{ class: "run-fab" },
    loading: (__VLS_ctx.isProcessing),
    tabindex: "-1",
    tooltip: "Run AI Prompt",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
let __VLS_201;
const __VLS_202 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('run-prompt');
            // @ts-ignore
            [emit, isProcessing,];
        } });
const __VLS_203 = ({ pointerdown: {} },
    { onPointerdown: () => { } });
const __VLS_204 = ({ mousedown: {} },
    { onMousedown: () => { } });
/** @type {__VLS_StyleScopedClasses['run-fab']} */ ;
const { default: __VLS_205 } = __VLS_199.slots;
let __VLS_206;
/** @ts-ignore @type { | typeof __VLS_components.mduiIconPlayArrow | typeof __VLS_components.MduiIconPlayArrow | typeof __VLS_components['mdui-icon-play-arrow'] | typeof __VLS_components.mduiIconPlayArrow | typeof __VLS_components.MduiIconPlayArrow | typeof __VLS_components['mdui-icon-play-arrow']} */
mduiIconPlayArrow;
// @ts-ignore
const __VLS_207 = __VLS_asFunctionalComponent1(__VLS_206, new __VLS_206({
    slot: "icon",
}));
const __VLS_208 = __VLS_207({
    slot: "icon",
}, ...__VLS_functionalComponentArgsRest(__VLS_207));
// @ts-ignore
[];
var __VLS_199;
var __VLS_200;
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
