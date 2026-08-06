import gradingScale from "./gradingScale.js";

const calculateGrade = (caScore, examScore) => {
  const ca = Number(caScore);
  const exam = Number(examScore);

  const totalScore = ca + exam;

  if (totalScore > 100 || totalScore < 0) {
    throw new Error("Invalid total score");
  }

  const grading = gradingScale.find(
    ({ min, max }) => totalScore >= min && totalScore <= max,
  );

  if (!grading) {
    throw new Error("Unable to calculate grade");
  }

  return {
    totalScore,
    grade: grading.grade,
    gradePoint: grading.gradePoint,
    remark: grading.remark,
  };
};

export default calculateGrade;
