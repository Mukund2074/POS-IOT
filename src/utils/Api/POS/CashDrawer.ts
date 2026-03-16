import { getApi } from "@/shared/api";
import { PostApiCashDrawerCloseBody } from "@/shared/api/models";

export const PostCashDrawerClose = async(data:PostApiCashDrawerCloseBody) => {
  const api = getApi();

 return await api.postApiCashDrawerClose(data);
};