// Files: src/app/exam/[quizId]/page.tsx

import { ExamSection } from "@/sections/exam-session/pages/ExamSection";

interface ExamPageProps {
  readonly params: Promise<{ quizId: string }>;
  readonly searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function ExamPage({
  params,
  searchParams,
}: ExamPageProps) {
  const { quizId } = await params;
  const sp = await searchParams;

  const uid = typeof sp.uid === "string" ? Number(sp.uid) : undefined;
  const cmid = typeof sp.cmid === "string" ? Number(sp.cmid) : undefined;
  const attemptId =
    typeof sp.attemptId === "string" ? Number(sp.attemptId) : undefined;

  return (
    <ExamSection
      quizId={Number(quizId)}
      cmid={cmid}
      userId={uid}
      attemptId={attemptId}
    />
  );
}
