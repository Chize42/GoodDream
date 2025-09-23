// utils/dayUtils.js

// 요일 순서 정의 (월요일부터 시작)
const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

// 요일 배열을 올바른 순서로 정렬
export const sortDays = (days) => {
  if (!Array.isArray(days)) return [];

  return days.sort((a, b) => {
    const indexA = DAY_ORDER.indexOf(a);
    const indexB = DAY_ORDER.indexOf(b);
    return indexA - indexB;
  });
};

// 요일 배열을 문자열로 변환 (정렬된 상태로)
export const formatDaysString = (days) => {
  if (!Array.isArray(days) || days.length === 0) return "없음";

  const sortedDays = sortDays(days);

  // 연속된 요일이면 축약 표시
  if (sortedDays.length === 7) {
    return "매일";
  } else if (
    sortedDays.length === 5 &&
    sortedDays.every((day) => ["월", "화", "수", "목", "금"].includes(day))
  ) {
    return "평일";
  } else if (
    sortedDays.length === 2 &&
    sortedDays.every((day) => ["토", "일"].includes(day))
  ) {
    return "주말";
  }

  return sortedDays.join(", ");
};

// 요일 선택 화면에서 사용할 정렬된 요일 목록
export const getAllDaysOrdered = () => {
  return DAY_ORDER.map((day) => ({
    key: day,
    label: day + "요일",
    short: day,
  }));
};
