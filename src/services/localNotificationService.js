import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 알림 처리 방식 설정 (deprecated 수정)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 알림 권한 요청만
export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("알림 권한이 필요합니다.");
    }

    // Android 알림 채널 설정
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

// 스케줄에 따른 로컬 알림 등록
// localNotificationService.js의 scheduleLocalNotifications 함수 수정
export const scheduleLocalNotifications = async (schedule) => {
  try {
    console.log("=== 알림 등록 시작 ===");
    console.log("스케줄:", schedule.name);
    console.log("요일:", schedule.days);
    console.log("잠자리:", schedule.bedtime);
    console.log("기상:", schedule.wakeup);

    // 기존 알림 취소
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
      console.log(`${day}요일 처리 중... weekday=${weekday}`);

      if (!weekday) {
        console.log(`${day}요일을 찾을 수 없음`);
        continue;
      }

      // 다음 발생 시간 계산 함수
      const getNextOccurrence = (weekday, hour, minute) => {
        const now = new Date();
        const targetDate = new Date();

        const currentWeekday = now.getDay(); // 0=일, 1=월, 2=화...
        const targetWeekday = weekday === 1 ? 0 : weekday - 1; // expo형식을 js형식으로 변환

        let daysUntil = targetWeekday - currentWeekday;
        if (
          daysUntil < 0 ||
          (daysUntil === 0 &&
            (now.getHours() > hour ||
              (now.getHours() === hour && now.getMinutes() >= minute)))
        ) {
          daysUntil += 7; // 다음 주로
        }

        targetDate.setDate(targetDate.getDate() + daysUntil);
        targetDate.setHours(hour, minute, 0, 0);

        return targetDate;
      };

      // 잠자리 알림
      if (schedule.notifications.bedtime?.enabled) {
        const [bedHours, bedMinutes] = schedule.bedtime.split(":").map(Number);
        console.log(`잠자리 알림 등록: ${day}요일 ${bedHours}:${bedMinutes}`);

        const nextBedtime = getNextOccurrence(weekday, bedHours, bedMinutes);
        console.log(`다음 잠자리 알림 시간: ${nextBedtime}`);

        try {
          const bedtimeId = await Notifications.scheduleNotificationAsync({
            content: {
              title: schedule.notifications.bedtime.title,
              body: schedule.notifications.bedtime.body,
              data: {
                type: "bedtime",
                scheduleId: schedule.id,
                scheduleName: schedule.name,
              },
            },
            trigger: {
              date: nextBedtime,
              repeats: false,
            },
          });
          console.log(`잠자리 알림 ID: ${bedtimeId}`);
          notificationIds.push(bedtimeId);
        } catch (error) {
          console.error(`${day}요일 잠자리 알림 등록 실패:`, error);
        }
      }

      // 기상 알림
      if (schedule.notifications.wakeup?.enabled) {
        const [wakeHours, wakeMinutes] = schedule.wakeup.split(":").map(Number);
        console.log(`기상 알림 등록: ${day}요일 ${wakeHours}:${wakeMinutes}`);

        const nextWakeup = getNextOccurrence(weekday, wakeHours, wakeMinutes);
        console.log(`다음 기상 알림 시간: ${nextWakeup}`);

        try {
          const wakeupId = await Notifications.scheduleNotificationAsync({
            content: {
              title: schedule.notifications.wakeup.title,
              body: schedule.notifications.wakeup.body,
              data: {
                type: "wakeup",
                scheduleId: schedule.id,
                scheduleName: schedule.name,
              },
            },
            trigger: {
              date: nextWakeup,
              repeats: false,
            },
          });
          console.log(`기상 알림 ID: ${wakeupId}`);
          notificationIds.push(wakeupId);
        } catch (error) {
          console.error(`${day}요일 기상 알림 등록 실패:`, error);
        }
      }
    }

    console.log(`총 ${notificationIds.length}개 알림 등록 완료`);
    return notificationIds;
  } catch (error) {
    console.error("알림 등록 전체 실패:", error);
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

// 모든 스케줄 알림 취소 (메인 토글 OFF 시)
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
        seconds: 10,
      },
    });

    console.log("테스트 알림 전송됨");
  } catch (error) {
    console.error("테스트 알림 실패:", error);
    throw error;
  }
};
