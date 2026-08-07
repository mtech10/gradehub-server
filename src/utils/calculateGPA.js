const calculateGPA = (courses = []) => {
  if (!courses.length) {
    return {
      gpa: 0,
      totalCredits: 0,
      totalPoints: 0,
    };
  }

  let totalCredits = 0;
  let totalPoints = 0;

  for (const course of courses) {
    const creditUnit = Number(
      course.creditUnit ?? course.course?.creditUnit ?? 0,
    );
    const gradePoint = Number(course.gradePoint ?? 0);

    totalCredits += creditUnit;
    totalPoints += creditUnit * gradePoint;
  }

  const gpa =
    totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));

  return {
    gpa,
    totalCredits,
    totalPoints,
  };
};

export default calculateGPA;
