//Files: src/modules/proctor-management/application/service/ProctorManagementService.ts
import type { AppResult } from "@/core/application/result/AppResult";
import type {
  AssignProctorRoomRequestDto,
  CreateProctorRequestDto,
} from "../../domain/dto/ProctorManagementRequestDto";
import type { ProctorSummaryResponseDto } from "../../domain/dto/ProctorManagementResponseDto";
import type { AssignProctorRoomUseCase } from "../usecase/AssignProctorRoomUseCase";
import type { CreateProctorUseCase } from "../usecase/CreateProctorUseCase";
import type { ListProctorsUseCase } from "../usecase/ListProctorsUseCase";
import type { SyncMoodleTeachersUseCase } from "../usecase/SyncMoodleTeachersUseCase";

export class ProctorManagementService {
  constructor(
    private readonly createUseCase: CreateProctorUseCase,
    private readonly assignUseCase: AssignProctorRoomUseCase,
    private readonly listUseCase: ListProctorsUseCase,
    private readonly syncUseCase: SyncMoodleTeachersUseCase,
  ) {}

  public createProctor(
    dto: CreateProctorRequestDto,
  ): Promise<AppResult<ProctorSummaryResponseDto>> {
    return this.createUseCase.execute(dto);
  }

  public assignRoom(
    dto: AssignProctorRoomRequestDto,
  ): Promise<AppResult<ProctorSummaryResponseDto>> {
    return this.assignUseCase.execute(dto);
  }

  public listProctors(
    roomNumber?: string,
  ): Promise<AppResult<readonly ProctorSummaryResponseDto[]>> {
    return this.listUseCase.execute(roomNumber);
  }

  public syncTeachersFromMoodle(): Promise<
    AppResult<readonly ProctorSummaryResponseDto[]>
  > {
    return this.syncUseCase.execute();
  }
}
