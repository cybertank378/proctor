//Files: src/modules/proctor-management/infrastructure/builder/ProctorManagementQueryBuilder.ts
import type {Prisma} from "@/generated/prisma/client";

export const ProctorManagementQueryBuilder = {
    buildListFilter(roomNumber?: string): Prisma.ProctorUserWhereInput {
        if (!roomNumber || roomNumber.trim().length === 0) {
            return {};
        }
        return {
            OR: [
                { roomNumber: roomNumber.trim() },
                { role: "CHIEF_PROCTOR" },
            ],
        };
    },

    getMoodleTeacherRawSql(): string {
        return ` SELECT DISTINCT 
          u.id AS user_id,
          u.username,
          u.firstname,
          u.lastname,
          u.email,
          r.shortname AS role_name,
          c.fullname AS course_name
      FROM mdl_user u
      INNER JOIN mdl_role_assignments ra ON ra.userid = u.id
      INNER JOIN mdl_role r ON r.id = ra.roleid
      INNER JOIN mdl_context cx ON cx.id = ra.contextid
      INNER JOIN mdl_course c ON c.id = cx.instanceid
      WHERE cx.contextlevel = 50
        AND r.shortname IN ('editingteacher', 'teacher')
        AND u.deleted = 0
        AND u.suspended = 0
      ORDER BY u.lastname, c.fullname;
    `;
    }
}