const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

// 스케줄 생성 시
exports.onScheduleCreated = onDocumentCreated(
  {
    document: "users/{userId}/sleepSchedules/{scheduleId}",
    region: "asia-northeast3",
  },
  async (event) => {
    const schedule = event.data.data();
    console.log("📝 새 스케줄 생성:", schedule.name);

    if (!schedule.enabled) {
      console.log("❌ 비활성화된 스케줄");
      return;
    }

    await sendImmediateNotifications(schedule);
  }
);

// 스케줄 수정 시
exports.onScheduleUpdated = onDocumentUpdated(
  {
    document: "users/{userId}/sleepSchedules/{scheduleId}",
    region: "asia-northeast3",
  },
  async (event) => {
    const newSchedule = event.data.after.data();
    console.log("✏️ 스케줄 수정:", newSchedule.name);

    if (!newSchedule.enabled) {
      console.log("❌ 스케줄 비활성화됨");

      // ✅ 비활성화 시 예약된 알림 삭제
      const existingNotifications = await admin
        .firestore()
        .collection("scheduledNotifications")
        .where("scheduleId", "==", newSchedule.id)
        .get();

      const deletePromises = existingNotifications.docs.map((doc) =>
        doc.ref.delete()
      );
      await Promise.all(deletePromises);

      console.log(`✅ 알림 ${existingNotifications.size}개 삭제됨`);
      return;
    }

    await sendImmediateNotifications(newSchedule);
  }
);

// 즉시 알림 전송 함수
async function sendImmediateNotifications(schedule) {
  // ✅ 1. 기존 예약 삭제
  console.log(`🗑️ 스케줄 ${schedule.id}의 기존 알림 삭제 중...`);
  // ... (기존 삭제 로직은 동일합니다) ...
  try {
    const existingNotifications = await admin
      .firestore()
      .collection("scheduledNotifications")
      .where("scheduleId", "==", schedule.id)
      .get();

    const deletePromises = existingNotifications.docs.map((doc) =>
      doc.ref.delete()
    );
    await Promise.all(deletePromises);

    console.log(`✅ 기존 알림 ${existingNotifications.size}개 삭제 완료`);
  } catch (error) {
    console.error("❌ 기존 알림 삭제 실패:", error);
  }

  // ✅ 2. 새 알림 예약 (시간대 로직 수정)

  const kstOffset = 9 * 60 * 60 * 1000;
  const nowUTC = new Date(); // [수정] 서버의 실제 UTC 시간
  const kstNowDate = new Date(nowUTC.getTime() + kstOffset); // [수정] KST 기준의 *날짜*를 얻기 위한 Date 객체

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const todayDay = dayNames[kstNowDate.getUTCDay()]; // [수정] kstNowDate에서 KST 요일 추출

  console.log(`📅 오늘: ${todayDay}요일 (KST)`);

  if (!schedule.days || !schedule.days.includes(todayDay)) {
    console.log(`⏭️ 오늘(${todayDay})은 스케줄 요일 아님`);
    return;
  }

  // [수정] KST 기준의 현재 연/월/일 추출
  const kstYear = kstNowDate.getUTCFullYear();
  const kstMonth = kstNowDate.getUTCMonth(); // 0-11
  const kstDay = kstNowDate.getUTCDate();

  // --- 취침 시간 (KST 기준) ---
  const [bedHours, bedMinutes] = schedule.bedtime.split(":").map(Number); // 예: 21, 0

  // [수정] KST 시간을 기준으로 Date 객체를 생성 (이 시점의 값은 "21:00 UTC")
  const bedtimeKST = new Date(
    Date.UTC(kstYear, kstMonth, kstDay, bedHours, bedMinutes, 0)
  );

  // [수정] KST 21:00를 정확한 UTC 12:00로 변환 (9시간을 빼줌)
  const bedtimeUTC = new Date(bedtimeKST.getTime() - kstOffset);

  // --- 기상 시간 (KST 기준) ---
  const [wakeHours, wakeMinutes] = schedule.wakeup.split(":").map(Number); // 예: 8, 10

  // [수정] KST 시간을 기준으로 Date 객체 생성 (이 시점의 값은 "08:10 UTC")
  let wakeupKST = new Date(
    Date.UTC(kstYear, kstMonth, kstDay, wakeHours, wakeMinutes, 0)
  );

  // [수정] KST 08:10을 정확한 UTC (어제 23:10)로 변환
  let wakeupUTC = new Date(wakeupKST.getTime() - kstOffset);

  // [수정] 기상 시간이 취침 시간보다 이르거나 같으면 (다음 날이므로) 하루를 더함
  if (wakeupUTC.getTime() <= bedtimeUTC.getTime()) {
    wakeupUTC.setUTCDate(wakeupUTC.getUTCDate() + 1); // 24시간을 더함
  }

  // --- 알림 예약 ---
  // [수정] 딜레이 계산은 *실제 UTC 시간(nowUTC)*을 기준으로 해야 함
  const bedtimeDelay = bedtimeUTC.getTime() - nowUTC.getTime();
  console.log(
    `🕐 취침 알림 ${Math.round(bedtimeDelay / 60000)}분 후 (예약시간 KST: ${
      schedule.bedtime
    })`
  );

  if (
    schedule.notifications?.bedtime?.enabled &&
    bedtimeDelay > 5 * 60 * 1000 && // 5분
    bedtimeDelay < 12 * 60 * 60 * 1000 // 12시간
  ) {
    // [수정] 정확한 UTC 시간이 담긴 bedtimeUTC 객체를 전달
    await scheduleNotification(schedule, "bedtime", bedtimeUTC);
  }

  // [수정] 딜레이 계산은 *실제 UTC 시간(nowUTC)*을 기준으로 해야 함
  const wakeupDelay = wakeupUTC.getTime() - nowUTC.getTime();
  console.log(
    `🕐 기상 알림 ${Math.round(wakeupDelay / 60000)}분 후 (예약시간 KST: ${
      schedule.wakeup
    })`
  );

  if (
    schedule.notifications?.wakeup?.enabled &&
    wakeupDelay > 5 * 60 * 1000 && // 5분
    wakeupDelay < 24 * 60 * 60 * 1000 // 24시간
  ) {
    // [수정] 정확한 UTC 시간이 담긴 wakeupUTC 객체를 전달
    await scheduleNotification(schedule, "wakeup", wakeupUTC);
  }
}

