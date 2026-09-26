import type { NotionPost, NotionTag } from './notion';

export type OptimizedLocale = 'zh' | 'en';

export const optimizedRoots: Record<OptimizedLocale, string> = {
  zh: '/preview/optimized',
  en: '/preview/optimized/en',
};

const tagNames: Record<string, string> = {
  '📝 随笔': '📝 Notes',
  '🛠️ 技术': '🛠️ Tech',
  '🔗 分享': '🔗 Sharing',
  '❗ 重要': '❗ Featured',
  '👤 个人': '👤 Personal',
  '🚀 开始': '🚀 Start',
};

const publishedAtCorrections: Record<string, string> = {
  '20251018-essay-post': '2025-10-18',
};

interface EnglishPost {
  title: string;
  excerpt: string;
  content: string;
}

const englishPosts: Record<string, EnglishPost> = {
  '20251018-essay-post': {
    title: 'October 18, 2025 — Notes',
    excerpt: 'A few lessons and small tips from sharing community-operation content.',
    content: `Today, while writing a tutorial about community operations, I noticed a few details I had overlooked.

When I copied illustrated content from Feishu into the group, the paragraph breaks disappeared. The result felt dense and tiring to read.

Next time, I will share smaller pieces of content across several messages. How tightly information is packed can directly affect whether people are willing to engage with it.

That is all for today—and it is also the first entry I have published here.

Thanks for reading.`,
  },
  '20251019-essay-post': {
    title: 'October 19, 2025 — Notes',
    excerpt: 'I suddenly realized that I have been writing for 881 days. Time really moves fast.',
    content: `Today I sat down to write and suddenly had no idea what to say.

To be more precise, I had done many things, but I did not know which topic to choose. A completely unrelated subject felt abrupt; continuing yesterday's topic felt repetitive and uninteresting.

So I talked it through with ChatGPT. When it reminded me how long I had been writing, I felt briefly stunned.

There was a time when even 300 days seemed impossible. Now I have kept going for more than 800 days. That feels genuinely remarkable.

I have also come to understand that only the things I actually write become mine—even when the original reference came from someone else.

Write more. Publish more. Build up a body of work.`,
  },
  '20251020-essay-post': {
    title: 'October 20, 2025 — Notes',
    excerpt: 'Today I finally published the websites I built myself.',
    content: `Yesterday, someone commented that a post I wrote for WeChat felt too obviously AI-generated. My first reaction was embarrassment.

But after thinking about it, I realized the comment was fair. I had asked AI to expand on my core points. As someone who likes efficiency, I naturally try to reduce manual work wherever AI can help.

Yet in content creation I had forgotten the most important thing: the heart of a piece is not polished phrasing, but the creator's emotion and point of view. That is what makes it feel real.

We should think more deeply about how AI can improve efficiency without erasing our personal style.

Today I published both the Lingyi AI Tools directory and the Lingyi blog. I will keep improving them as new ideas emerge. If you have suggestions, I would be glad to hear them.`,
  },
  '20251021-essay-post': {
    title: 'October 21, 2025 — Notes',
    excerpt: 'Publish a real result first, and the attention of others becomes momentum to keep moving.',
    content: `After I shared the blog and AI tools directory in a WeChat article yesterday, a friend reached out to talk.

We discussed a few small problems with the blog, and they sent me several useful suggestions. Since they are also building a website, the conversation went deeper than I expected.

Writing this today made me realize that publishing your work is not actually that difficult. Once it is public, I also feel much more motivated to repair and improve it.

I do not yet know how many people are visiting—analytics can come later—but simply knowing that somebody may be paying attention creates a helpful sense of accountability.

If you also enjoy building with AI, feel free to come and talk.`,
  },
  '20251024-essay-post': {
    title: 'October 23, 2025 — Notes',
    excerpt: 'ChatGPT Atlas is here, and its simple achievement badge is a clever piece of product design.',
    content: `OpenAI recently released a new AI browser: ChatGPT Atlas.

Leaving the actual browsing experience aside, I like the clean design of its achievement badge. It shows how long you have used ChatGPT, your account initials, and how long you have used Atlas.

It reminded me of the badge in Arc Browser. Arc's version looks better to me, but the deeper value is not decoration—it is distribution.

The better a badge looks, the more likely people are to share it voluntarily on social media. Atlas may not look as polished as Arc, but it carries the OpenAI name. Many people first encountered modern AI through ChatGPT, so they naturally pay attention to every new OpenAI product.

## ChatGPT Atlas

- Initial platform: macOS on Apple Silicon
- Available to: all ChatGPT users, including Free, Plus, Pro, and Go
- Roadmap: more operating systems, mobile platforms, and intelligent features
- Website: https://chatgpt.com/atlas`,
  },
  '20251220-essay-post': {
    title: 'December 20, 2025 — Notes',
    excerpt: 'It is simply not the kind of product experience I want.',
    content: `I had kept renewing a product mainly because it focused on AI.

After following this field for a long time, however, I realized that most people have access to similar resources. Once you already understand a topic beyond the beginner level, another general training camp may not deserve much additional time.

Training camps can be useful for newcomers who need an overview. More experienced participants usually join to go deeper—but only when the content is genuinely strong.

This program recently removed its 72-hour reconsideration and refund period. For someone like me, who joins in order to study new material seriously, that feels wrong for three reasons:

1. If the content is good, people will naturally continue learning.
2. If it is not good, trying to recover a deposit wastes even more energy than the money itself.
3. Information alone is rarely the most valuable part. Strong cases and proof of real outcomes matter more.

So I refunded the three camps I had enrolled in.

There was no dramatic reason. The arrangement gave me no sense of safety and too much sense of constraint. I simply did not like it.

Life is tiring enough. There is no need to create extra frustration for yourself.`,
  },
  '20251228-sui-sui-nian': {
    title: 'December 28, 2025 — Recent Notes',
    excerpt: 'A few recent updates, including the return of renewals for our accountability community.',
    content: `After publishing my previous article, I noticed that the layout did not look very good. I tried to revise the site's structure, but the process was more troublesome than expected. When the result still did not match what I had in mind, I paused. Some things can only be improved one piece at a time.

I also used the current training camp as an opportunity to show everyone how this personal site was built.

Today I listened to Mao Shu's year-end talk. He seems increasingly at ease, as if he has reached another level. The event also felt more comfortable than previous ones. I expected it to run very late, but it wrapped up after a relatively short session.

Another update is that our accountability community is starting renewals again. I originally planned to extend access for free for another year. A friend pointed out that at this price, the renewal cycle should not be too long—especially because the price itself will grow over time.

I still need to organize the details. If you are interested, send me a private message.

That is all for today: a small collection of recent thoughts.`,
  },
  '20260102-2025-report': {
    title: 'Goodbye 2025, Hello 2026',
    excerpt: 'My 2025 year in review.',
    content: `Many friends have published annual reviews. Since I use Notion to manage my work, creating mine was relatively straightforward.

My material was spread across WeChat, Notion, and a private knowledge community. I exported the WeChat posts, collected the community posts with RPA, and took the structured records directly from Notion. Feeding that material into NotebookLM gave me a useful first draft of the report.

The real reason this worked quickly was not the tool—it was the small daily records I had kept throughout the year. Without the source material, no AI workflow could have produced a meaningful review. Most of my notes focused on projects and content work, however, so next year I want to record more of my personal life as well.

## The year, month by month

### January–March: foundations and exploration

- Passed 640 consecutive days of writing.
- Studied community operations and design, analyzed viral AI videos, and hosted several community events.
- Used DeepSeek to build a digital wardrobe inside Notion.
- Took part in an offline sharing event in Shanghai.

### April–June: breakthroughs and a change of role

- Built a one-click cloud-drive link tool with DeepSeek.
- Took on my first growth-operations lead role.
- Moved from participant to coach in a seven-day AI video program.
- Studied AI programming and launched more than ten small utility websites.
- Tried live product demonstrations for the first time and learned from the mistakes.
- Worked on AI writing, presentations, illustration, video, and Xiaohongshu projects.

### July–September: deeper practice and commercial results

- Reached 800 consecutive days of writing and began to see writing as a way to notice my own subconscious patterns.
- Won a custom Notion project after publishing consistently on Xiaohongshu.
- Delivered AI and VBA work and led an AI VBA project.
- Completed Notion certification.
- Turned AI programming practice into my own tools, blog, and personal tools directory.
- Deployed n8n AI workflows and participated in a launch project generating more than RMB 200,000.

### October–December: expansion and consolidation

- Started my first paid AI programming project.
- Used AI to create a logo and developed the work into a deeper collaboration.
- Built websites continuously with AI-assisted programming.
- Began moving projects and content away from platforms and onto my own website.
- Opened a new service channel on Xianyu.
- Helped run a Gemini 3 training camp, covering knowledge bases and AI programming.

## Key achievements

### Writing and thinking

Daily writing passed 900 days. The habit moved beyond accumulating words and became a tool for reflection and clearer thinking.

### Applying AI deeply

I moved from being a tool user to becoming a builder and facilitator. I shipped more than ten small tools, created a tools directory, explored paid AI writing and programming work, and began teaching what I had learned.

### Growing into new operational roles

I acted as a growth lead, coach, and solo host for community events. Those roles gave me practical experience that no course could replace.

### Building an independent personal presence

Launching my own website and blog was a first step toward owning my digital assets rather than depending entirely on external platforms.

## The tools I used most

My daily environment is macOS. The core set included VS Code, Ghostty with zsh, Google's Antigravity editor, Warp, Claude Code, Codex, Gemini, NotebookLM, GitHub, and Vercel.

The biggest change was not simply using more AI. I moved from an “all in on AI” mindset to treating AI as part of a considered workflow. It saved a great deal of time, but only after plenty of mistakes and adjustments.

Overall, I did a lot and learned even more in 2025—especially about AI, building products, and turning repeated practice into something real.`,
  },
  '20260106-ai-quanzhan': {
    title: 'Building My First Full-Stack Product with AI',
    excerpt: 'I finally completed a full-stack project from scratch.',
    content: `I previously accepted a project to build a website around a music-generation API. The product also needed user accounts and a credit system.

I had built a number of front-end projects before. Most simply asked users to enter their own API key and then called an image or video generation service. That approach wastes traffic and limits the product, especially for an international audience, so this time I attempted an independent service with registration, credit purchases, and membership levels.

The front end was familiar. The real challenge was the back end.

## The stack

- **Database:** Supabase
- **Authentication:** Clerk, with Google and GitHub sign-in
- **Payments:** Creem
- **Deployment:** GitHub and Vercel
- **AI-assisted development:** Antigravity, Claude Code, and Gemini

I originally planned to deploy on Cloudflare, but configuration problems led me to Vercel. Vercel was more convenient, although the change still required a number of code and configuration adjustments.

Clerk saved a great deal of work. With Google sign-in, names and profile images are available immediately. For email registrations, I supplied a default avatar using DiceBear because I like its Notion-style illustrations.

## The registration flow

1. A user creates an account through Clerk.
2. After login, the user's information is written to Supabase.
3. Supabase returns the stored data to the front end.
4. Registration is complete.

## The payment and credit flow

1. A user starts a credit purchase from the front end.
2. The site redirects them to a Creem payment link.
3. After payment, Creem sends a webhook to the back end.
4. The back end verifies the event and writes the purchased credits to Supabase.
5. The updated balance is returned to the front end.

The webhook consumed the most debugging time. I initially used ngrok for online testing, but every new temporary URL had to be copied into the Creem settings. Local testing on a stable localhost address was much easier.

Deployment introduced more problems: a Next.js security warning, Vercel-specific restrictions, and a Supabase connection-string issue that took a long time to untangle. Following the logs one by one eventually got the system running.

The membership and task-generation flows follow the same general pattern. Memberships do not yet grant bonus credits, but that can be improved later.

The architecture now feels simple when written down. Getting every service to communicate correctly was the difficult part. Still, this is my first complete full-stack product, and I am happy with the result.

Next, I plan to use AI throughout the development of a WeChat Mini Program and learn the entire workflow end to end.`,
  },
  'blog-stack-notes': {
    title: 'Architecture Notes: My Blog Stack',
    excerpt: 'The choices behind this site, from Notion to the front end and deployment.',
    content: `## Stack overview

This site uses Notion as its content source. A React and Next.js front end fetches and renders the content on the server.

## Core layers

- **Content:** a Notion database for articles, tags, and publishing status
- **Integration:** the official API plus a lightweight data transformation layer
- **Presentation:** Next.js routes and page components
- **Deployment:** Vercel or a similar platform

## Lessons learned

1. Define the data model and required fields clearly.
2. Keep front-end transformation minimal and normalize data on the server.
3. Use caching and incremental builds to reduce Notion requests.

Future posts will cover the API wrapper and caching strategy in more detail.`,
  },
  'my-first-post': {
    title: 'My First Blog Post',
    excerpt: 'A short introduction to why I started this blog.',
    content: `## Introduction

This is my first blog post. I want to explain what motivates me to create, the topics I plan to explore, and why I chose Notion as the CMS.

## Why I started a blog

- To record and review my work so that I can grow over time
- To turn learning into output and complete the knowledge loop
- To exchange ideas with readers and receive real feedback

## What I plan to write about

1. Notes on technology and tools
2. Creative methods and workflows
3. Product iterations and retrospectives

Thank you for reading. If this is the kind of material you enjoy, I hope you will follow along.`,
  },
};

function translateTag(tag: NotionTag): NotionTag {
  return { ...tag, name: tagNames[tag.name] || tag.name };
}

export function localizeOptimizedPost(post: NotionPost, locale: OptimizedLocale): NotionPost {
  const normalizedPost = publishedAtCorrections[post.slug]
    ? { ...post, publishedAt: publishedAtCorrections[post.slug] }
    : post;

  if (locale === 'zh') return normalizedPost;

  const translation = englishPosts[normalizedPost.slug];
  if (!translation) {
    return {
      ...normalizedPost,
      content: `> An English translation has not been published for this article yet. The original Chinese text follows.\n\n${normalizedPost.content}`,
      tags: normalizedPost.tags.map(translateTag),
    };
  }

  return {
    ...normalizedPost,
    ...translation,
    tags: normalizedPost.tags.map(translateTag),
  };
}

export function localizeOptimizedPosts(posts: NotionPost[], locale: OptimizedLocale): NotionPost[] {
  return posts.map((post) => localizeOptimizedPost(post, locale));
}
