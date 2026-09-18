// src/modules/proctor-management/infrastructure/external/MoodleTeacherSyncAdapter.ts
import type {MoodleTeacherSyncAdapterContract} from "../../domain/contract/MoodleTeacherSyncAdapterContract";
import type {MoodleTeacherRawDto} from "../../domain/dto/ProctorManagementResponseDto";

export class MoodleTeacherSyncAdapter implements MoodleTeacherSyncAdapterContract {
    private readonly baseUrl: string;
    private readonly wsToken: string;

    constructor() {
        this.baseUrl = process.env.MOODLE_BASE_URL || "";
        this.wsToken = process.env.MOODLE_WS_TOKEN || "";
    }

    public async fetchTeachers(): Promise<readonly MoodleTeacherRawDto[]> {
        if (!this.baseUrl || !this.wsToken) {
            throw new Error("Konfigurasi MOODLE_BASE_URL atau MOODLE_WS_TOKEN belum disetel di environment.");
        }

        const endpoint = new URL(`${this.baseUrl.replace(/\/+$/, "")}/webservice/rest/server.php`);
        endpoint.searchParams.set("wstoken", this.wsToken);
        endpoint.searchParams.set("wsfunction", "quizaccess_guard_get_teachers");
        endpoint.searchParams.set("moodlewsrestformat", "json");

        const response = await fetch(endpoint.toString(), {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(`Moodle Web Service error (HTTP ${response.status}): ${response.statusText}`);
        }

        const data = await response.json();

        // Tangani jika Moodle mengembalikan format pesan error/exception
        if (data.exception || data.errorcode) {
            throw new Error(`Moodle API Exception: ${data.message || data.errorcode}`);
        }

        if (!Array.isArray(data)) {
            throw new Error("Format respons Web Service Moodle tidak sesuai (bukan array).");
        }

        return data as MoodleTeacherRawDto[];
    }
}