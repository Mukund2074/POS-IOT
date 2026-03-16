import { HttpStatusCode } from "axios";
import apiFetcher from "../interCeptor";

export const GetBookingNotificationApi = async ({ eid }) => {
    try {
        const response = await apiFetcher.get(`api/v1/store/notifications?employee_id=${eid}`);
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error)
    }
}