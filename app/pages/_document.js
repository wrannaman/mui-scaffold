import React from 'react';
import PropTypes from 'prop-types';
import Document, { Head, Main, NextScript } from 'next/document';
// import flush from 'styled-jsx/server';
import theme from '../src/theme';
import { ServerStyleSheets } from '@material-ui/core/styles';


console.log('env ', process.env.ENV);

class MyDocument extends Document {
  render() {

    return (
      <html lang="en" dir="ltr">
        <Head>
          <meta charSet="utf-8" />
          {/* Use minimum-scale=1 to enable GPU rasterization */}
          {/*
            <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
            />
            */}
          {/* PWA primary color */}
          {false && <meta name="theme-color" content={theme.palette.primary.main} />}

          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Poppins:300,400,500"
          />
          <link rel="shortcut icon" type="image/png" href="/img/favicon.png" />
          <meta name="description" content="No Code Development Platform" />
          <meta name="keywords" content="nocode, no-code, no code, low-code, low code, low code platform, no code platform, no code development, low code development" />
          {process.env.ENV !== 'dev' && (
            <script
              dangerouslySetInnerHTML={{ __html: `
                (function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:1659299,hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `}}
            />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-132053000-23"></script>
        <script async src="https://js.stripe.com/v3/"></script>
        <script async src="/js/html2canvas.min.js"></script>
        {process.env.ENV !== 'dev' && (
          <script
            dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'UA-132053000-23');
            `}}
          />
        )}
      </html>
    );
  }
}

MyDocument.getInitialProps = async ctx => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App => props => sheets.collect(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      <React.Fragment key="styles">
        {initialProps.styles}
        {sheets.getStyleElement()}
      </React.Fragment>,
    ],
  };
};

export default MyDocument;
