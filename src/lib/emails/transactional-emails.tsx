import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ConfirmEmailProps {
  confirmUrl: string;
}

export function ConfirmEmail({ confirmUrl }: ConfirmEmailProps) {
  return (
    <Html lang="zh-CN">
      <Head>
        <style>{`
          @media (prefers-color-scheme: dark) {
            .ny-body { background-color: #191919 !important; }
            .ny-card { background-color: #202020 !important; }
            .ny-text { color: #d4d4d4 !important; }
            .ny-muted { color: #9b9b9b !important; }
            .ny-divider { border-color: #333333 !important; }
          }
        `}</style>
      </Head>
      <Preview>确认订阅凌一的博客更新</Preview>
      <Body className="ny-body" style={{ margin: 0, padding: '24px 12px', backgroundColor: '#f7f7f5', fontFamily: "-apple-system,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" }}>
        <Container className="ny-card" style={{ maxWidth: 560, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 8, padding: '32px 28px' }}>
          <Text className="ny-text" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#37352f' }}>
            凌一 · LingYi
          </Text>
          <Text className="ny-text" style={{ margin: '20px 0 8px', fontSize: 15, lineHeight: 1.7, color: '#37352f' }}>
            你好，有人用这个邮箱订阅了 lingyi.me 的文章更新。如果不是你本人操作，忽略这封邮件即可，不会添加任何订阅。
          </Text>
          <Text className="ny-text" style={{ margin: '0 0 20px', fontSize: 15, color: '#37352f' }}>
            点击下面的按钮确认订阅，之后每周一你会收到一封汇总本周更新的邮件。
          </Text>
          <Button
            href={confirmUrl}
            style={{ backgroundColor: '#37352f', color: '#ffffff', borderRadius: 6, padding: '10px 20px', fontSize: 14, textDecoration: 'none' }}
          >
            确认订阅
          </Button>
          <Hr className="ny-divider" style={{ border: 'none', borderTop: '1px solid #e9e9e7', margin: '24px 0 12px' }} />
          <Text className="ny-muted" style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: '#9b9b9b' }}>
            如果按钮无法点击，复制这个链接到浏览器打开：
          </Text>
          <Text className="ny-muted" style={{ margin: '4px 0 0', fontSize: 12, wordBreak: 'break-all', color: '#9b9b9b' }}>
            <Link href={confirmUrl} style={{ color: '#9b9b9b' }}>
              {confirmUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

interface WelcomeEmailProps {
  siteUrl: string;
  posts: Array<{ title: string; url: string }>;
}

export function WelcomeEmail({ siteUrl, posts }: WelcomeEmailProps) {
  return (
    <Html lang="zh-CN">
      <Head>
        <style>{`
          @media (prefers-color-scheme: dark) {
            .ny-body { background-color: #191919 !important; }
            .ny-card { background-color: #202020 !important; }
            .ny-text { color: #d4d4d4 !important; }
            .ny-muted { color: #9b9b9b !important; }
            .ny-divider { border-color: #333333 !important; }
          }
        `}</style>
      </Head>
      <Preview>订阅成功，欢迎加入</Preview>
      <Body className="ny-body" style={{ margin: 0, padding: '24px 12px', backgroundColor: '#f7f7f5', fontFamily: "-apple-system,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" }}>
        <Container className="ny-card" style={{ maxWidth: 560, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 8, padding: '32px 28px' }}>
          <Text className="ny-text" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#37352f' }}>
            凌一 · LingYi
          </Text>
          <Text className="ny-text" style={{ margin: '20px 0 8px', fontSize: 15, lineHeight: 1.7, color: '#37352f' }}>
            订阅成功。之后每周一早上你会收到一封邮件，汇总 lingyi.me 一周的新文章；不想等周报的话，也可以随时通过{' '}
            <Link href={`${siteUrl}/rss`} style={{ color: '#37352f' }}>
              RSS
            </Link>{' '}
            实时阅读。
          </Text>
          {posts.length > 0 && (
            <Section style={{ margin: '16px 0' }}>
              <Text className="ny-muted" style={{ margin: '0 0 8px', fontSize: 12, color: '#787774' }}>
                最近的文章
              </Text>
              {posts.map((post) => (
                <Text key={post.url} className="ny-text" style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.6 }}>
                  ·{' '}
                  <Link href={post.url} style={{ color: '#37352f', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </Text>
              ))}
            </Section>
          )}
          <Hr className="ny-divider" style={{ border: 'none', borderTop: '1px solid #e9e9e7', margin: '20px 0 12px' }} />
          <Text className="ny-muted" style={{ margin: 0, fontSize: 12, color: '#9b9b9b' }}>
            这封是订阅确认后的欢迎邮件，日常更新不会单独打扰你。周刊邮件里随时可以一键退订。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
