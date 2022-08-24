// @ts-check

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const outputFileName = 'fpDataMeanings.xlsx';

// paste fp_data here:
const fp_data = '****';

/**
 * @typedef FingerprintDataMeaning
 * @property {string} name
 * @property {string} [section]
 * @property {string} [desc]
 * @property {string} value
 * @property {string} sep
 */

/** @type {FingerprintDataMeaning[]} */
const fpDataMeanings = [];

const [
    startValueMustBe2,
    bmSzParsedValue0,
    bmSzParsedValue1,
    timeDiffs,
    ...encryptedFPDatas
] = fp_data.split(';');

assert(startValueMustBe2 === '2', 'startValueMustBe2 is not 2');
fpDataMeanings.push({
    name: 'startValueMustBe2',
    value: startValueMustBe2,
    sep: ';',
});

fpDataMeanings.push({
    name: 'bmSzParsedValue0',
    value: bmSzParsedValue0,
    sep: ';',
});
fpDataMeanings.push({
    name: 'bmSzParsedValue1',
    value: bmSzParsedValue1,
    sep: ';',
});
fpDataMeanings.push({
    name: 'timeDiffs',
    value: timeDiffs,
    sep: ';',
});

const encryptedFPData = encryptedFPDatas.join(';');

const decodeArr = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, -1, 2, 3, 4, 5,
    -1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
    44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, -1, 58, 59, 60, 61,
    62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
    81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91,
];

const chars =
    ' !#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~';

// logic from AKBM v2 de-obfuscated code
// it really sucks...
const firstDec = (fp, bmSzFirstComp) => {
    let dec = '';

    let bmSzFC = bmSzFirstComp;

    for (let i = 0; i < fp.length; i += 1) {
        const shifted = (bmSzFC >> 8) & 65535;
        bmSzFC *= 65793;
        bmSzFC &= 4294967295;
        bmSzFC += 4282663;
        bmSzFC &= 8388607;

        // snippet taken from github.com/SteakEnthusiast
        let newIndex = decodeArr[fp.charCodeAt(i)];
        newIndex -= shifted % chars.length;
        if (newIndex < 0) {
            newIndex += chars.length;
        }

        dec += chars[newIndex];
    }

    return dec;
};

const secondDec = (payload, bmSzSecondComp) => {
    const pcs = payload.split(',');
    const mixingIndexes = [];
    let bmSzSC = bmSzSecondComp;

    for (let i = 0; i < pcs.length; i += 1) {
        const x = ((bmSzSC >> 8) & 65535) % pcs.length;
        bmSzSC *= 65793;
        bmSzSC &= 4294967295;
        bmSzSC += 4282663;
        bmSzSC &= 8388607;

        const y = ((bmSzSC >> 8) & 65535) % pcs.length;
        bmSzSC *= 65793;
        bmSzSC &= 4294967295;
        bmSzSC += 4282663;
        bmSzSC &= 8388607;

        mixingIndexes.push([x, y]);
    }

    for (let i = mixingIndexes.length - 1; i >= 0; i -= 1) {
        const [x, y] = mixingIndexes[i];

        const pc = pcs[x];
        pcs[x] = pcs[y];
        pcs[y] = pc;
    }

    return pcs.join(',');
};

let cleanedData = firstDec(encryptedFPData, bmSzParsedValue0);
cleanedData = secondDec(cleanedData, bmSzParsedValue1);

const seperator = cleanedData.substring(1, cleanedData.indexOf('2,', 2));

const cleanedDataParts = cleanedData.split(seperator);
console.log(cleanedDataParts);

