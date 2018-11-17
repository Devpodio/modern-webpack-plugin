const HtmlWebpackPlugin = require('html-webpack-plugin');
process.env.DEBUG='modern'
const debug = require('debug')('modern')
// https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc
const safariFix = `!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();`

class ModernWebpackPlugin {
  constructor(pre='preload') {
    this.pre = pre;
  }
  apply(compiler) {
    this.applyModern(compiler)
  }

  createResourceHints(href, type) {
    const payload = {
      tagName: 'link',
      closeTag: true,
      attributes: {
        rel: (type === 'script' && this.pre !== 'preload') ? 'modulepreload' : 'preload',
        href
      }
    }
    if (type === 'style') {
      payload.attributes.as = type
    }
    return payload;
  }
  addResourceHintTags(data) {
    const newHeadAsset = []
    data.body = data.body.map((tag) => {
      if (tag.tagName.toLowerCase() === 'script' && tag.attributes) {
        debug('adding script resource hint to', tag.attributes.src)
        newHeadAsset.push(this.createResourceHints(tag.attributes.src, 'script'));
        if(this.pre !== 'preload') {
          tag.attributes.type = 'module'
        }        
      }
      return tag;
    })
    data.head = data.head.map((tag) => {
      if (tag.tagName.toLowerCase() === 'link' && tag.attributes) {
        debug('adding style resource hint to', tag.attributes.href)
        newHeadAsset.push(this.createResourceHints(tag.attributes.href, 'style'));
      }
      return tag;
    })
    debug('new head tags', JSON.stringify(newHeadAsset));
    data.head.unshift(...newHeadAsset);
    return data;
  }
  applyModern(compiler) {
    const ID = `assets-modern-bundle`
    compiler.hooks.compilation.tap(ID, (compilation) => {
      // For html-webpack-plugin 4.0
      // HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(ID, async (data, cb) => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(ID, async (data, cb) => {
        // use <script type="module"> for modern assets
        data = this.addResourceHintTags(data);

        // inject Safari 10 nomodule fix
        data.body.push({
          tagName: 'script',
          closeTag: true,
          innerHTML: safariFix
        })
        debug('body tags',data.body);
        debug('head tags',data.head);
        cb()
      })
    })
  }
}

ModernWebpackPlugin.safariFix = safariFix

module.exports = ModernWebpackPlugin