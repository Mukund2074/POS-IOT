import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { TriggerBuilderRootState } from '../types';

export interface ConditionFormHandle {
    getValues: () => unknown;
    validate: () => Promise<boolean>;
}

/** Registry key: condition instance id (unique per condition in playground). Validators are kept when form unmounts so we can validate all at once. */
const triggerGroupsSelector = (state: TriggerBuilderRootState) =>
    state.triggerFlow?.triggerFlowData?.triggerGroups ?? [];

const registryRef = { current: new Map<string, ConditionFormHandle>() };

export function usePlaygroundFormRegistry() {
    const triggerGroups = useSelector(triggerGroupsSelector);

    const register = useCallback((conditionInstanceId: string, handle: ConditionFormHandle) => {
        registryRef.current.set(conditionInstanceId, handle);
    }, []);

    const unregister = useCallback((conditionInstanceId: string) => {
        registryRef.current.delete(conditionInstanceId);
    }, []);

    const getPlaygroundConditionIds = useCallback((): string[] => {
        const ids: string[] = [];
        for (const group of triggerGroups) {
            for (const c of group.conditions || []) {
                if (c.id) ids.push(c.id);
            }
        }
        return ids;
    }, [triggerGroups]);

    const getForm = useCallback((conditionInstanceId: string): ConditionFormHandle | undefined => {
        return registryRef.current.get(conditionInstanceId);
    }, []);

    const getAllPlaygroundValues = useCallback((): Record<string, unknown> => {
        const ids = getPlaygroundConditionIds();
        const out: Record<string, unknown> = {};
        for (const id of ids) {
            const form = registryRef.current.get(id);
            if (form) out[id] = form.getValues();
        }
        return out;
    }, [getPlaygroundConditionIds]);

    const validateAllPlaygroundForms = useCallback(async (): Promise<boolean> => {
        const ids = getPlaygroundConditionIds();
        for (const id of ids) {
            const form = registryRef.current.get(id);
            if (form) {
                const valid = await form.validate();
                if (!valid) return false;
            }
        }
        return true;
    }, [getPlaygroundConditionIds]);

    /** Helper: check if a value is meaningful (for validating Redux values when form isn't registered) */
    const isValueMeaningful = useCallback((val: unknown): boolean => {
        if (val === null || val === undefined) return false;
        if (Array.isArray(val)) return val.length > 0 && val.some((item) => isValueMeaningful(item));
        if (typeof val === 'string') return val.trim() !== '';
        return true; // number, boolean, object
    }, []);

    /** Validate a condition's Redux values when form isn't registered yet */
    const validateConditionFromRedux = useCallback(
        (condition: any): boolean => {
            // Check if fieldValue is set and meaningful
            if (condition.fieldValue !== undefined && condition.fieldValue !== null) {
                if (Array.isArray(condition.fieldValue)) {
                    if (
                        condition.fieldValue.length > 0 &&
                        condition.fieldValue.some((item: unknown) => isValueMeaningful(item))
                    )
                        return true;
                } else if (typeof condition.fieldValue === 'string') {
                    if (condition.fieldValue.trim() !== '') return true;
                } else {
                    return true; // number, boolean, object
                }
            }

            // Check if compositeValues has meaningful data
            if (condition.compositeValues && typeof condition.compositeValues === 'object') {
                const values = Object.values(condition.compositeValues);
                if (values.length > 0) {
                    return values.some((val) => isValueMeaningful(val));
                }
            }

            return false;
        },
        [isValueMeaningful],
    );

    /** Run each condition's form validator and return a map conditionId -> valid. 
     * For conditions without registered forms, validates based on Redux values. */
    const validateEachPlaygroundForm = useCallback(async (): Promise<Record<string, boolean>> => {
        const result: Record<string, boolean> = {};

        // Find all conditions from triggerGroups to validate those without forms
        const allConditions: Array<{ id: string; condition: any }> = [];
        for (const group of triggerGroups) {
            for (const c of group.conditions || []) {
                if (c.id) allConditions.push({ id: c.id, condition: c });
            }
        }

        await Promise.all(
            allConditions.map(async ({ id, condition }) => {
                const form = registryRef.current.get(id);
                if (form) {
                    // Use form validator when available
                    result[id] = await form.validate();
                } else {
                    // Fallback: validate from Redux values when form isn't registered yet
                    result[id] = validateConditionFromRedux(condition);
                }
            }),
        );

        return result;
    }, [triggerGroups, validateConditionFromRedux]);

    return {
        register,
        unregister,
        getForm,
        getPlaygroundConditionIds,
        getAllPlaygroundValues,
        validateAllPlaygroundForms,
        validateEachPlaygroundForm,
    };
}
