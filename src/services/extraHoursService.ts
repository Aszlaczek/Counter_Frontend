import { fetchAllPages } from "./pagination";
import api from "./api";
import type {
  ExtraHours,
  ExtraHoursCreate,
  ExtraHoursUpdate,
  ExtraHoursSummary,
} from "../type";

export type ExtraHoursListParams = {
  skip?: number;
  limit?: number;
  person_id?: number;
};

export const extraHoursService = {
  async getAll(params?: ExtraHoursListParams): Promise<ExtraHours[]> {
    const res = await api.get<ExtraHours[]>("/api/extra-hours/", { params });
    return res.data;
  },

  async getAllRecords(): Promise<ExtraHours[]> {
    return fetchAllPages(params => extraHoursService.getAll(params));
  },

  async getById(id: number): Promise<ExtraHours> {
    const res = await api.get<ExtraHours>(`/api/extra-hours/${id}`);
    return res.data;
  },

  async create(data: ExtraHoursCreate): Promise<ExtraHours> {
    const res = await api.post<ExtraHours>("/api/extra-hours/", data);
    return res.data;
  },

  async update(id: number, data: ExtraHoursUpdate): Promise<ExtraHours> {
    const res = await api.put<ExtraHours>(`/api/extra-hours/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/extra-hours/${id}`);
  },

  async getSummary(personId: number): Promise<ExtraHoursSummary> {
    const res = await api.get<ExtraHoursSummary>(
      `/api/extra-hours/persons/${personId}/summary`,
    );
    return res.data;
  },
};
