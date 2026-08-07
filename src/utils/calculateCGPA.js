const calculateCGPA = (semesterSummaries = []) => {
  if (!semesterSummaries.length) {
    return {
      cgpa: 0,
      totalCredits: 0,
      totalPoints: 0,
    };
  }

  let totalCredits = 0;
  let totalPoints = 0;

  for (const semester of semesterSummaries) {
    totalCredits += Number(semester.totalCredits ?? 0);
    totalPoints += Number(semester.totalPoints ?? 0);
  }

  const cgpa =
    totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));

  return {
    cgpa,
    totalCredits,
    totalPoints,
  };
};

export default calculateCGPA;
