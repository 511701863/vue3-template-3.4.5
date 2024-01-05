import { fileURLToPath, URL } from 'node:url';
import * as path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import DefineOptions from 'unplugin-vue-define-options/vite';
import {
  ElementPlusResolver
} from 'unplugin-vue-components/resolvers';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
//浏览器兼容
import legacy from '@vitejs/plugin-legacy';
//打包可视化
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    UnoCSS(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          'vue': [
            'withDirectives',
            'resolveDirective'
          ]
        }
      ],
      dts: 'src/types/auto-imports.d.ts'
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      extensions: ['vue'],
      dts: 'src/types/components.d.ts',
      dirs: ['src/components']
    }),
    DefineOptions(),
    legacy({
      targets: ['chrome 52', 'not IE 11'],
      modernPolyfills: ['es.string.replace', 'esnext.string.replace-all'],
      polyfills: ['es.string.replace', 'esnext.string.replace-all']
    }),
    visualizer({
      emitFile: false,
      filename: 'stats.html',
      open: true
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svgs')],
      symbolId: 'icon-[dir]-[name]'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    minify: 'terser', //压缩方式
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    sourcemap: false,
    terserOptions: {
      compress: {
        // 生产环境时移除console
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        //静态资源分类打包
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        experimentalMinChunkSize: 10 * 1024, // 单位b 没有副作用，合并较小的模块
        manualChunks(id) {
          //静态资源分拆打包
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      },
      plugins: [
        viteCompression({
          algorithm: 'gzip',
          threshold: 10240,
          verbose: true, // 是否在控制台中输出压缩结果
          ext: '.gz',
          //浏览器在支持gzip压缩的情况下，会自动加载gzip压缩过的文件而不是源文件，所以为了项目的正常运行deleteOriginFile设为false，即不删除源文件
          deleteOriginFile: false
        })
      ]
    }
  }
});
