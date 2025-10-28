// functions/src/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// 시간 유틸리티 함수
const getNextOccurrence = (weekday, hour, minute) => {
  const now = new Date();
  const targetDate = new Date();

  // weekday: '일', '월', ... -> JS weekday: 0(일)~6(토)
  const dayMapping = {
    일: 0,
    월: 1,
    화: 2,
    수: 3,
    목: 4,
    금: 5,
    토: 6,
  };

  const targetWeekday = dayMapping[weekday];
  const currentWeekday = now.getDay();

  let daysUntil = targetWeekday - currentWeekday;

  // 같은 요일인데 이미 시간이 지났으면 다음주로
  if (
    daysUntil === 0 &&
    (now.getHours() > hour ||
      (now.getHours() === hour && now.getMinutes() >= minute))
  ) {
    daysUntil = 7;
  } else if (daysUntil < 0) {
    daysUntil += 7;
  }

  targetDate.setDate(targetDate.getDate() + daysUntil);
  targetDate.setHours(hour, minute, 0, 0);

  return targetDate;
};

// 스케줄 생성/수정시 알림 일정 등록
exports.onScheduleChange = functions.firestore
  .document("users/{userId}/sleepSchedules/{scheduleId}")
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const scheduleId = context.params.scheduleId;

    // 스케줄이 삭제된 경우
    if (!change.after.exists) {
      console.log(`스케줄 ${scheduleId} 삭제됨, 알림 취소`);
      return null;
    }

    const scheduleData = change.after.data();

    // 스케줄이 비활성화되었거나 알림이 비활성화된 경우
    if (!scheduleData.enabled || !scheduleData.notifications) {
      console.log(`스케줄 ${scheduleId} 비활성화됨, 알림 취소`);
      return null;
    }

    console.log(`스케줄 ${scheduleId} (${scheduleData.name}) 알림 처리 시작`);

    // 각 요일별 알림 설정
    for (const day of scheduleData.days) {
      // 취침 알림 처리
      if (scheduleData.notifications.bedtime?.enabled) {
        const [bedHours, bedMinutes] = scheduleData.bedtime
          .split(":")
          .map(Number);
        const nextBedtime = getNextOccurrence(day, bedHours, bedMinutes);

        console.log(`${day}요일 취침 알림 예약: ${nextBedtime.toISOString()}`);

        // 알림 메시지 구성
        const message = {
          notification: {
            title:
              scheduleData.notifications.bedtime.title ||
              "💤 잠자리에 들 시간입니다",
            body:
              scheduleData.notifications.bedtime.body ||
              `${scheduleData.name} - 편안한 밤 되세요!`,
          },
          data: {
            type: "bedtime",
            scheduleId: scheduleData.id,
            scheduleName: scheduleData.name,
            day: day,
            clickAction: "SLEEP_SCHEDULE_NOTIFICATION",
          },
          topic: `schedule_${scheduleData.id}`,
          // android: {
          //   priority: "high",
          //   notification: {
          //     channelId: "sleep-schedule",
          //   },
          // },
          apns: {
            payload: {
              aps: {
                sound: "default",
              },
            },
          },
        };

        // 예약 전송 설정
        try {
          await admin
            .messaging()
            .sendToTopic(`schedule_${scheduleData.id}`, message, {
              scheduleTime: nextBedtime,
            });
          console.log(`✅ 취침 알림 예약 완료: ${nextBedtime.toISOString()}`);
        } catch (error) {
          console.error(`❌ 취침 알림 예약 실패:`, error);
        }
      }

      // 기상 알림 처리
      if (scheduleData.notifications.wakeup?.enabled) {
        const [wakeHours, wakeMinutes] = scheduleData.wakeup
          .split(":")
          .map(Number);
        const nextWakeup = getNextOccurrence(day, wakeHours, wakeMinutes);

        console.log(`${day}요일 기상 알림 예약: ${nextWakeup.toISOString()}`);

        // 알림 메시지 구성
        const message = {
          notification: {
            title:
              scheduleData.notifications.wakeup.title || "🌅 좋은 아침입니다!",
            body:
              scheduleData.notifications.wakeup.body ||
              `${scheduleData.name} - 상쾌한 하루를 시작하세요!`,
          },
          data: {
            type: "wakeup",
            scheduleId: scheduleData.id,
            scheduleName: scheduleData.name,
            day: day,
            clickAction: "SLEEP_SCHEDULE_NOTIFICATION",
          },
          topic: `schedule_${scheduleData.id}`,
          // android: {
          //   priority: "high",
          //   notification: {
          //     channelId: "sleep-schedule",
          //   },
          // },
          apns: {
            payload: {
              aps: {
                sound: "default",
              },
            },
          },
        };

        // 예약 전송 설정
        try {
          await admin
            .messaging()
            .sendToTopic(`schedule_${scheduleData.id}`, message, {
              scheduleTime: nextWakeup,
            });
          console.log(`✅ 기상 알림 예약 완료: ${nextWakeup.toISOString()}`);
        } catch (error) {
          console.error(`❌ 기상 알림 예약 실패:`, error);
        }
      }
    }

    return null;
  });

