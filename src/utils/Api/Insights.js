import { HttpStatusCode } from "axios";
import apiFetcher from "../interCeptor";

export const getAnalyticsDataApi = async ({ stDate, enDate }) => {
  try {
    const response = await apiFetcher(
      `/api/v1/store/insight/gtm?end_date=${enDate}&start_date=${stDate}`
    );
    if (response.status === HttpStatusCode.Ok) {
      return response;
    }
  } catch (error) {
    throw new Error(error);
  }
};
