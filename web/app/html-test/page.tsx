'use client'
import React from 'react'
import { Editor } from '@monaco-editor/react'
import { Markdown } from '@/app/components/base/markdown'
import useTheme from '@/hooks/use-theme'
import { Theme } from '@/types/app'
import { useLocalStorageState } from 'ahooks'
import { Button } from '@heroui/react'

const DEFAULT_CONTENT = `
# HTML渲染测试Demo

## 交互按钮测试

:::html
<div style="display: flex; gap: 16px; justify-content: center; margin: 24px 0;">
  <a href="/resume" style="
    display: inline-block;
    background: linear-gradient(135deg, #1183CD 0%, #279D9F 100%);
    color: white;
    flex: 1;
    text-align: center;
    padding: 0 32px;
    height: 40px;
    line-height: 40px;
    border-radius: 24px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    box-sizing: border-box;
    transition: all 0.2s ease;
  ">
    查看优化后的简历
  </a>
  <a href="/recommend" style="
    display: inline-block;
    background: white;
    color: #1183CD;
    flex: 1;
    text-align: center;
    padding: 0 32px;
    height: 40px;
    line-height: 40px;
    border-radius: 24px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    border: 1px solid #1183CD;
    box-sizing: border-box;
    transition: all 0.2s ease;
  ">
    为我推荐职位
  </a>
</div>
:::

## 职位推荐卡片测试

:::html
<div style="background-color: #f7f8fa; padding: 16px; margin: 20px 0;">
  <!-- 职位卡片列表 -->
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <!-- 职位卡片1 - 销售经理 -->
    <a href="/jobs/sales-manager" style="text-decoration: none; color: inherit; display: block;">
      <div style="
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        transition: box-shadow 0.2s ease, transform 0.2s ease;
      ">
        <!-- 头部：职位名称 + 薪资 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0; padding: 0;">
              销售经理
            </h3>
            <span style="
              background-color: #ff6b35;
              color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: 600;
            ">HOT</span>
          </div>
          <div style="font-size: 18px; font-weight: 600; color: #1e88e5;">
            20-25K
          </div>
        </div>
        
        <!-- 标签 -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <span style="
            padding: 2px 6px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            background-color: #fafafa;
          ">经验不限</span>
          <span style="
            padding: 2px 6px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            background-color: #fafafa;
          ">能源行业</span>
          <span style="
            padding: 2px 6px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            background-color: #fafafa;
          ">本科</span>
        </div>
        
        <!-- 公司和地点 -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; color: #333;">
            光明集团
          </div>
          <div style="font-size: 12px; color: #999; display: flex; align-items: center; gap: 4px;">
            <span>📍</span>
            <span>上海·静安区</span>
          </div>
        </div>
      </div>
    </a>
    
    <!-- 职位卡片2 - 电池研发经理 -->
    <a href="/jobs/battery-rd-manager" style="text-decoration: none; color: inherit; display: block;">
      <div style="
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        transition: box-shadow 0.2s ease, transform 0.2s ease;
      ">
        <!-- 头部：职位名称 + 薪资 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0; padding: 0;">
              电池研发经理
            </h3>
          </div>
          <div style="font-size: 18px; font-weight: 600; color: #1e88e5;">
            面议
          </div>
        </div>
        
        <!-- 标签 -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <span style="
            padding: 2px 6px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            background-color: #fafafa;
          ">3-5年经验</span>
          <span style="
            padding: 2px 6px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            background-color: #fafafa;
          ">储能电池行业</span>
          <span style="
            padding: 2px 6px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            background-color: #fafafa;
          ">本科</span>
        </div>
        
        <!-- 公司和地点 -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; color: #333;">
            宁德时代电池
          </div>
          <div style="font-size: 12px; color: #999; display: flex; align-items: center; gap: 4px;">
            <span>📍</span>
            <span>上海·黄浦区</span>
          </div>
        </div>
      </div>
    </a>
    
    <!-- 职位卡片3 - C++开发工程师 -->
    <a href="/jobs/cpp-developer" style="text-decoration: none; color: inherit; display: block;">
      <div style="
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        transition: box-shadow 0.2s ease, transform 0.2s ease;
      ">
        <!-- 头部：职位名称 + 薪资 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0; padding: 0;">
              C++开发工程师
            </h3>
            <span style="
              background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%);
              color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: 600;
            ">NEW</span>
          </div>
          <div style="font-size: 18px; font-weight: 600; color: #1e88e5;">
            30-45K
          </div>
        </div>
        
        <!-- 标签 -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <span style="
            padding: 2px 6px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            background-color: #fafafa;
          ">5年经验</span>
          <span style="
            padding: 2px 6px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            background-color: #fafafa;
          ">跨境电商行业</span>
          <span style="
            padding: 2px 6px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            background-color: #fafafa;
          ">本科</span>
        </div>
        
        <!-- 公司和地点 -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; color: #333;">
            西门子能源有限公司
          </div>
          <div style="font-size: 12px; color: #999; display: flex; align-items: center; gap: 4px;">
            <span>📍</span>
            <span>上海·闵行区</span>
          </div>
        </div>
      </div>
    </a>
  </div>
  
  <!-- 查看更多按钮 -->
  <div style="text-align: center; margin-top: 20px;">
    <a href="/jobs" style="
      display: inline-block;
      background: white;
      color: #1183CD;
      padding: 0 24px;
      height: 40px;
      line-height: 40px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      border: 1px solid #1183CD;
      box-sizing: border-box;
      transition: all 0.2s ease;
    ">
      查看更多职位
    </a>
  </div>
</div>
:::

这是一个普通的段落，包含普通的**粗体文本**和*斜体文本*。

:::html
<div style="background-color: #f0f8ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
  <h3 style="color: #2563eb; margin-top: 0;">这是一个带样式的div容器</h3>
  <p style="margin: 8px 0;">这个容器包含了自定义的样式，包括背景色、内边距和圆角。</p>
  <ul>
    <li>列表项 1</li>
    <li>列表项 2</li>
    <li>包含 <span style="color: red; font-weight: bold;">红色粗体</span> 的列表项</li>
  </ul>
</div>
:::

## 表格测试

:::html
<table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
  <thead>
    <tr style="background-color: #f8f9fa;">
      <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">姓名</th>
      <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">年龄</th>
      <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">职业</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #dee2e6; padding: 12px;">张三</td>
      <td style="border: 1px solid #dee2e6; padding: 12px;">28</td>
      <td style="border: 1px solid #dee2e6; padding: 12px;">工程师</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
      <td style="border: 1px solid #dee2e6; padding: 12px;">李四</td>
      <td style="border: 1px solid #dee2e6; padding: 12px;">32</td>
      <td style="border: 1px solid #dee2e6; padding: 12px;">设计师</td>
    </tr>
  </tbody>
</table>
:::

## 自闭合标签测试

:::html
这里有一个换行：<br/>
这是第二行。

水平分割线：
<hr style="border: none; height: 2px; background-color: #e9ecef; margin: 16px 0;"/>
:::

## 代码块测试（应该不受HTML处理影响）

\`\`\`html
<div class="example">
  <p>这个HTML代码应该显示为代码，而不是被渲染</p>
</div>
\`\`\`

行内代码也应该不受影响：\`<span>这是代码</span>\`

## 混合内容测试

:::html
<blockquote style="border-left: 4px solid #007bff; padding-left: 16px; margin: 16px 0; font-style: italic; color: #6c757d;">
  这是一个引用块，包含了HTML样式的混合内容。
  
  可以包含多个段落和其他元素。
</blockquote>
:::

## 嵌套HTML测试

:::html
<div style="border: 2px solid #28a745; border-radius: 8px; padding: 16px; margin: 16px 0;">
  <details>
    <summary style="font-weight: bold; cursor: pointer; margin-bottom: 8px;">点击展开详细信息</summary>
    <div style="padding: 8px; background-color: #f8f9fa; border-radius: 4px;">
      <p>这是折叠内容中的段落。</p>
      <p>包含 <mark style="background-color: yellow; padding: 2px 4px;">高亮文本</mark> 和其他格式。</p>
    </div>
  </details>
</div>
:::
`

const HtmlTestDemo: React.FC = () => {
  const { theme } = useTheme()
  const [testContent, setTestContent] = useLocalStorageState('html-test-content', {
    defaultValue: DEFAULT_CONTENT,
  })

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
        <h1 className="text-lg font-bold text-gray-900">HTML渲染测试Demo</h1>
        <Button size='sm' onClick={() => setTestContent(DEFAULT_CONTENT)}>Reset Content</Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧编辑区域 */}
        <div className="flex w-1/2 flex-col border-r border-gray-200 bg-white">
          {/* 编辑器区域 */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Editor
              defaultLanguage='markdown'
              theme={theme === Theme.dark ? 'vs-dark' : 'vs'}
              value={testContent}
              onChange={value => setTestContent(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                tabSize: 2,
                wordWrap: 'on',
                wrappingIndent: 'same',
                scrollBeyondLastLine: false,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                renderLineHighlight: 'all',
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="flex w-1/2 flex-col overflow-auto bg-white">
          <div className="min-h-full p-4">
            <Markdown content={testContent} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HtmlTestDemo
