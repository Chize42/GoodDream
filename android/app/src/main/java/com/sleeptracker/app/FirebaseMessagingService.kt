// 코틀린으로 작성된 FCM 서비스 클래스
// 경로: android/app/src/main/java/com/yourapp/package/FirebaseMessagingService.kt
// 패키지명은 실제 앱 패키지명으로 변경해주세요

package com.sleeptracker.app // 실제 패키지명으로 변경

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class FirebaseMessagingService : FirebaseMessagingService() {
    
    override fun onNewToken(token: String) {
        // 새 토큰이 생성될 때마다 호출
        // 필요한 경우 서버로 토큰을 보내는 로직 구현
    }
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // 메시지 수신 처리
        remoteMessage.notification?.let { notification ->
            // 알림 데이터가 있는 경우
            sendNotification(
                notification.title,
                notification.body,
                remoteMessage.data
            )
        } ?: run {
            // 데이터만 있는 경우
            if (remoteMessage.data.isNotEmpty()) {
                val title = remoteMessage.data["title"]
                val body = remoteMessage.data["body"]
                sendNotification(title, body, remoteMessage.data)
            }
        }
    }
    
    private fun sendNotification(
        title: String?,
        body: String?,
        data: Map<String, String>
    ) {
        // 알림 채널 ID
        val channelId = "sleep-schedule"
        
        // MainActivity로 이동하는 Intent 생성
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            
            // 데이터 전달
            for ((key, value) in data) {
                putExtra(key, value)
            }
        }
        
        // PendingIntent 생성
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent, 
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_ONE_SHOT
        )
        
        // 알림음
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        
        // 알림 빌더
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)
        
        // 알림 매니저
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // 안드로이드 O 이상에서는 채널 생성 필요
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Sleep Schedule",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }
        
        // 알림 표시
        notificationManager.notify(0, notificationBuilder.build())
    }
}