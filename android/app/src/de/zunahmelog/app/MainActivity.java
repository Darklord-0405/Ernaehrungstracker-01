package de.zunahmelog.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

public class MainActivity extends Activity {
    private static final int REQ_FILE = 41;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private Uri cameraUri;
    private static final String PERM_NOTIF = "android.permission.POST_NOTIFICATIONS";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        boolean night = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        int bg = night ? Color.parseColor("#101612") : Color.parseColor("#EEF1EC");
        Window w = getWindow();
        w.setStatusBarColor(bg);
        w.setNavigationBarColor(bg);
        if (!night && Build.VERSION.SDK_INT >= 26) {
            w.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        }

        Reminders.ensureChannel(this);
        web = new WebView(this);
        web.setBackgroundColor(bg);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setTextZoom(100);

        web.addJavascriptInterface(new Bridge(), "Android");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return openExternal(request.getUrl());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openExternal(Uri.parse(url));
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                return showChooser(callback, params);
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/index.html");
    }

    private boolean openExternal(Uri uri) {
        String scheme = uri.getScheme();
        if ("file".equals(scheme)) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) { }
        return true;
    }

    private boolean showChooser(ValueCallback<Uri[]> callback, WebChromeClient.FileChooserParams params) {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        fileCallback = callback;
        boolean image = false;
        String[] types = params.getAcceptTypes();
        if (types != null) for (String t : types) if (t != null && t.contains("image")) image = true;

        Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
        pick.addCategory(Intent.CATEGORY_OPENABLE);
        pick.setType(image ? "image/*" : "*/*");
        Intent chooser = Intent.createChooser(pick, image ? "Foto aufnehmen oder auswählen" : "Datei auswählen");

        cameraUri = null;
        if (image && Build.VERSION.SDK_INT >= 29) {
            try {
                ContentValues cv = new ContentValues();
                cv.put(MediaStore.Images.Media.DISPLAY_NAME, "mahlzeit_" + System.currentTimeMillis() + ".jpg");
                cv.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
                cv.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Ernaehrungstracker");
                cameraUri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cv);
                if (cameraUri != null) {
                    Intent cam = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    cam.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
                    cam.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cam});
                }
            } catch (Exception e) {
                cameraUri = null;
            }
        }
        try {
            startActivityForResult(chooser, REQ_FILE);
        } catch (ActivityNotFoundException e) {
            dropCameraUri();
            fileCallback.onReceiveValue(null);
            fileCallback = null;
            return false;
        }
        return true;
    }

    private void dropCameraUri() {
        if (cameraUri != null) {
            try { getContentResolver().delete(cameraUri, null, null); } catch (Exception ignored) { }
            cameraUri = null;
        }
    }

    private boolean cameraHasData() {
        if (cameraUri == null) return false;
        try {
            InputStream in = getContentResolver().openInputStream(cameraUri);
            if (in == null) return false;
            int b = in.read();
            in.close();
            return b != -1;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQ_FILE) { super.onActivityResult(requestCode, resultCode, data); return; }
        Uri[] result = null;
        if (resultCode == RESULT_OK) {
            Uri picked = data != null ? data.getData() : null;
            if (picked != null && !picked.equals(cameraUri)) {
                result = new Uri[]{picked};
                dropCameraUri();
            } else if (cameraHasData()) {
                result = new Uri[]{cameraUri};
                cameraUri = null;
            }
        }
        if (result == null) dropCameraUri();
        if (fileCallback != null) fileCallback.onReceiveValue(result);
        fileCallback = null;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == 77) web.evaluateJavascript("window.__notifChanged&&window.__notifChanged()", null);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("window.__appResume&&window.__appResume()", null);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.__appBack?window.__appBack():false)", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                if (!"true".equals(value)) finish();
            }
        });
    }

    private void deliver(final String id, final int status, final String body) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                web.evaluateJavascript("window.__httpDone(" + JSONObject.quote(id) + "," + status + "," + JSONObject.quote(body) + ")", null);
            }
        });
    }

    private class Bridge {
        @JavascriptInterface
        public void request(final String id, final String method, final String url, final String headersJson, final String body) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    if (!(url.startsWith("http://") || url.startsWith("https://"))) { deliver(id, 0, "Ungültige Adresse"); return; }
                    HttpURLConnection c = null;
                    try {
                        c = (HttpURLConnection) new URL(url).openConnection();
                        boolean isPost = "POST".equals(method);
                        c.setRequestMethod(isPost ? "POST" : "GET");
                        c.setConnectTimeout(8000);
                        c.setReadTimeout(600000);
                        c.setRequestProperty("User-Agent", "Ernaehrungstracker/2.0 (Android " + Build.VERSION.RELEASE + ")");
                        JSONObject h = new JSONObject(headersJson);
                        Iterator<String> keys = h.keys();
                        while (keys.hasNext()) { String k = keys.next(); c.setRequestProperty(k, h.getString(k)); }
                        if (isPost) {
                            c.setDoOutput(true);
                            OutputStream os = c.getOutputStream();
                            os.write(body.getBytes("UTF-8"));
                            os.close();
                        }
                        int code = c.getResponseCode();
                        InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
                        String resp = "";
                        if (in != null) {
                            ByteArrayOutputStream bo = new ByteArrayOutputStream();
                            byte[] buf = new byte[8192];
                            int r;
                            while ((r = in.read(buf)) > 0) bo.write(buf, 0, r);
                            in.close();
                            resp = bo.toString("UTF-8");
                        }
                        deliver(id, code, resp);
                    } catch (Exception e) {
                        deliver(id, 0, String.valueOf(e.getMessage()));
                    } finally {
                        if (c != null) c.disconnect();
                    }
                }
            }).start();
        }

        @JavascriptInterface
        public void setReminders(String plan) {
            Reminders.schedule(MainActivity.this, plan);
        }

        @JavascriptInterface
        public String notifState() {
            if (Build.VERSION.SDK_INT >= 24) {
                android.app.NotificationManager nm = (android.app.NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                if (!nm.areNotificationsEnabled()) {
                    return Build.VERSION.SDK_INT >= 33 && checkSelfPermission(PERM_NOTIF) != android.content.pm.PackageManager.PERMISSION_GRANTED ? "ask" : "off";
                }
            }
            return "on";
        }

        @JavascriptInterface
        public void requestNotif() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(PERM_NOTIF) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                        requestPermissions(new String[]{PERM_NOTIF}, 77);
                    } else {
                        try {
                            Intent i = new Intent("android.settings.APP_NOTIFICATION_SETTINGS");
                            i.putExtra("android.provider.extra.APP_PACKAGE", getPackageName());
                            startActivity(i);
                        } catch (Exception ignored) { }
                    }
                }
            });
        }

        @JavascriptInterface
        public void testNotif() {
            Reminders.show(MainActivity.this, 2999, "So sehen Erinnerungen aus", "Zeit für ein Glas Wasser: 0,8 von 2,0 l getrunken.");
        }

        @JavascriptInterface
        public String saveFile(String name, String text) {
            try {
                byte[] bytes = text.getBytes("UTF-8");
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    cv.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                    cv.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    if (uri == null) return "Speicherort nicht verfügbar";
                    OutputStream os = getContentResolver().openOutputStream(uri);
                    os.write(bytes);
                    os.close();
                    return "ok:Download/" + name;
                } else {
                    File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    if (dir == null) return "Speicherort nicht verfügbar";
                    File f = new File(dir, name);
                    FileOutputStream fo = new FileOutputStream(f);
                    fo.write(bytes);
                    fo.close();
                    return "ok:" + f.getAbsolutePath();
                }
            } catch (Exception e) {
                return String.valueOf(e.getMessage());
            }
        }
    }
}
