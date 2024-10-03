// lib/ssr.tsx
import { ServerStyles, createStylesServer } from '@mantine/next';
import { AppType } from 'next/app';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { createEmotionCache } from '@mantine/core';

const stylesServer = createStylesServer(createEmotionCache());

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <ServerStyles html={this.props.html} server={stylesServer} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