async function scheduleNotification(schedule, type, scheduledTime) {
  const message = {
    notification: {
      title: schedule.notifications[type].title,
      body: schedule.notifications[type].body,
    },
    data: {
      type,
      scheduleId: schedule.id,
    },
    topic: `schedule_${schedule.id}`,
  };

  const delayMs = scheduledTime.getTime() - Date.now();

  if (delayMs < 60000) {
    await admin.messaging().send(message);
    console.log(`✅ ${type} 알림 즉시 전송`);
    return;
  }

  // ✅ userId 추가
  await admin
    .firestore()
    .collection("scheduledNotifications")
    .add({
      userId: schedule.userId, // ✅ 추가
      scheduleId: schedule.id,
      type,
      scheduledTime: admin.firestore.Timestamp.fromDate(scheduledTime),
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  console.log(`✅ ${type} 알림 예약 저장`);
}

// 10분마다 실행
exports.scheduleDailyNotifications = onSchedule(
  {
    schedule: "*/10 * * * *",
    timeZone: "Asia/Seoul",
  },
  async () => {
    console.log("⏰ 예약된 알림 확인");

    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

    try {
      const snapshot = await admin
        .firestore()
        .collection("scheduledNotifications")
        .where("scheduledTime", ">=", admin.firestore.Timestamp.fromDate(now))
        .where(
          "scheduledTime",
          "<=",
          admin.firestore.Timestamp.fromDate(tenMinutesLater)
        )
        .get();

      console.log(`📬 전송할 알림: ${snapshot.size}개`);

      for (const doc of snapshot.docs) {
        const notification = doc.data();

        try {
          await admin.messaging().send(notification.message);
          console.log(
            `✅ 알림 전송 완료: ${notification.type} (userId: ${notification.userId})`
          );
          await doc.ref.delete();
        } catch (error) {
          console.error("❌ 알림 전송 실패:", error);
        }
      }

      return null;
    } catch (error) {
      console.error("❌ 스케줄링 오류:", error);
      return null;
    }
  }
);

exports.testNotification = onCall(async (request) => {
  const { scheduleId, type } = request.data;

  const message = {
    notification: {
      title: "💤 테스트 알림",
      body: `${type === "bedtime" ? "취침" : "기상"} 알림 테스트!`,
    },
    data: { type, scheduleId, isTest: "true" },
    topic: `schedule_${scheduleId}`,
  };

  await admin.messaging().send(message);
  return { success: true };
});

exports.helloWorld = onRequest((req, res) => {
  res.send("Hello from Firebase!");
});
