const mapTranscript = ({ student, sessions, summary }) => ({
  student: {
    id: student.id,
    matricNumber: student.matricNumber,
    firstName: student.firstName,
    middleName: student.middleName,
    lastName: student.lastName,
    fullName: [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(" "),
    gender: student.gender,
    email: student.email,
    phone: student.phone,
    department: student.department,
    level: student.level,
    session: student.session,
    photo: student.photo,
  },

  summary,

  sessions,
});

export default mapTranscript;
