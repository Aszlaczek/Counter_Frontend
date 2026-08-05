import axios from "axios";

type ApiErrorDetail = {
  detail?: string | Array<{ msg?: string; loc?: (string | number)[] }>;
};

/**
 * Extract a human-friendly message from an Axios/FastAPI error response.
 * FastAPI validation errors (422) return `detail` as an array of objects.
 * Other errors return `detail` as a string.
 */
export function getApiErrorDetail(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorDetail | undefined;

    if (!error.response) {
      return "Brak połączenia z serwerem. Upewnij się, że API działa.";
    }

    if (data && typeof data.detail === "string") {
      return data.detail;
    }

    if (data && Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg ?? "Nieprawidłowe dane").join("; ");
    }

    const status = error.response?.status;
    if (status === 401) return "Nieprawidłowe dane logowania.";
    if (status === 403)
      return "Brak uprawnień do tej operacji. Konto zostało dezaktywowane.";
    if (status === 404) return "Nie znaleziono wskazanego zasobu.";
    if (status === 409) return "Podane dane są już zajęte (username / email).";
    if (status === 422) return "Nieprawidłowe dane formularza.";
  }
  return fallback;
}
