import { getApi } from "@/shared/api"
import {  PatchApiGiftCardsIdStatusBodyStatus } from "@/shared/api/models";
import { useMutation } from "@tanstack/react-query";


export const usePatchGiftCardStatus = () => {
    const api = getApi();

    return useMutation({
        mutationFn : async (variables: { status : PatchApiGiftCardsIdStatusBodyStatus; id: string }) => {
           try {
             const response = await api.patchApiGiftCardsIdStatus(variables.id, {status : variables.status});
 
             return response
           } catch (error) {
            
            console.error('Error updating gift card status:', error);
           }
            
        }
    })
}