import calculateCGPA from "./calculateCGPA.js";

const transcriptSummary = (semesterSummaries = []) => {
  const { cgpa, totalCredits, totalPoints } = calculateCGPA(semesterSummaries);

  let earnedCredits = 0;
  let attemptedCredits = 0;
  let passedCourses = 0;
  let failedCourses = 0;

  semesterSummaries.forEach((semester) => {
    (semester.courses || []).forEach((course) => {
      const creditUnit = Number(course.creditUnit ?? 0);

      attemptedCredits += creditUnit;

      if (course.grade !== "F") {
        earnedCredits += creditUnit;
        passedCourses++;
      } else {
        failedCourses++;
      }
    });
  });

  return {
    cgpa,
    totalCredits,
    totalPoints,
    attemptedCredits,
    earnedCredits,
    passedCourses,
    failedCourses,
  };
};

export default transcriptSummary;
