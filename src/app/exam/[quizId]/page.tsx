// Files: src/app/exam/[quizId]/page.tsx

import {ExamSection} from "@/sections/exam-session/pages/ExamSection";

interface ExamPageProps {
  readonly params: Promise<{ quizId: string }>;
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { quizId } = await params;

  return <ExamSection quizId={Number(quizId)} />;
}
