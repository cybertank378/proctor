export interface SaveStreamFrameDto {
  attemptRecordId: string;
  quizId: number;
  userId: number;
  screenshotBase64: string;
  isSuspicious?: boolean;
}

export interface StreamFrameResultDto {
  success: boolean;
  imagePath: string;
}

export interface LiveProctoringRepositoryContract {
  saveFrame(dto: SaveStreamFrameDto): Promise<StreamFrameResultDto>;
}
