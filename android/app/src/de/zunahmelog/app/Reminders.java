package de.zunahmelog.app;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/** Plant Erinnerungen, die die Web-Oberfläche berechnet, und zeigt sie als Mitteilung an. */
public final class Reminders {
    static final String CHANNEL = "erinnerungen";
    static final String PREFS = "reminders";
    private static final int FLAG_IMMUTABLE = 0x04000000;

    private Reminders() { }

    static int piFlags() {
        return PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? FLAG_IMMUTABLE : 0);
    }

    /** plan = JSON-Array aus {at: Millisekunden, title, text} */
    static void schedule(Context ctx, String plan) {
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        int old = sp.getInt("count", 0);
        for (int i = 0; i < old; i++) {
            PendingIntent pi = PendingIntent.getBroadcast(ctx, 1000 + i, new Intent(ctx, ReminderReceiver.class), piFlags());
            am.cancel(pi);
            pi.cancel();
        }
        int count = 0;
        try {
            JSONArray arr = new JSONArray(plan);
            long now = System.currentTimeMillis();
            for (int i = 0; i < arr.length() && count < 40; i++) {
                JSONObject o = arr.getJSONObject(i);
                long at = o.getLong("at");
                if (at <= now + 30000) continue;
                Intent it = new Intent(ctx, ReminderReceiver.class);
                it.setAction("de.zunahmelog.app.REMIND");
                it.putExtra("title", o.optString("title"));
                it.putExtra("text", o.optString("text"));
                it.putExtra("nid", 2000 + (o.optString("kind").equals("water") ? 1 : 0));
                PendingIntent pi = PendingIntent.getBroadcast(ctx, 1000 + count, it, piFlags());
                if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                else am.set(AlarmManager.RTC_WAKEUP, at, pi);
                count++;
            }
        } catch (Exception ignored) { }
        sp.edit().putString("plan", plan).putInt("count", count).apply();
    }

    static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm.getNotificationChannel(CHANNEL) == null) {
                NotificationChannel ch = new NotificationChannel(CHANNEL, "Erinnerungen an Essen und Trinken", NotificationManager.IMPORTANCE_DEFAULT);
                ch.setDescription("Hinweise, wenn Kalorien, Kohlenhydrate oder Wasser hinter dem Tagesplan liegen");
                nm.createNotificationChannel(ch);
            }
        }
    }

    @SuppressWarnings("deprecation")
    static void show(Context ctx, int id, String title, String text) {
        ensureChannel(ctx);
        Intent open = new Intent(ctx, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent content = PendingIntent.getActivity(ctx, 0, open, piFlags());
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, CHANNEL) : new Notification.Builder(ctx);
        b.setSmallIcon(R.drawable.ic_stat)
         .setColor(0xFFD7263D)
         .setContentTitle(title)
         .setContentText(text)
         .setStyle(new Notification.BigTextStyle().bigText(text))
         .setAutoCancel(true)
         .setContentIntent(content);
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        try { nm.notify(id, b.build()); } catch (SecurityException ignored) { }
    }
}
