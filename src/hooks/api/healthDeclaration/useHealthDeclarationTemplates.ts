import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    GetApiHealthDeclarationTemplatesParams,
    PostApiHealthDeclarationTemplatesBody,
    PutApiHealthDeclarationTemplateIdBody,
} from '../../../shared/api/models';
import { api } from '@/utils/Api/POS';
import { toast } from 'react-toastify';
import { t } from 'i18next';

/**
 * Hook for fetching health declaration templates
 *
 * @param params - Optional query parameters for the API call
 * @param enabled - Whether the query should run (default: true)
 * @returns TanStack Query result with health declaration templates data
 */
export function useHealthDeclarationTemplates(
    params?: GetApiHealthDeclarationTemplatesParams,
    enabled: boolean = true,
) {

    return useQuery({
        queryKey: ['health-declaration-templates', params],
        queryFn: () => api.getApiHealthDeclarationTemplates(params),
        enabled,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
    });
}

/**
 * Hook for fetching a single health declaration template by ID
 *
 * @param id - Template ID
 * @param enabled - Whether the query should run (default: true)
 * @returns TanStack Query result with health declaration template data
 */
export function useHealthDeclarationTemplate(id: string | undefined, enabled: boolean = true) {
    return useQuery({
        queryKey: ['health-declaration-template', id],
        queryFn: () => api.getApiHealthDeclarationTemplateId(id!),
        enabled: enabled && !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
    });
}

/**
 * Hook for creating a health declaration template
 *
 * @returns Mutation object for creating templates
 */
export function useCreateHealthDeclarationTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PostApiHealthDeclarationTemplatesBody) => api.postApiHealthDeclarationTemplates(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health-declaration-templates'] });
            toast.success(t('Services.TemplateCreatedSuccessfully'));
        },
        onError: (error) => {
            toast.error(t('Services.TemplateCreatedFailed'));
            console.error('Template creation failed:', error);
        },
    });
}

/**
 * Hook for updating a health declaration template
 *
 * @returns Mutation object for updating templates
 */
export function useUpdateHealthDeclarationTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: PutApiHealthDeclarationTemplateIdBody }) =>
            api.putApiHealthDeclarationTemplateId(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health-declaration-templates'] });
            queryClient.invalidateQueries({ queryKey: ['health-declaration-template'] });
            toast.success(t('Services.TemplateUpdatedSuccessfully') || 'Template updated successfully');
        },
        onError: (error) => {
            toast.error(t('Services.TemplateUpdatedFailed') || 'Failed to update template');
            console.error('Template update failed:', error);
        },
    });
}
