import React, { useState } from 'react';
import { View, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Header } from './components/Header';
import Progress from './components/Progress';
import { colors } from './res';

const BeautyWebView = ({
  visible,
  onPressClose,
  backgroundColor,
  headerContent, // 'dark' || 'light', default 'dark'
  headerBackground, // default #fff
  url, // Required
  customInjectedJS,
  progressColor,
  progressHeight,
  loadingText,
  copyLinkTitle,
  openBrowserTitle,
  extraMenuItems,
  animationType,
  progressBarType, // 'normal' || 'background'
  onLoadEnd,
  onLoadStart,
  navigationVisible,
  closeIcon,
  menuIcon,
  onGoBack,
  onGoForward
}) => {
  const [progressRef, setProgressRef] = useState(null);
  const [backgroundProgressRef, setBackgroundProgressRef] = useState(null);
  const [title, setTitle] = useState(loadingText);
  const [backQueue, setBackQueue] = useState([]);
  const [forwardQueue, setForwardQueue] = useState([]);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [injectedJS, setinjectedJS] = useState(customInjectedJS);

  const onProgress = (progress) => {
    progressRef?.startAnimation(progress);
    progressBarType === 'background' && backgroundProgressRef?.startAnimation(progress);
  };

  const onNavigationStateChange = (event) => {
    if (currentUrl === event.url) return;
    backQueue.push(currentUrl);
    setBackQueue(backQueue);
    onGoForward && onGoForward();
    setCurrentUrl(event.url);
  }

  const onPressBack = () => {
    if (backQueue.length == 0) return;
    const newUrl = backQueue[backQueue.length - 1];
    forwardQueue.push(currentUrl);
    setForwardQueue(forwardQueue);
    onGoBack && onGoBack();
    backQueue.pop();
    setBackQueue(backQueue);
    setCurrentUrl(newUrl);
  }

  const onPressForward = () => {
    if (forwardQueue.length == 0) return;
    const newUrl = forwardQueue[forwardQueue.length - 1];
    backQueue.push(currentUrl);
    setBackQueue(backQueue);
    forwardQueue.pop();
    setForwardQueue(forwardQueue);
    setCurrentUrl(newUrl);
    onGoForward && onGoForward();
  }

  const onClose = () => {
    onPressClose && onPressClose();
    setTimeout(() => {
      setBackQueue([]);
      setForwardQueue([]);
      setCurrentUrl(url);
    }, 200);
  } 


  // const html = `
  //   <html>
  //     <head>
  //         <script src="./node_modules/@wiris/mathtype-generic/wirisplugin-generic.js"></script>
  //     </head>
  //     <body>
  //         <div id="toolbar"></div>
  //         <div id="htmlEditor" contenteditable="true">Try me!</div>
  //       <script>
  //         var genericIntegrationProperties = {};
  //         genericIntegrationProperties.target = document.getElementById('htmlEditor');
  //         genericIntegrationProperties.toolbar = document.getElementById('toolbar');
    
  //         // GenericIntegration instance.
  //         var genericIntegrationInstance = new WirisPlugin.GenericIntegration(genericIntegrationProperties);
  //         genericIntegrationInstance.init();
  //         genericIntegrationInstance.listeners.fire('onTargetReady', {});
  //       </script>
  //     </body>
  //   </html>
  //   `

  const html = `
  <html lang="en">
  <head>
    <script src="https://www.wiris.net/demo/editor/editor"></script>
    <script>
      var editor;
      window.onload = function () {
        editor = com.wiris.jsEditor.JsEditor.newInstance({'language': 'en'});
        editor.insertInto(document.getElementById('editorContainer'));
        setTimeout(() => {
          editor.setMathML("<math><mfrac><mn>1</mn><mi>x</mi></mfrac></math>");
          alert(editor.getMathML())
        }, 500);
      }


    </script>

  </head>


  <body>
    <div id="editorContainer"></div>  
  </body>

</html>`

  return (
    <Modal visible={visible} transparent={false} animationType={animationType}>
      <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
        <Header
          backgroundColor={headerBackground}
          contentType={headerContent}
          title={title}
          url={currentUrl}
          onPressClose={onClose}
          copyLinkTitle={copyLinkTitle}
          openBrowserTitle={openBrowserTitle}
          extraMenuItems={extraMenuItems}
          backgroundProgressRefOnChange={setBackgroundProgressRef}
          navigationVisible={navigationVisible}
          canForward={forwardQueue.length > 0}
          canback={backQueue.length > 0}
          onPressBack={onPressBack}
          onPressForward={onPressForward}
          closeIcon={closeIcon}
          menuIcon={menuIcon}
        />
        {
          progressBarType === 'normal' &&
          <Progress
            height={progressHeight}
            color={progressColor}
            ref={(progress) => setProgressRef(progress)}
          />
        }
        <WebView
          originWhitelist={['*']}
          source={{html: html}}
          onLoadProgress={({ nativeEvent }) => {
            let loadingProgress = nativeEvent.progress;
            onProgress(loadingProgress);
          }}
          // injectedJavaScript="window.ReactNativeWebView.postMessage(document.title)"
          injectedJavaScript={injectedJS}
          javaScriptEnabled={true}
          onMessage={event => setTitle(event.nativeEvent.data)}
          onLoadEnd={onLoadEnd}
          onLoadStart={onLoadStart}
          allowFileAccess={true}
          onNavigationStateChange={onNavigationStateChange}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

BeautyWebView.defaultProps = {
  transparent: true,
  backgroundColor: colors.defaultBackground,
  headerContent: 'dark',
  headerBackground: colors.defaultBackground,
  progressColor: colors.progress,
  progressHeight: 4,
  loadingText: 'Loading...',
  copyLinkTitle: 'Copy Link',
  openBrowserTitle: 'Open on Browser',
  animationType: "slide",
  progressBarType: "normal",
  navigationVisible: true
}

export default BeautyWebView;
