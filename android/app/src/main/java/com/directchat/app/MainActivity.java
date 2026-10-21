package com.directchat.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= 35) {
            Api35Impl.enable(this);
        }

        try {
            webView = new WebView(this);
        } catch (Throwable error) {
            showWebViewError();
            return;
        }

        webView.setBackgroundColor(Color.parseColor("#0B0F17"));
        setContentView(webView);

        if (Build.VERSION.SDK_INT >= 35) {
            Api35Impl.applyInsets(webView);
        }

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

                if (url.startsWith("file:///android_asset/")) return false;

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

                if (scheme.equals("http") || scheme.equals("https")) {
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

    private void showWebViewError() {
        TextView message = new TextView(this);
        message.setText("Não foi possível abrir o app.\n\nAtualize o Android System WebView pela Play Store e tente novamente.");
        message.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        message.setTextColor(Color.WHITE);
        message.setBackgroundColor(Color.parseColor("#0B0F17"));
        message.setGravity(Gravity.CENTER);
        int padding = (int) (24 * getResources().getDisplayMetrics().density);
        message.setPadding(padding, padding, padding, padding);
        setContentView(message);
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

    /**
     * Android 15 (API 35) enforces edge-to-edge when targetSdk is 35.
     * This code is isolated in its own class so older Android versions
     * never load the newer framework classes.
     */
    @android.annotation.TargetApi(35)
    private static final class Api35Impl {
        static void enable(Activity activity) {
            Window window = activity.getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);
            window.setDecorFitsSystemWindows(false);

            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.setSystemBarsAppearance(
                        0,
                        WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                                | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
            }
        }

        static void applyInsets(View view) {
            view.setOnApplyWindowInsetsListener((v, insets) -> {
                android.graphics.Insets bars = insets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                android.graphics.Insets ime = insets.getInsets(WindowInsets.Type.ime());
                int bottom = Math.max(bars.bottom, ime.bottom);

                if (v.getPaddingLeft() != bars.left || v.getPaddingTop() != bars.top
                        || v.getPaddingRight() != bars.right || v.getPaddingBottom() != bottom) {
                    v.setPadding(bars.left, bars.top, bars.right, bottom);
                }
                return insets;
            });
            view.requestApplyInsets();
        }
    }
}
