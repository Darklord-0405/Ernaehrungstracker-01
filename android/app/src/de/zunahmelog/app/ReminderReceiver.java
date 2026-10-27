package de.zunahmelog.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Zeigt eine fällige Erinnerung an und plant nach einem Neustart alles neu. */
public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) {
        String a = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(a) || "android.intent.action.MY_PACKAGE_REPLACED".equals(a)) {
            String plan = ctx.getSharedPreferences(Reminders.PREFS, Context.MODE_PRIVATE).getString("plan", "[]");
            Reminders.schedule(ctx, plan);
            return;
        }
        String title = intent.getStringExtra("title");
        String text = intent.getStringExtra("text");
        if (title == null || text == null) return;
        Reminders.show(ctx, intent.getIntExtra("nid", 2000), title, text);
    }
}
