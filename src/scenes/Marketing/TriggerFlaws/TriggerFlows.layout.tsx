import { Outlet } from 'react-router-dom';

export default function TriggerFlowsLayout() {
    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <Outlet />
        </div>
    );
}
