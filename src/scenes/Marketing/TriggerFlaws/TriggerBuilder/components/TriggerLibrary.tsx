import React, { useMemo, useState } from 'react';
import {
    MarketingConditionSchema,
    filterGroupedConditions,
    groupMarketingConditions,
} from '@/data/Marketing/MarketingCondition';
import { useDraggable } from '@dnd-kit/core';
import { RadixInput, RadixAccordion, RadixAccordionGroup, RadixCard } from '@/components/radix';
import SearchIcon from '@/assets/Marketing/SearchIcon.svg';
import { t } from 'i18next';

interface TriggerLibraryProps {
    onConditionSelect?: (condition: MarketingConditionSchema) => void;
    clickToAdd?: boolean; // If true, clicking adds condition instead of dragging
}

interface DraggableTriggerItemProps {
    condition: MarketingConditionSchema;
    index: number;
    onConditionSelect?: (condition: MarketingConditionSchema) => void;
    clickToAdd?: boolean;
}

function DraggableTriggerItem({ condition, index, onConditionSelect, clickToAdd }: DraggableTriggerItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `library-${condition.condition_render_id}-${condition.field}`,
        data: {
            type: 'condition',
            condition,
        },
        disabled: clickToAdd, // Disable drag when click-to-add is enabled
    });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;

    const handleClick = () => {
        if (clickToAdd && onConditionSelect) {
            onConditionSelect(condition);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(!clickToAdd ? { ...listeners, ...attributes } : {})}
            onClick={handleClick}
            className={`bg-[#f6f6f6] flex flex-col p-2 rounded-[6px] transition-all ${
                clickToAdd ? 'cursor-pointer hover:bg-primary-50' : 'cursor-move'
            } ${isDragging ? 'opacity-50' : 'hover:bg-background-subtle'}`}
        >
            <p className="text-sm text-text-primary font-normal m-0 p-0 line-clamp-1 mb-1">
                {index}. {condition.condition_label}
            </p>
            <p className="text-xs text-text-secondary font-normal m-0 p-0 line-clamp-2">{condition.description}</p>
        </div>
    );
}

export default function TriggerLibrary({ onConditionSelect, clickToAdd = false }: TriggerLibraryProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Group conditions by group_name and sort by group_sequence
    // Filter out conditions with condition_render_id: 0 (no renderer)
    const groupedConditions = useMemo(() => groupMarketingConditions(), []);

    // Filter conditions based on search
    const filteredGroups = useMemo(
        () => filterGroupedConditions(groupedConditions, searchQuery),
        [groupedConditions, searchQuery],
    );

    // Check if we're in drawer mode (clickToAdd means mobile drawer)
    const isInDrawer = clickToAdd;

    const content = (
        <>
            {/* Title - only show when in drawer mode */}
            {isInDrawer && (
                <h2 className="text-lg font-semibold text-text-primary mb-4">{t('Marketing.TriggerLibrary')}</h2>
            )}

            {/* Search Bar */}
            <div className={isInDrawer ? 'mb-4' : 'my-3'}>
                <RadixInput
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('Marketing.SearchTrigger')}
                    className="w-full text-text-secondary placeholder:text-text-secondary shadow-none focus:ring-0"
                    startIcon={<img src={SearchIcon} alt="Search" className="w-3.5 h-3.5" />}
                />
            </div>

            {/* Accordion Groups */}
            <div className="flex-1 overflow-y-auto scrollbar-hidden pb-20 md:pb-0">
                <RadixAccordionGroup type="multiple" defaultValue={['CustomerProfile']} className="flex flex-col gap-2">
                    {filteredGroups.map(({ groupName, groupLabel, conditions }) => {
                        const groupKey = groupName.replace(/\s+/g, '');
                        return (
                            <RadixAccordion
                                key={groupName}
                                value={groupKey}
                                asItem={true}
                                className="border border-border-default rounded-[6px] overflow-hidden"
                                triggerClassName="data-[state=open]:rounded-t-[6px] data-[state=open]:rounded-b-none py-0.5 text-sm"
                                contentClassName="p-0"
                                titleClassName="flex-1"
                                title={
                                    <div className="flex items-center justify-between w-full">
                                        <p className=" text-text-primary">{groupLabel}</p>
                                        <div className="bg-primary-500 rounded-full size-4 flex items-center justify-center mr-2">
                                            <p className="text-xs text-text-inverse font-normal">{conditions.length}</p>
                                        </div>
                                    </div>
                                }
                            >
                                <div className="flex flex-col gap-1.5 ">
                                    {conditions.map((condition, idx) => (
                                        <DraggableTriggerItem
                                            key={`${condition.condition_render_id}-${condition.field}`}
                                            condition={condition}
                                            index={idx + 1}
                                            onConditionSelect={onConditionSelect}
                                            clickToAdd={clickToAdd}
                                        />
                                    ))}
                                </div>
                            </RadixAccordion>
                        );
                    })}
                </RadixAccordionGroup>
            </div>
        </>
    );

    // Use RadixCard wrapper for desktop, plain div for drawer
    if (isInDrawer) {
        return <div className="h-full flex flex-col px-2 md:px-4 md:py-6">{content}</div>;
    }

    return (
        <RadixCard
            className="h-full flex flex-col !px-0 md:!px-4 rounded-t-none rounded-bl-none"
            title={t('Marketing.TriggerLibrary')}
            titleClassName="text-lg font-medium m-0 p-0 mt-2"
            descriptionClassName="text-sm"
        >
            {content}
        </RadixCard>
    );
}
