import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface DigestPost {
  title: string;
  excerpt: string;
  url: string;
  coverUrl?: string;
  dateLabel: string;
}

interface DigestEmailProps {
  posts: DigestPost[];
  issueLabel: string;
  siteUrl: string;
}

export function DigestEmail({ posts, issueLabel, siteUrl }: DigestEmailProps) {
  const preview = `本周 ${posts.length} 篇更新：${posts
    .slice(0, 3)
    .map((post) => post.title)
    .join('、')}`;

  return (
    <Html lang="zh-CN">
      <Head>
        <style>{`
          @import url('https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/lxgwwenkai-regular.css');
          @import url('https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/lxgwwenkai-bold.css');

          @media (prefers-color-scheme: dark) {
            .ny-body { background-color: #191919 !important; }
            .ny-card { background-color: #202020 !important; }
            .ny-text { color: #d4d4d4 !important; }
            .ny-muted { color: #9b9b9b !important; }
            .ny-title a { color: #ededed !important; }
            .ny-divider { border-color: #333333 !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body className="ny-body" style={{ margin: 0, padding: '24px 12px', backgroundColor: '#f7f7f5', fontFamily: "'LXGW WenKai',-apple-system,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" }}>
        <Container className="ny-card" style={{ maxWidth: 560, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 8, padding: '32px 28px' }}>
          <Text className="ny-text" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#37352f', letterSpacing: '0.02em' }}>
            凌一 · LingYi
          </Text>
          <Text className="ny-muted" style={{ margin: '4px 0 0', fontSize: 12, color: '#787774' }}>
            {issueLabel}
          </Text>
          <Hr className="ny-divider" style={{ border: 'none', borderTop: '1px solid #e9e9e7', margin: '20px 0 8px' }} />

          <Text className="ny-text" style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.8, color: '#37352f' }}>
            Hi，我是凌一。
          </Text>
          <Text className="ny-text" style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.8, color: '#37352f' }}>
            这周写了 {posts.length} 篇，都是我自己试过、觉得值得说的东西，没有水文。挑感兴趣的点进去看就行，读完有任何想法，直接回这封邮件就好。
          </Text>

          {posts.map((post, index) => (
            <Section key={post.url} style={{ padding: '16px 0' }}>
              {post.coverUrl && (
                <Img
                  src={post.coverUrl}
                  alt={post.title}
                  style={{ width: '100%', maxWidth: 504, borderRadius: 6, marginBottom: 12, display: 'block' }}
                />
              )}
              <Text className="ny-title" style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 600, lineHeight: 1.4 }}>
                <Link href={post.url} style={{ color: '#37352f', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </Text>
              <Text className="ny-muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#787774' }}>
                {post.excerpt}
              </Text>
              <Text style={{ margin: '10px 0 0', fontSize: 14 }}>
                <Link href={post.url} style={{ color: '#37352f', textDecoration: 'underline' }}>
                  阅读全文 →
                </Link>
              </Text>
              {index < posts.length - 1 && (
                <Hr className="ny-divider" style={{ border: 'none', borderTop: '1px solid #efefee', margin: '24px 0 0' }} />
              )}
            </Section>
          ))}

          <Text className="ny-text" style={{ margin: '16px 0 0', fontSize: 15, lineHeight: 1.8, color: '#37352f' }}>
            以上就是本周的全部更新，我们下周见。
          </Text>

          <Hr className="ny-divider" style={{ border: 'none', borderTop: '1px solid #e9e9e7', margin: '8px 0 16px' }} />
          <Text className="ny-muted" style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: '#9b9b9b' }}>
            每周一封，汇总本周更新。你可以在{' '}
            <Link href={siteUrl} style={{ color: '#787774' }}>
              lingyi.me
            </Link>{' '}
            随时阅读，或通过{' '}
            <Link href={`${siteUrl}/rss`} style={{ color: '#787774' }}>
              RSS
            </Link>{' '}
            订阅。
          </Text>
          <Text className="ny-muted" style={{ margin: '8px 0 0', fontSize: 12, color: '#9b9b9b' }}>
            <Link href="{{UNSUB_URL}}" style={{ color: '#9b9b9b', textDecoration: 'underline' }}>
              退订
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DigestEmail;