// 매일 자정에 실행되어 다음 날의 알림 예약을 갱신
exports.scheduleNextDayNotifications = functions.pubsub
  .schedule("0 0 * * *") // 매일 자정에 실행
  .timeZone("Asia/Seoul") // 한국 시간대
  .onRun(async (context) => {
    console.log("매일 자정 알림 갱신 함수 실행");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 요일 매핑
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const tomorrowDay = dayNames[tomorrow.getDay()];

    console.log(`내일(${tomorrowDay}요일)의 알림 예약 시작`);

    // 모든 사용자 가져오기
    const usersSnapshot = await admin.firestore().collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // 해당 요일에 활성화된 스케줄 가져오기
      const schedulesSnapshot = await admin
        .firestore()
        .collection(`users/${userId}/sleepSchedules`)
        .where("enabled", "==", true)
        .where("days", "array-contains", tomorrowDay)
        .get();

      console.log(
        `사용자 ${userId}의 ${tomorrowDay}요일 스케줄: ${schedulesSnapshot.size}개`
      );

      // 각 스케줄에 대한 알림 설정
      for (const scheduleDoc of schedulesSnapshot.docs) {
        const schedule = scheduleDoc.data();

        // onScheduleChange 트리거와 동일한 로직 수행
        // 여기에 알림 설정 로직 추가...
      }
    }

    return null;
  });

// 테스트용 함수
exports.testNotification = functions.https.onCall(async (data, context) => {
  // 인증 확인
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "로그인이 필요합니다."
    );
  }

  const { userId, scheduleId, type } = data;

  if (!userId || !type) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "userId와 type이 필요합니다."
    );
  }

  try {
    // FCM 토큰이 있는지 확인
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    if (!userDoc.exists || !userDoc.data().fcmTokens) {
      throw new functions.https.HttpsError(
        "not-found",
        "사용자 FCM 토큰을 찾을 수 없습니다."
      );
    }

    // 알림 메시지 구성
    const message = {
      notification: {
        title: "💤 테스트 알림",
        body: `${type === "bedtime" ? "취침" : "기상"} 알림이 정상 작동합니다!`,
      },
      data: {
        type,
        scheduleId: scheduleId || "test",
        scheduleName: "테스트 스케줄",
        isTest: "true",
      },
      // 토큰이 있으면 토큰으로 전송
      token: Object.keys(userDoc.data().fcmTokens)[0],
    };

    // 알림 전송
    const response = await admin.messaging().send(message);
    console.log("테스트 알림 전송 완료:", response);

    return { success: true, message: "테스트 알림이 전송되었습니다." };
  } catch (error) {
    console.error("테스트 알림 전송 실패:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
