'use client'
import React, { useState } from 'react'
import { Markdown } from '@/app/components/base/markdown'

const HtmlTestDemo: React.FC = () => {
  const [testContent, setTestContent] = useState(`
# HTML渲染测试Demo

## 基础HTML标签测试

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

## 交互按钮测试

:::html
<div style="text-align: center; margin: 24px 0;">
  <a href="https://github.com/langgenius/dify" target="_blank" style="
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    font-size: 16px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
  " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.3)'">
    🚀 访问 Dify GitHub
  </a>
</div>
:::

## 职位推荐卡片测试

按照截图样式实现：

:::html
<div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
  <!-- 标题部分 -->
  <div style="margin-bottom: 20px;">
    <h2 style="font-size: 18px; font-weight: 600; color: #333; margin: 0 0 8px 0;">
      为您推荐3个职位
    </h2>
    <p style="font-size: 14px; color: #999; margin: 0;">
      根据你的背景和期望匹配
    </p>
  </div>
  
  <!-- 职位卡片 - 垂直排列 -->
  <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;">
    <!-- 职位卡片1 -->
    <div style="
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: relative;
    ">
      <!-- 高度匹配标签 -->
      <div style="position: absolute; top: 16px; right: 16px;">
        <span style="
          background-color: #fff3e0;
          color: #ff9800;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        ">高度匹配</span>
      </div>
      
      <div style="margin-right: 80px;">
        <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0 0 8px 0;">
          算法工程师
        </h3>
        
        <p style="font-size: 14px; color: #333; margin: 0 0 4px 0;">
          新兴广告科技公司
        </p>
        
        <p style="font-size: 13px; color: #999; margin: 0 0 16px 0;">
          上海市 · 1天前
        </p>
        
        <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0;">
          在这个职位上，你将 设计、开发并优化AI Agent系统，支持广告投放、创意生成、渠道整合等自动化任务。构建基于LLM的agent应用，涵盖context...
        </p>
      </div>
    </div>
    
    <!-- 职位卡片2 -->
    <div style="
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    ">
      <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0 0 8px 0;">
        应用工程师 - 大模型
      </h3>
      
      <p style="font-size: 14px; color: #333; margin: 0 0 4px 0;">
        综合型科技公司
      </p>
      
      <p style="font-size: 13px; color: #999; margin: 0 0 16px 0;">
        上海市 · ¥200现金 · 5天前
      </p>
      
      <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0;">
        在这个职位上，你将 负责仿真情境陪伴类机器人的性格设定以及决策逻辑，为智能设备赋予独特个性与智能决策能力。聚焦于AI Agent项目中的大模...
      </p>
    </div>
    
    <!-- 职位卡片3 -->
    <div style="
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    ">
      <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0 0 8px 0;">
        算法工程师
      </h3>
      
      <p style="font-size: 14px; color: #333; margin: 0 0 4px 0;">
        AI+算法公司
      </p>
      
      <p style="font-size: 13px; color: #999; margin: 0 0 16px 0;">
        深圳市
      </p>
      
      <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0;">
        在这个职位上，你将负责大模型算法研发工作，推进机器学习技术在实际业务中的应用，探索AI技术前沿...
      </p>
    </div>
  </div>

  <!-- 阿里系岗位列表部分 -->
  <div>
    <h2 style="font-size: 18px; font-weight: 600; color: #333; margin: 0 0 16px 0;">
      为你推荐3个阿里系AI初创公司岗位：
    </h2>
    
    <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <div style="line-height: 1.8;">
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #333;">
          <strong>1. 算法总监</strong>（深圳）：多模态大模型研发，阿里系团队，管理30+人
        </p>
        
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #333;">
          <strong>2. 大模型应用工程师</strong>（上海）：Qwen模型优化，前阿里P8带队
        </p>
        
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #333;">
          <strong>3. 算法工程师</strong>：LLM系统开发，需Function Calling技术栈
        </p>
        
        <p style="font-size: 14px; color: #333; margin: 0; padding-top: 16px; border-top: 1px solid #f0f0f0;">
          需要哪个岗位的详细职责？
        </p>
      </div>
    </div>
  </div>
</div>
:::
  `)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', overflow: 'auto', height: '100vh' }}>
      <h1>HTML渲染测试Demo</h1>
      <div><strong>新语法</strong>：使用 <code>:::html</code> ... <code>:::</code> 来包围需要自定义渲染的HTML</div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="content-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          测试内容（可编辑）：
        </label>
        <textarea
          id="content-input"
          value={testContent}
          onChange={e => setTestContent(e.target.value)}
          style={{
            width: '100%',
            height: '200px',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>渲染结果：</h2>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#fff',
        }}>
          <Markdown content={testContent} />
        </div>
      </div>

    </div>
  )
}

export default HtmlTestDemo
