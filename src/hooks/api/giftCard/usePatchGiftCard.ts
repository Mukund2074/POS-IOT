import { getApi } from "@/shared/api"
import { PatchApiGiftCardsIdBody } from "@/shared/api/models";
import { useMutation } from "@tanstack/react-query";


export const usePatchGiftCard = () => {
 
    const api = getApi();

    return useMutation({
        mutationFn : async (variables: { data: PatchApiGiftCardsIdBody; id: string }) => {
            try {
                const response = await api.patchApiGiftCardsId(variables.id, variables.data);
                return response
            } catch (error) {
                console.error('Error updating gift card:', error);
                throw error
            }
        }
    })
}