//
// now we have the fp data in the form of an array of strings
//
for (let n = 0; n < cleanedDataParts.length; ++n) {
    const dataPart = cleanedDataParts[n];
    if (n === 0 || n === 1) {
        assert(dataPart === '2');
        continue;
    }

    if (n === 2) {
        fpDataMeanings.push({
            name: 'randomString1',
            value: dataPart,
            sep: seperator,
        });
        continue;
    }

    if (n === 3) {
        fpDataMeanings.push({
            name: 'randomTime1',
            value: dataPart,
            sep: seperator,
        });
        continue;
    }

    // 从这里开始解析固定值
    const dataKey = dataPart;
    const dataValue = cleanedDataParts[++n];

    switch (dataKey) {
        case '-100':
            {
                const names = [
                    'userAgent0',
                    'userAgent1',
                    'uaend',
                    'windowCapacityBits',
                    'navigator_productSub',
                    'navigator_language',
                    'navigator_product',
                    'navigator_plugins_length',
                    '_phantom',
                    'webdriver',
                    'domAutomation',
                    'bmak_startTs_Devide_4064256',
                    'zeroSep1',
                    'screen_availWidth',
                    'screen_availHeight',
                    'screen_width',
                    'screen_height',
                    'window_innerWidth_or_body_clientWidth_or_documentElement_clientWidth',
                    'window_innerHeight_or_body_clientHeight_or_documentElement_clientHeight',
                    'window_outerWidth',
                    'emptyValue0',
                    'window_callPhantom',
                    'window_ActiveXObject',
                    'document_documentMode',
                    'window_chrome_webstore',
                    'navigator_onLine',
                    'window_opera',
                    'window_InstallTrigger',
                    'window_HTMLElement_toString_Constructor',
                    'window_RTCPeerConnection',
                    'window_mozInnerScreenY',
                    'navigator_vibrate',
                    'navigator_getBattery',
                    'Array_prototype_forEach',
                    'FileReader_in_window',
                    'userAgentWithO5Value',
                    'randomValue2',
                    'bmak_startTs_devide2',
                    'braveSignal',
                ];

                const values = dataValue.split(',');
                for (let i = 0; i < names.length; ++i) {
                    fpDataMeanings.push({
                        name: names[i],
                        value: values[i],
                        sep: ',',
                    });
                }
            }
            break;

        case '-105':
            {
                const names = [
                    'inputType',
                    'inputAutoCompleteOff',
                    'inputDefaultValueEqualsValue',
                    'inputRequired',
                    'inputId',
                    'inputName',
                    'inputDefaultValueHasValue',
                ];

                const values = dataValue.split(',');
                for (let i = 0; i < values.length; ++i) {
                    fpDataMeanings.push({
                        name: names[i % names.length],
                        value: values[i],
                        sep: ',',
                    });
                }
            }
            break;

        case '-108':
            {
                fpDataMeanings.push({
                    name: 'keyEventValues',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-101':
            {
                fpDataMeanings.push({
                    name: 'windowEvents',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-110':
            {
                fpDataMeanings.push({
                    name: 'mouseEvents',
                    value: JSON.stringify(
                        dataValue.split(';').map((e) => {
                            const [
                                mouseEventCounter,
                                mouseEventType,
                                timeDiff300,
                                mouseEventX,
                                mouseEventY,
                                eventTargetIdHex,
                                isTrusted,
                            ] = e.split(',');

                            return {
                                mouseEventCounter,
                                mouseEventType,
                                timeDiff300,
                                mouseEventX,
                                mouseEventY,
                                eventTargetIdHex,
                                isTrusted,
                            };
                        })
                    ),
                    sep: ',',
                });
            }
            break;

        case '-117':
            {
                fpDataMeanings.push({
                    name: 'touchEventValues',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-109':
            {
                fpDataMeanings.push({
                    name: 'deviceMotionEventValues',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-102':
            {
                fpDataMeanings.push({
                    name: 'forminfo2',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-111':
            {
                fpDataMeanings.push({
                    name: 'deviceOrientationValue',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-114':
            {
                fpDataMeanings.push({
                    name: 'pointerEventValues',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-103':
            {
                fpDataMeanings.push({
                    name: 'onBlurOnFocusEventValues',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-106':
            {
                fpDataMeanings.push({
                    name: `ajax_type + ___ajax_post_fpData_count`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-115':
            {
                const names = [
                    'O9 + 1 (Looks like relative to keyEvent)',
                    'J9 + 32 (Looks like relative to mouseEvent)',
                    'unknown: A9 + 32',
                    'unknown: Z9',
                    'unknown: U9',
                    'unknown: K9',
                    'unknown: b9 (Looks like event counter)',
                    'deltaTimestamp',
                    'const: 0',
                    'bmak_startTs',
                    'DN.td (some time diff)',
                    'bmak_startTs_devide_4064256_devide_23',
                    'keyEventCounter_1',
                    'mouseEventCounter_1',
                    'bmak_startTs_devide_4064256_devide_23_devide_6',
                    'touchEventCounter_1',
                    'pointerEventCounter_1',
                    'timeDiff100',
                    'timeDiffsInEvents', // comma separated list of time diffs
                    'abckNotAvailable',
                    'cookieAbckValue',
                    'cookieAbckValue_CharCodes',
                    'DN.rVal (canvas with rand number)',
                    'DN.rCFP (canvas with rand number dataURL)',
                    'windowPropsBits',
                    'const: PiZtE',
                    'randomValue: N9[0]',
                    'randomValue: N9[1]',
                    'isInAutoControlSystem',
                    'navigator_webdriver',
                    'unknown: x5',
                ];

                const values = dataValue.split(',');
                for (let i = 0; i < values.length; ++i) {
                    fpDataMeanings.push({
                        name: names[i],
                        value: values[i],
                        sep: ',',
                    });
                }
            }
            break;

        case '-112':
            {
                fpDataMeanings.push({
                    name: `document_URL`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-119':
            {
                fpDataMeanings.push({
                    name: `const: -1`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-122':
            {
                fpDataMeanings.push({
                    name: `seleniumData`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-123':
            {
                fpDataMeanings.push({
                    name: `unknown: mn_r part 1`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-124':
            {
                fpDataMeanings.push({
                    name: `unknown: mn_r part 2`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-126':
            {
                fpDataMeanings.push({
                    name: `unknown: mn_r part 3`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-127':
            {
                fpDataMeanings.push({
                    name: `navigator_permissions_type`,
                    section: '-127',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-128':
            {
                const names = [
                    'iframe_srcdoc_value',
                    'iframe_srcdoc_value_not_equals_to_rand_value',
                    'iframe_contentWindow_chrome_keys',
                    'iframe_contentWindow_get_check',
                    'iframe_hardwareConcurrency',
                    'iframe_plugins_count',
                    'iframe_has_chromeObj',
                    'window_hardwareConcurrency',
                    'window_plugins',
                    'window_chromeObj',
                    'iframe_webGLVendor',
                    'iframe_webGLRenderer0',
                    'iframe_webGLRenderer1',
                    'iframe_webGLRenderer2',
                    'iframePrototypeLoadingCheck',
                    'divComputedColorCheck',
                ];

                const values = dataValue.split(',');
                for (let i = 0; i < values.length; ++i) {
                    fpDataMeanings.push({
                        name: names[i],
                        value: values[i],
                        sep: ',',
                    });
                }
            }
            break;

        case '-131':
            {
                const names = [
                    'performance_jsHeapSizeLimit',
                    'performance_totalJSHeapSize',
                    'performance_usedJSHeapSize',
                    'connection_rtt',
                    'speechVoicesCount',
                    'navigator_plugins[0][0]_check',
                    'navigator_plugins_refresh_check',
                    'navigator_plugins_items_check',
                    'File_prototype_checkValue',
                    'crossOriginIsolated_checkValue',
                ];

                const values = dataValue.split(',');
                for (let i = 0; i < values.length; ++i) {
                    fpDataMeanings.push({
                        name: names[i],
                        section: '-131',
                        value: values[i],
                        sep: ',',
                    });
                }
            }
            break;

        case '-132':
            {
                fpDataMeanings.push({
                    name: `chrome_loadTimes_runtime`,
                    section: '-132',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-133':
            {
                fpDataMeanings.push({
                    name: `navigatorPropertyDescs`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-70':
            {
                const names = [
                    'canvas_fps0',
                    'const: -1',
                    'const: dis',
                    'navigate_plugins_checkValue',
                    'window_sessionStorage_exist',
                    'window_localStorage_exist',
                    'window_indexedDB_exist',
                    'timezoneOffset',
                    'window_RTCPeerConnection_is_fn',
                    'screen_colorDepth',
                    'screen_pixelDepth',
                    'navigator_cookieEnabled',
                    'navigator_javaEnabled',
                    'navigator_doNotTrack',
                ];

                const values = dataValue.split(';');
                for (let i = 0; i < values.length; ++i) {
                    fpDataMeanings.push({
                        name: names[i],
                        value: values[i],
                        section: '-70',
                        sep: ',',
                    });
                }
            }
            break;

        case '-80':
            {
                fpDataMeanings.push({
                    name: `fpValStrHash`,
                    section: '-80',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-90':
            {
                fpDataMeanings.push({
                    name: `p9 (Looks like fps hash with rand number)`,
                    section: '-90',
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-116':
            {
                fpDataMeanings.push({
                    name: `const: 0`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        case '-129':
            {
                const names = [
                    'fontOffsetWidthHeightHex',
                    'window_devicePixelRatio',
                    'voicesURIsHex',
                    'webgl_VENDOR',
                    'webgl_RENDERER0',
                    'webgl_RENDERER1',
                    'webgl_RENDERER2',
                    'webgl_SupportedExtensionsHex',
                    'webgl_SupportedExtensionsLength',
                ];

                const values = dataValue.split(';');
                for (let i = 0; i < values.length; ++i) {
                    fpDataMeanings.push({
                        name: names[i],
                        value: values[i],
                        sep: ',',
                    });
                }
            }
            break;

        case '-130':
            {
                fpDataMeanings.push({
                    name: `const: 1`,
                    value: dataValue,
                    sep: ',',
                });
            }
            break;

        default:
            throw new Error('unknown data key: ' + dataKey);
    }
}

console.log(fpDataMeanings);

// 
// output, we need to yarn json2xls to use this
//
const json2xls = require('json2xls');
const xls = json2xls(fpDataMeanings);
fs.writeFileSync(
    path.resolve(__dirname, outputFileName),
    xls,
    'binary'
);
