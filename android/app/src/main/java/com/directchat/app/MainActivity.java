package com.directchat.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUri(request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUri(Uri.parse(url));
            }

            private boolean handleUri(Uri uri) {
                if (uri == null) return false;
                String scheme = uri.getScheme() == null ? "" : uri.getScheme();
                String url = uri.toString();

                // Keep local app inside WebView
                if (url.startsWith("file:///android_asset/")) return false;

                // External messaging / dialer intents -> open outside WebView
                String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
                boolean isWhatsApp = host.equals("wa.me") || host.endsWith(".wa.me")
                        || host.equals("api.whatsapp.com") || host.equals("whatsapp.com");
                boolean isTelegram = host.equals("t.me") || host.equals("telegram.me")
                        || host.equals("telegram.org");
                boolean isExternalScheme = scheme.equals("tel") || scheme.equals("sms")
                        || scheme.equals("smsto") || scheme.equals("mailto")
                        || scheme.equals("intent") || scheme.equals("tg");

                if (isWhatsApp || isTelegram || isExternalScheme) {
                    openExternally(uri);
                    return true;
                }

                // All other http(s) links (e.g. shared links) also open externally
                // so the user stays in the app shell.
                if (scheme.equals("http") || scheme.equals("https")) {
                    // Let page sub-resources load (they don't hit this for XHR/fetch),
                    // but top-level navigations away from the local file go external.
                    // Since our app is a single local file, any http(s) navigation is external.
                    openExternally(uri);
                    return true;
                }
                return false;
            }

            private void openExternally(Uri uri) {
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, uri);
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(i);
                } catch (ActivityNotFoundException ignored) {
                }
            }
        });
        webView.setWebChromeClient(new WebChromeClient());

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl("file:///android_asset/www/index.html");
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
