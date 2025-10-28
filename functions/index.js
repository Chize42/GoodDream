const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

// 스케줄 함수 - 매일 자정에 실행되어 알림 전송
exports.scheduleDailyNotifications = onSchedule(
  {
    schedule: "0 0 * * *", // 매일 자정에 실행
    timeZone: "Asia/Seoul", // 한국 시간대
  },
  async () => {
    console.log("매일 자정 알림 예약 함수 실행");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 요일 매핑
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const tomorrowDay = dayNames[tomorrow.getDay()];

    try {
      // 해당 요일에 활성화된 스케줄 가져오기
      const schedulesSnapshot = await admin
        .firestore()
        .collectionGroup("sleepSchedules")
        .where("days", "array-contains", tomorrowDay)
        .where("enabled", "==", true)
        .get();

      console.log(
        `내일(${tomorrowDay}요일) 알림 대상 스케줄: ${schedulesSnapshot.size}개`
      );

      // 각 스케줄에 대한 알림 설정
      for (const scheduleDoc of schedulesSnapshot.docs) {
        const schedule = scheduleDoc.data();

        // 취침 알림
        if (
          schedule.notifications &&
          schedule.notifications.bedtime &&
          schedule.notifications.bedtime.enabled
        ) {
          const bedtimeArray = schedule.bedtime.split(":").map(Number);
          const bedHours = bedtimeArray[0];
          const bedMinutes = bedtimeArray[1];

          console.log(`${schedule.name} 취침 시간: ${bedHours}:${bedMinutes}`);

          // 알림 메시지
          const message = {
            notification: {
              title:
                schedule.notifications.bedtime.title ||
                "💤 잠자리에 들 시간입니다",
              body:
                schedule.notifications.bedtime.body ||
                `${schedule.name} - 편안한 밤 되세요!`,
            },
            data: {
              type: "bedtime",
              scheduleId: schedule.id,
            },
            topic: `schedule_${schedule.id}`,
            android: {
              priority: "high",
            },
          };

          try {
            await admin.messaging().send(message);
            console.log(`✅ ${schedule.id} 취침 알림 전송 완료`);
          } catch (error) {
            console.error(`❌ 취침 알림 전송 실패:`, error);
          }
        }

        // 기상 알림
        if (
          schedule.notifications &&
          schedule.notifications.wakeup &&
          schedule.notifications.wakeup.enabled
        ) {
          const wakeupArray = schedule.wakeup.split(":").map(Number);
          const wakeHours = wakeupArray[0];
          const wakeMinutes = wakeupArray[1];

          console.log(
            `${schedule.name} 기상 시간: ${wakeHours}:${wakeMinutes}`
          );

          // 알림 메시지
          const message = {
            notification: {
              title:
                schedule.notifications.wakeup.title || "🌅 좋은 아침입니다!",
              body:
                schedule.notifications.wakeup.body ||
                `${schedule.name} - 상쾌한 하루를 시작하세요!`,
            },
            data: {
              type: "wakeup",
              scheduleId: schedule.id,
            },
            topic: `schedule_${schedule.id}`,
            android: {
              priority: "high",
            },
          };

          try {
            await admin.messaging().send(message);
            console.log(`✅ ${schedule.id} 기상 알림 전송 완료`);
          } catch (error) {
            console.error(`❌ 기상 알림 전송 실패:`, error);
          }
        }
      }

      return null;
    } catch (error) {
      console.error("알림 예약 실패:", error);
      return null;
    }
  }
);

// 테스트용 함수 - 앱에서 호출할 수 있음
exports.testNotification = onCall(async (data) => {
  const { scheduleId, type } = data;

  if (!scheduleId || !type) {
    throw new Error("scheduleId와 type이 필요합니다.");
  }

  try {
    // 알림 메시지 구성
    const message = {
      notification: {
        title: "💤 테스트 알림",
        body: `${type === "bedtime" ? "취침" : "기상"} 알림이 정상 작동합니다!`,
      },
      data: {
        type,
        scheduleId,
        isTest: "true",
      },
      topic: `schedule_${scheduleId}`,
    };

    // 알림 전송
    const response = await admin.messaging().send(message);
    console.log("테스트 알림 전송 완료:", response);

    return { success: true, message: "테스트 알림이 전송되었습니다." };
  } catch (error) {
    console.error("테스트 알림 전송 실패:", error);
    throw new Error(error.message);
  }
});

// 테스트용 HTTP 함수
exports.helloWorld = onRequest((req, res) => {
  res.send("Hello from Firebase!");
});
