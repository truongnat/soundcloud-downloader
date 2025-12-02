import { useState, useEffect } from "react";
import { useUrlState } from "@/lib/use-url-state";

export function useHomeTabs(defaultTab: string = "soundcloud") {
    const { getQueryParam, setQueryParam } = useUrlState();
    const [activeTab, setActiveTab] = useState(() => getQueryParam("service") || defaultTab);

    useEffect(() => {
        setQueryParam("service", activeTab);
    }, [activeTab, setQueryParam]);

    return {
        activeTab,
        setActiveTab
    };
}
