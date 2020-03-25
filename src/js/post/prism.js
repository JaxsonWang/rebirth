import {loadScripts, loadStyles} from '../untils';
import baseToast from '../other/toasts';

export const prism = async (window) => {
  // Prismjs 库地址
  const prismSrc = `https://cdn.jsdelivr.net/npm/prismjs@1.19.0`;
  // 高亮语法块
  const codeBlocks = await window.document.querySelectorAll('.post-content pre>code');
  // 如果语法块不处理
  if (codeBlocks.length === 0) return false;
  // 异步加载语法高亮样式脚本
  await loadStyles([
    {
      id: 'prism-line-numbers-css',
      url: `${prismSrc}/plugins/line-numbers/prism-line-numbers.min.css`
    },
    {
      id: 'prism-toolbar-css',
      url: `${prismSrc}/plugins/toolbar/prism-toolbar.min.css`
    }
  ]);
  // 异步加载语法高亮脚本
  await loadScripts([
    {
      id: 'prism-core-js',
      url: `${prismSrc}/components/prism-core.min.js`
    }
  ]).then(async () => {
    // 回调遍历语法块添加 “行数” 类名
    await codeBlocks.forEach(block => {
      block.parentNode.classList.add('overflow-hidden', 'line-numbers');
      // 添加 loading 罩层
      const loadingCover = window.document.createElement('div');
      loadingCover.id = 'pre-loading';
      loadingCover.className = 'd-flex justify-content-center align-items-center pre-block-loading';
      loadingCover.innerHTML = `<div class="loading"><div class="d-flex justify-content-center text-center loading-icon"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div><div class="text-center loading-text"><span>载入代码中...</span></div></div>`;
      const getCodeParen = block.parentNode;
      getCodeParen.insertBefore(loadingCover, block);
    });
    // 载入依赖 Prismjs 其他脚本
    await loadScripts([
      {
        id: 'prism-autoloader-js',
        url: `${prismSrc}/plugins/autoloader/prism-autoloader.min.js`
      },
      {
        id: 'prism-prism-toolbar-js',
        url: `${prismSrc}/plugins/toolbar/prism-toolbar.min.js`
      },
      {
        id: 'prism-line-numbers-js',
        url: `${prismSrc}/plugins/line-numbers/prism-line-numbers.min.js`
      }
    ]).then(async () => {
      // 自动化高亮库
      window.Prism.plugins.autoloader.languages_path = `${prismSrc}/components/`;
      // 注册按钮 - 显示语言
      window.Prism.plugins.toolbar.registerButton('show-language', (env) => {
        const button = document.createElement('div');
        button.className = 'show-language';
        button.innerHTML = `<i class="fas fa-code"></i> ${env.language}`;
        return button;
      });
      // 注册按钮 - 复制代码
      window.Prism.plugins.toolbar.registerButton('select-code', (env) => {
        const button = document.createElement('button');
        button.className = 'select-code';
        button.innerHTML = '复制代码';
        button.addEventListener('click', () => {
          if (document.body.createTextRange) {
            const range = document.body.createTextRange();
            range.moveToElementText(env.element);
            range.select();
          } else if (window.getSelection) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(env.element);
            selection.removeAllRanges();
            selection.addRange(range);
          }

          baseToast(window.jQuery, {
            id: 'prism-toast',
            content: '请按 Ctrl + C / Command + C 进行复制代码！'
          });
        });
        return button;
      });
      // 遍历 Dom
      await codeBlocks.forEach(block => {
        if (block.classList.contains('language-html')) {
          block.classList.remove('language-html');
          block.classList.add('language-markup');
        }
        // 初始化高亮
        window.Prism.highlightAll();

        // 移除 loading 罩层
        setTimeout(() => {
          block.parentNode.classList.remove('overflow-hidden');
          window.document.querySelector('#pre-loading').remove();
        }, 1000);
      });
    });
  });
};

export default prism(window);
