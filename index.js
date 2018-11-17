/*
 ** This plugin is inspired by @vue/cli-service ModernModePlugin
 ** https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/webpack/ModernModePlugin.js
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
// https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc
const safariFix = `!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();`

class ModernWebpackPlugin {
  constructor({ targetDir, isModernBuild }) {
    this.targetDir = targetDir
  }

  apply(compiler) {
    this.applyModern(compiler)
  }

  createResourceHints(href, type) {
    const payload = {
      tagName: 'link',
      closeTag: true,
      attributes: {
        rel: type === 'script' ? 'modulepreload' : 'preload',
        href
      }
    }
    if (type === 'style') {
      payload.attributes.as = type
    }
    return preload;
  }
  addResourceHintTags(data) {
    const newHeadAsset = []
    data.body = data.body.map((tag) => {

    })
    data.head = data.head.map((tag) => {
      if (tag.tagName.toLowerCase() === 'link' && tag.attributes && !tag.attributes.rel) {
        newHeadAsset.push(this.createResourceHints(tag.attributes.href, 'style'));
      }
      return tag;
    })
    data.head.push(...newHeadAsset);
    return data;
  }
  applyModern(compiler) {
    const ID = `assets-modern-bundle`
    compiler.hooks.compilation.tap(ID, (compilation) => {
      // For html-webpack-plugin 4.0
      // HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(ID, async (data, cb) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(ID, async (data, cb) => {
        // use <script type="module"> for modern assets
        data = this.addResourceHintTags(data);

        // inject Safari 10 nomodule fix
        data.body.push({
          tagName: 'script',
          closeTag: true,
          innerHTML: safariFix
        })
        cb()
      })
    })
  }
}

ModernWebpackPlugin.safariFix = safariFix

module.exports = ModernWebpackPlugin