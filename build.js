#!/usr/bin/env node
"use strict"

import { rollup } from 'rollup'
// import { terser } from 'rollup-plugin-minification'
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets'
import svgo from 'svgo'
import fs, { cpSync, readFileSync, rmSync, writeFileSync } from 'fs'
import path from 'path'

const MAIN_JS_FILE_NAME = 'main.js'
const BUILD_DIR = 'dist'
const SVGO_PLUGINS = [
    // disable plugins
    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    // 'removeXMLNS',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    // 'removeViewBox',
    'cleanupEnableBackground',
    'minifyStyles',
    // 'convertStyleToAttrs',
    'convertColors',
    'convertPathData',
    'convertTransform',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    // 'prefixIds',
    'cleanupNumericValues',
    'cleanupListOfValues',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'removeRasterImages',
    'mergePaths',
    'convertShapeToPath',
    'convertEllipseToCircle',
    'sortAttrs',
    'sortDefsChildren',
    // 'removeDimensions',
    // 'removeAttrs',
    // 'removeAttributesBySelector',
    // 'removeElementsByAttr',
    // 'addClassesToSVGElement',
    // 'addAttributesToSVGElement',
    'removeOffCanvasPaths',
    // 'removeStyleElement',
    'removeScriptElement',
    'reusePaths',
]

function getBundle(url) {
    return rollup({
        input: url,
        plugins: [
            importMetaAssets({
                transform: async (assetBuffer, assetPath) => {
                    if (assetPath.endsWith('.js')) {
                        const bundle = await getBundle(assetPath)
                        const generateBundle = await bundle.generate({
                            // plugins: [terser()]
                        })
                        return generateBundle.output[0].code
                    } else if (assetPath.endsWith('.svg')) {
                        // @ts-ignore
                        return svgo.optimize(assetBuffer.toString(), { multipass: true, plugins: SVGO_PLUGINS }).data
                    } else {
                        return assetBuffer
                    }
                },
            }),
        ]
    })
}

async function writeBundle(bundle) {
    await bundle.write({
        dir: BUILD_DIR,
        format: 'es',
        // plugins: [terser()]
    })

    await bundle.close()
}

export async function buildFront() {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true })
    fs.mkdirSync(BUILD_DIR, { recursive: true })

    // js
    const rollupBuild = await getBundle(path.resolve('.', MAIN_JS_FILE_NAME))
    const rollupOutput = await rollupBuild.generate({ format: 'iife' })

    // html
    const html = readFileSync('./index.html').toString()

    const singleHtml = html.replace(/<script.*<\/script>/gm, `<script>${rollupOutput.output[0].code}</script>`)

    writeFileSync('./dist/index.html', singleHtml)

    cpSync('./style.css', './dist/style.css')
}

if (path.basename(process.argv[1]) === path.basename(import.meta.url)) {
    await buildFront()
}
