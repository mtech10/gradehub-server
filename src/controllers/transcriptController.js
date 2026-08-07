import * as transcriptService from "../services/transcriptService.js";

export const getStudentTranscript = async (req, res, next) => {
  try {
    const transcript = await transcriptService.getStudentTranscript(
      req.params.studentId,
    );

    res.status(200).json({
      success: true,
      message: "Transcript retrieved successfully",
      data: transcript,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTranscript = async (req, res, next) => {
  try {
    const studentId = req.user.studentid;

    const transcript = await transcriptService.getStudentTranscript(studentId);

    res.json({
      success: true,
      message: "Your transcript retrieved successfully",
      data: transcript,
    });
  } catch (error) {
    next(error);
  }
};
