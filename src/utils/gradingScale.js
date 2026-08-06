const gradingScale = [
  {
    min: 70,
    max: 100,
    grade: "A",
    gradePoint: 5.0,
    remark: "Excellent",
  },
  {
    min: 60,
    max: 69,
    grade: "B",
    gradePoint: 4.0,
    remark: "Very Good",
  },
  {
    min: 50,
    max: 59,
    grade: "C",
    gradePoint: 3.0,
    remark: "Good",
  },
  {
    min: 45,
    max: 49,
    grade: "D",
    gradePoint: 2.0,
    remark: "Fair",
  },
  {
    min: 40,
    max: 44,
    grade: "E",
    gradePoint: 1.0,
    remark: "Pass",
  },
  {
    min: 0,
    max: 39,
    grade: "F",
    gradePoint: 0.0,
    remark: "Fail",
  },
];

export default gradingScale;
