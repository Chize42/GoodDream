import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 알림 처리 방식 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 알림 권한 요청
export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("알림 권한이 필요합니다.");
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("sleep-schedule", {
        name: "Sleep Schedule",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#007AFF",
        sound: true,
      });
    }

    return true;
  } catch (error) {
    console.error("알림 권한 요청 실패:", error);
    throw error;
  }
};

// 다음 발생 시간 계산 함수
const getNextOccurrence = (weekday, hour, minute) => {
  const now = new Date();
  const targetDate = new Date();

  // weekday: 1(일)~7(토) -> JS weekday: 0(일)~6(토)
  const targetWeekday = weekday === 1 ? 0 : weekday - 1;
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

// 스케줄에 따른 로컬 알림 등록
export const scheduleLocalNotifications = async (schedule) => {
  try {
    console.log("=== 알림 등록 시작 ===");
    console.log("스케줄:", schedule.name);
    console.log("요일:", schedule.days);
    console.log("잠자리:", schedule.bedtime);
    console.log("기상:", schedule.wakeup);
    console.log("Platform:", Platform.OS);

    await cancelScheduleNotifications(schedule.id);

    if (!schedule.enabled || !schedule.notifications) {
      console.log("스케줄이 비활성화되어 있음");
      return [];
    }

    const dayMapping = {
      일: 1,
      월: 2,
      화: 3,
      수: 4,
      목: 5,
      금: 6,
      토: 7,
    };

    const notificationIds = [];

    for (const day of schedule.days) {
      const weekday = dayMapping[day];
      console.log(`\n${day}요일 처리 중... weekday=${weekday}`);

      if (!weekday) continue;

      // 잠자리 알림
      if (schedule.notifications.bedtime?.enabled) {
        const [bedHours, bedMinutes] = schedule.bedtime.split(":").map(Number);
        const nextBedtime = getNextOccurrence(weekday, bedHours, bedMinutes);

        console.log(
          `${day}요일 잠자리 알림 예약: ${nextBedtime.toLocaleString("ko-KR")}`
        );

        try {
          let bedtimeId;

          if (Platform.OS === "ios") {
            // iOS: calendar trigger 사용
            bedtimeId = await Notifications.scheduleNotificationAsync({
              content: {
                title: schedule.notifications.bedtime.title,
                body: schedule.notifications.bedtime.body,
                data: {
                  type: "bedtime",
                  scheduleId: schedule.id,
                  scheduleName: schedule.name,
                  day: day,
                },
              },
              trigger: {
                type: "calendar",
                repeats: true,
                weekday: weekday,
                hour: bedHours,
                minute: bedMinutes,
              },
            });
          } else {
            // Android: date trigger 사용 (매주 4개씩 미리 예약)
            for (let i = 0; i < 4; i++) {
              const futureDate = new Date(nextBedtime);
              futureDate.setDate(futureDate.getDate() + i * 7);

              const id = await Notifications.scheduleNotificationAsync({
                content: {
                  title: schedule.notifications.bedtime.title,
                  body: schedule.notifications.bedtime.body,
                  data: {
                    type: "bedtime",
                    scheduleId: schedule.id,
                    scheduleName: schedule.name,
                    day: day,
                    weekIndex: i,
                  },
                },
                trigger: {
                  date: futureDate,
                },
              });

              if (i === 0) bedtimeId = id;
              console.log(
                `  → ${i + 1}주차 예약 완료: ${futureDate.toLocaleString(
                  "ko-KR"
                )}`
              );
            }
          }

          console.log(`✅ 잠자리 알림 ID: ${bedtimeId}`);
          notificationIds.push(bedtimeId);
        } catch (error) {
          console.error(`❌ ${day}요일 잠자리 알림 등록 실패:`, error);
        }
      }

      // 기상 알림
      if (schedule.notifications.wakeup?.enabled) {
        const [wakeHours, wakeMinutes] = schedule.wakeup.split(":").map(Number);
        const nextWakeup = getNextOccurrence(weekday, wakeHours, wakeMinutes);

        console.log(
          `${day}요일 기상 알림 예약: ${nextWakeup.toLocaleString("ko-KR")}`
        );

        try {
          let wakeupId;

          if (Platform.OS === "ios") {
            // iOS: calendar trigger 사용
            wakeupId = await Notifications.scheduleNotificationAsync({
              content: {
                title: schedule.notifications.wakeup.title,
                body: schedule.notifications.wakeup.body,
                data: {
                  type: "wakeup",
                  scheduleId: schedule.id,
                  scheduleName: schedule.name,
                  day: day,
                },
              },
              trigger: {
                type: "calendar",
                repeats: true,
                weekday: weekday,
                hour: wakeHours,
                minute: wakeMinutes,
              },
            });
          } else {
            // Android: date trigger 사용 (매주 4개씩 미리 예약)
            for (let i = 0; i < 4; i++) {
              const futureDate = new Date(nextWakeup);
              futureDate.setDate(futureDate.getDate() + i * 7);

              const id = await Notifications.scheduleNotificationAsync({
                content: {
                  title: schedule.notifications.wakeup.title,
                  body: schedule.notifications.wakeup.body,
                  data: {
                    type: "wakeup",
                    scheduleId: schedule.id,
                    scheduleName: schedule.name,
                    day: day,
                    weekIndex: i,
                  },
                },
                trigger: {
                  date: futureDate,
                },
              });

              if (i === 0) wakeupId = id;
              console.log(
                `  → ${i + 1}주차 예약 완료: ${futureDate.toLocaleString(
                  "ko-KR"
                )}`
              );
            }
          }

          console.log(`✅ 기상 알림 ID: ${wakeupId}`);
          notificationIds.push(wakeupId);
        } catch (error) {
          console.error(`❌ ${day}요일 기상 알림 등록 실패:`, error);
        }
      }
    }

    console.log(`\n✅ 총 ${notificationIds.length}개 알림 그룹 등록 완료`);
    console.log("\n등록된 알림 확인:");
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`전체 등록된 알림 수: ${scheduled.length}개`);
    scheduled.forEach((n) => {
      const trigger = n.trigger;
      const triggerTime =
        trigger.type === "calendar"
          ? `매주 요일${trigger.weekday} ${trigger.hour}:${trigger.minute}`
          : new Date(trigger.value * 1000).toLocaleString("ko-KR");
      console.log(`- ${n.content.title} | ${triggerTime}`);
    });

    return notificationIds;
  } catch (error) {
    console.error("로컬 알림 등록 실패:", error);
    throw error;
  }
};

// 특정 스케줄의 알림만 취소
export const cancelScheduleNotifications = async (scheduleId) => {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const notificationsToCancel = scheduledNotifications.filter(
      (notification) => notification.content?.data?.scheduleId === scheduleId
    );

    for (const notification of notificationsToCancel) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }

    console.log(
      `스케줄 ${scheduleId}의 ${notificationsToCancel.length}개 알림 취소됨`
    );
  } catch (error) {
    console.error("알림 취소 실패:", error);
  }
};

// 모든 스케줄 알림 취소
export const cancelAllScheduleNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("모든 스케줄 알림 취소됨");
  } catch (error) {
    console.error("모든 알림 취소 실패:", error);
  }
};

// 현재 등록된 알림 목록 조회
export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("알림 목록 조회 실패:", error);
    return [];
  }
};

// 테스트용 즉시 알림
export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💤 테스트 알림",
        body: "로컬 알림이 정상 작동합니다!",
        data: { type: "test" },
      },
      trigger: {
        seconds: 2,
      },
    });

    console.log("테스트 알림 전송됨");
  } catch (error) {
    console.error("테스트 알림 실패:", error);
    throw error;
  }
};
