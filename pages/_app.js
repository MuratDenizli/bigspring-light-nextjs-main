import config from "@config/config.json";
import theme from "@config/theme.json";
import Head from "next/head";
import { useEffect, useState } from "react";
import TagManager from "react-gtm-module";
import "styles/style.scss";

const App = ({ Component, pageProps }) => {
  // default theme setup

  // import google font css
  const pf = theme.fonts.font_family.primary;
  const sf = theme.fonts.font_family.secondary;
  const [fontcss, setFontcss] = useState();
  
  useEffect(() => {
    // Global error handler
    const handleError = (event) => {
      if (event.error && event.error.message && event.error.message.includes('ethereum')) {
        event.preventDefault();
        console.warn('Ethereum error suppressed:', event.error.message);
      }
    };

    // Ethereum hatalarını önlemek için window kontrolü
    if (typeof window !== 'undefined') {
      // Global error listener ekle
      window.addEventListener('error', handleError);
      
      // Ethereum objesi yoksa boş bir obje oluştur
      if (!window.ethereum) {
        window.ethereum = {
          selectedAddress: null,
          isConnected: () => false,
          request: () => Promise.reject(new Error('No wallet detected'))
        };
      }
    }
    
    fetch(
      `https://fonts.googleapis.com/css2?family=${pf}${
        sf ? "&family=" + sf : ""
      }&display=swap`
    ).then((res) => res.text().then((css) => setFontcss(css)));

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', handleError);
      }
    };
  }, [pf, sf]);

  // google tag manager (gtm)
  const tagManagerArgs = {
    gtmId: config.params.tag_manager_id,
  };
  useEffect(() => {
    setTimeout(() => {
      process.env.NODE_ENV === "production" &&
        config.params.tag_manager_id &&
        TagManager.initialize(tagManagerArgs);
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        {/* google font css */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `${fontcss}`,
          }}
        />
        {/* responsive meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
