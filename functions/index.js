// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// 매일 자정에 실행 - 오늘 알림 예약
exports.scheduleDailyNotifications = functions.pubsub
  .schedule("0 0 * * *") // 매일 00:00
  .timeZone("Asia/Seoul")
  .onRun(async (context) => {
    const db = admin.firestore();
    const messaging = admin.messaging();

    const today = new Date();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const todayName = dayNames[today.getDay()];

    console.log(`오늘은 ${todayName}요일`);

    // 모든 사용자의 스케줄 가져오기
    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const schedulesSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("sleepSchedules")
        .where("enabled", "==", true)
        .where("days", "array-contains", todayName)
        .get();

      for (const scheduleDoc of schedulesSnapshot.docs) {
        const schedule = scheduleDoc.data();

        // FCM 토큰 가져오기
        const userProfile = (
          await db.collection("users").doc(userId).get()
        ).data();
        const fcmToken = userProfile?.fcmToken;

        if (!fcmToken) continue;

        // 잠자리 알림 예약
        if (schedule.notifications?.bedtime?.enabled) {
          const [hour, minute] = schedule.bedtime.split(":");
          const bedtimeDate = new Date(today);
          bedtimeDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

          if (bedtimeDate > new Date()) {
            await scheduleNotification(
              fcmToken,
              schedule.notifications.bedtime.title,
              schedule.notifications.bedtime.body,
              bedtimeDate
            );
          }
        }

        // 기상 알림 예약 (다음날 새벽일 수 있음)
        if (schedule.notifications?.wakeup?.enabled) {
          const [hour, minute] = schedule.wakeup.split(":");
          const wakeupDate = new Date(today);
          wakeupDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

          // 기상이 잠자리보다 이르면 다음날
          const [bedHour] = schedule.bedtime.split(":");
          if (parseInt(hour) < parseInt(bedHour)) {
            wakeupDate.setDate(wakeupDate.getDate() + 1);
          }

          if (wakeupDate > new Date()) {
            await scheduleNotification(
              fcmToken,
              schedule.notifications.wakeup.title,
              schedule.notifications.wakeup.body,
              wakeupDate
            );
          }
        }
      }
    }

    return null;
  });

// FCM 예약 알림 전송 함수
async function scheduleNotification(token, title, body, scheduledTime) {
  const delayMs = scheduledTime.getTime() - Date.now();

  if (delayMs < 0) return; // 이미 지난 시간

  // Firestore에 예약 작업 저장
  await admin
    .firestore()
    .collection("scheduledNotifications")
    .add({
      token,
      title,
      body,
      scheduledTime: admin.firestore.Timestamp.fromDate(scheduledTime),
      status: "pending",
    });
}

// 1분마다 실행 - 예약된 알림 전송
exports.sendScheduledNotifications = functions.pubsub
  .schedule("* * * * *") // 매 1분
  .timeZone("Asia/Seoul")
  .onRun(async (context) => {
    const db = admin.firestore();
    const messaging = admin.messaging();
    const now = admin.firestore.Timestamp.now();

    const snapshot = await db
      .collection("scheduledNotifications")
      .where("status", "==", "pending")
      .where("scheduledTime", "<=", now)
      .limit(500)
      .get();

    const batch = db.batch();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      try {
        await messaging.send({
          token: data.token,
          notification: {
            title: data.title,
            body: data.body,
          },
          android: {
            priority: "high",
            notification: {
              sound: "default",
              channelId: "sleep-schedule",
            },
          },
        });

        batch.update(doc.ref, { status: "sent" });
      } catch (error) {
        console.error("알림 전송 실패:", error);
        batch.update(doc.ref, { status: "failed", error: error.message });
      }
    }

    await batch.commit();
    return null;
  });
