import type { FC } from 'react'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import RehypeKatex from 'rehype-katex'
import RehypeRaw from 'rehype-raw'
import RemarkBreaks from 'remark-breaks'
import RemarkGfm from 'remark-gfm'
import RemarkMath from 'remark-math'
import AudioBlock from '@/app/components/base/markdown-blocks/audio-block'
import MarkdownButton from '@/app/components/base/markdown-blocks/button'
import MarkdownForm from '@/app/components/base/markdown-blocks/form'
import Img from '@/app/components/base/markdown-blocks/img'
import Link from '@/app/components/base/markdown-blocks/link'
import Paragraph from '@/app/components/base/markdown-blocks/paragraph'
import ThinkBlock from '@/app/components/base/markdown-blocks/think-block'
import ToolBlock from '@/app/components/base/markdown-blocks/tool-block'
import VideoBlock from '@/app/components/base/markdown-blocks/video-block'

import dynamic from '@/next/dynamic'

import { customUrlTransform } from './markdown-utils'

const CodeBlock = dynamic(() => import('@/app/components/base/markdown-blocks/code-block'), { ssr: false })

export type ReactMarkdownWrapperProps = {
  // eslint-disable-next-line ts/no-explicit-any
  latexContent: any
  customDisallowedElements?: string[]
  // eslint-disable-next-line ts/no-explicit-any
  customComponents?: Record<string, React.ComponentType<any>>
}

export const ReactMarkdownWrapper: FC<ReactMarkdownWrapperProps> = (props) => {
  const { customComponents, latexContent } = props

  return (
    <ReactMarkdown
      remarkPlugins={[
        RemarkGfm,
        [RemarkMath, { singleDollarTextMath: false }],
        RemarkBreaks,
      ]}
      rehypePlugins={[
        RehypeKatex,
        // eslint-disable-next-line ts/no-explicit-any
        RehypeRaw as any,
        // The Rehype plug-in is used to remove the ref attribute of an element
        () => {
          // eslint-disable-next-line ts/no-explicit-any
          return (tree: any) => {
            // eslint-disable-next-line ts/no-explicit-any
            const iterate = (node: any) => {
              if (node.type === 'element' && node.properties?.ref)
                delete node.properties.ref

              if (node.type === 'element' && !/^[a-z][a-z0-9]*$/i.test(node.tagName)) {
                node.type = 'text'
                node.value = `<${node.tagName}`
              }

              if (node.children)
                node.children.forEach(iterate)
            }
            tree.children.forEach(iterate)
          }
        },
      ]}
      urlTransform={customUrlTransform}
      disallowedElements={['iframe', 'head', 'html', 'meta', 'link', 'style', 'body', ...(props.customDisallowedElements || [])]}
      components={{
        code: CodeBlock,
        // eslint-disable-next-line ts/no-explicit-any
        pre: ({ children, ...props }: any) => {
          // 检查是否是 custom-html 代码块
          const child = React.Children.only(children)
          if (child && child.props && child.props.className?.includes('language-custom-html'))
            return children
          return <pre {...props}>{children}</pre>
        },
        img: Img as any,
        video: VideoBlock as any,
        audio: AudioBlock as any,
        a: Link as any,
        p: Paragraph as any,
        button: MarkdownButton as any,
        form: MarkdownForm as any,
        details: ThinkBlock as any,
        // eslint-disable-next-line ts/no-explicit-any
        div: (props: any) => {
          if (props['data-tool'])
            return <ToolBlock {...props} />
          return <div {...props} />
        },
        ...customComponents,
      }}
    >
      {/* Markdown detect has problem. */}
      {latexContent}
    </ReactMarkdown>
  )
}
